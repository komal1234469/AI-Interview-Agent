"use strict";

require("dotenv").config({ path: "./.env.example" });
const express = require("express");
const cors = require("cors");
const path = require("path");

const { buildInterviewPlan, buildChallengeStop } = require("./src/interviewPlanner");
const llm = require("./src/llm");
const store = require("./src/sessionStore");
const scoring = require("./src/scoring");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const MIN_QUESTIONS = 8;
const CHALLENGE_SCORE_THRESHOLD = 4.2; // avg of last 2 topic scores needed to unlock the bonus round
const MAX_PLAN_LENGTH = 8; // hard ceiling even with a challenge round added

app.get("/health", (req, res) => {
  res.json({ status: "ok", llm: llm.hasLLM() ? "claude" : "template-fallback" });
});

// Convenience endpoints for the demo UI only — not part of the required contract.
app.get("/api/candidates", (req, res) => {
  const data = require("./data/candidates.json");
  res.json(data.candidates);
});

app.get("/api/interview/:sessionId/report", (req, res) => {
  const session = store.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "Session not found." });
  res.json({
    candidate: session.candidate.member,
    plan: session.plan.map((p) => ({ day: p.day, title: p.title, angle: p.angle })),
    transcript: session.transcript,
    topicScores: session.scores,
    done: session.done,
    feedback: session.feedback,
  });
});

app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Missing required field: question." });
    }
    const answer = await llm.answerFreeQuestion(question.trim());
    return res.json({ answer });
  } catch (err) {
    console.error("[server] /api/ask error:", err);
    return res.status(500).json({ answer: "Something went wrong on our end. Please retry." });
  }
});

app.post("/api/interview", async (req, res) => {
  try {
    const { sessionId, candidate, message } = req.body || {};

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ reply: "Missing required field: sessionId.", done: true });
    }

    // ---- Turn 1: start a new interview -------------------------------
    if (candidate) {
      return await startInterview(res, sessionId, candidate);
    }

    // ---- Turn 2+: conversation turn -----------------------------------
    const session = store.get(sessionId);
    if (!session) {
      return res.status(400).json({
        reply: "I don't have an active interview for this sessionId. Start a new interview by sending 'candidate' with your first request.",
        done: true,
      });
    }
    if (session.done) {
      return res.json({
        reply: "This interview has already finished. Thanks again for your time!",
        done: true,
        feedback: session.feedback,
      });
    }
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ reply: "Missing required field: message.", done: false });
    }

    return await continueInterview(res, session, message);
  } catch (err) {
    console.error("[server] Unhandled error:", err);
    return res.status(500).json({ reply: "Something went wrong on our end. Please retry.", done: false });
  }
});

function buildProgress(session) {
  const currentStop = session.plan[session.stopIndex];
  return {
    questionsAsked: session.questionCount,
    topicsCompleted: session.scores.length,
    totalTopics: session.plan.length,
    distinctDaysCovered: new Set(session.transcript.map((t) => t.day)).size,
    currentTopic: currentStop ? { day: currentStop.day, title: currentStop.title, angle: currentStop.angle } : null,
    elapsedSeconds: Math.round((Date.now() - session.createdAt) / 1000),
  };
}

async function startInterview(res, sessionId, candidate) {
  const plan = buildInterviewPlan(candidate);

  const session = store.create(sessionId, {
    candidate,
    plan,
    stopIndex: 0,
    stage: "primary",
    transcript: [],
    questionCount: 0,
    scores: [], // [{ day, title, score }]
    extended: false,
    pendingQuestion: null,
    pendingDay: null,
    stopStartIndex: 0, // index into transcript where the current stop's Q&A begins
    done: false,
    feedback: null,
  });

  const firstStop = plan[0];
  const question = await llm.generateQuestion(firstStop, candidate, []);
  const intro = `Welcome, ${candidate.member.name}. I've reviewed your progress through The AI Cohort and I'd like to talk through some of what you built. This will be a conversation — think out loud, and feel free to be specific about real trade-offs you hit.`;

  session.pendingQuestion = question;
  session.pendingDay = firstStop.day;
  store.save(sessionId, session);

  return res.json({ reply: `${intro}\n\n${question}`, done: false, progress: buildProgress(session) });
}

async function continueInterview(res, session, message) {
  const currentStop = session.plan[session.stopIndex];

  // Record the answer to whatever question was pending
  session.transcript.push({
    day: session.pendingDay,
    question: session.pendingQuestion,
    answer: message,
  });
  session.questionCount += 1;

  if (session.stage === "primary") {
    // Move to an adaptive follow-up on the SAME topic
    const followUp = await llm.generateFollowUp(currentStop, message, session.transcript);
    session.stage = "followup";
    session.pendingQuestion = followUp;
    session.pendingDay = currentStop.day;
    store.save(session.sessionId, session);
    return res.json({ reply: followUp, done: false, progress: buildProgress(session) });
  }

  // ---- stage === 'followup' -> this topic is complete: score it, then advance ----
  const topicQA = session.transcript.slice(session.stopStartIndex);
  const topicScore = scoring.scoreTopic(currentStop, topicQA);
  session.scores.push({ day: currentStop.day, title: currentStop.title, score: topicScore });
  session.stopStartIndex = session.transcript.length;

  session.stopIndex += 1;

  // ---- Adaptive difficulty: candidate is doing very well -> insert one bonus challenge round ----
  const recent = session.scores.slice(-2);
  const recentAvg = recent.reduce((a, b) => a + b.score, 0) / Math.max(recent.length, 1);
  const canExtend = !session.extended && session.plan.length < MAX_PLAN_LENGTH && session.scores.length >= 2;
  if (canExtend && recentAvg >= CHALLENGE_SCORE_THRESHOLD) {
    session.plan.splice(session.stopIndex, 0, buildChallengeStop(session.plan.slice(0, session.stopIndex)));
    session.extended = true;
  }

  const coveredDistinctDays = new Set(session.transcript.map((t) => t.day)).size;
  const nextStop = session.plan[session.stopIndex];
  const shouldWrapUp =
    !nextStop ||
    (session.questionCount >= MIN_QUESTIONS && coveredDistinctDays >= 4 && session.stopIndex >= session.plan.length);

  if (shouldWrapUp) {
    const llmFeedback = await llm.generateFeedback(session.candidate, session.transcript, session.plan);
    const readinessScore = Math.round((session.scores.reduce((a, b) => a + b.score, 0) / session.scores.length) * 10) / 10;

    const feedback = {
      ...llmFeedback,
      topicScores: session.scores,
      readinessScore,
      readinessLabel: scoring.readinessLabel(readinessScore),
    };

    session.done = true;
    session.feedback = feedback;
    session.pendingQuestion = null;
    session.pendingDay = null;
    store.save(session.sessionId, session);
    return res.json({
      reply: "Interview completed. Thanks for walking me through your work — here's your feedback.",
      done: true,
      feedback,
      progress: buildProgress(session),
    });
  }

  const nextQuestion = await llm.generateQuestion(nextStop, session.candidate, session.transcript);
  session.stage = "primary";
  session.pendingQuestion = nextQuestion;
  session.pendingDay = nextStop.day;
  store.save(session.sessionId, session);
  return res.json({ reply: nextQuestion, done: false, progress: buildProgress(session) });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Interview Agent listening on port ${PORT}`);
  console.log(`Mode: ${llm.hasLLM() ? "Claude-powered" : "template fallback (no ANTHROPIC_API_KEY set)"}`);
});

module.exports = app;
