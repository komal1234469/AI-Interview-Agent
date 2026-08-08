"use strict";

// Deterministic, still-personalized question/follow-up/feedback generation.
// Used whenever no LLM key is configured, or as a safety net if an LLM call fails.

function pick(arr, seed) {
  if (!arr.length) return "";
  return arr[seed % arr.length];
}

function primaryQuestion(stop, candidate) {
  const obj = stop.objectives?.[0] || stop.title;
  const tool = stop.tools?.[0];

  switch (stop.angle) {
    case "gap":
      return `On Day ${stop.day} ("${stop.title}") your records show a few unsuccessful attempts before this stopped appearing as passed. In your own words, walk me through ${obj.toLowerCase()}. What made this concept tricky at first?`;
    case "backfill":
      return `I notice "${stop.title}" (Day ${stop.day}) was marked as skipped in your cohort progress. Have you since picked up ${stop.title.toLowerCase()} elsewhere? Explain the core idea as if teaching it to a new engineer.`;
    case "depth":
      return `You passed "${stop.title}" (Day ${stop.day}) after ${stop.attempts} attempts. Talk me through what changed between your first attempt and the one that worked${tool ? `, and where ${tool} fit in` : ""}.`;
    case "stretch":
      return `You breezed through "${stop.title}" (Day ${stop.day}) on the first try. Let's go a level deeper — what's a real edge case or failure mode in ${stop.title.toLowerCase()} that a lot of people miss${tool ? `, particularly when using ${tool}` : ""}?`;
    case "challenge": {
      const a = stop.from?.title || "an earlier topic";
      const b = stop.to?.title || "another topic";
      return `You're handling this well, so let's raise the difficulty. Imagine you had to design a system that combines "${a}" and "${b}" for a production healthcare use case with strict latency and privacy requirements. Walk me through the architecture and the biggest risk you'd design around first.`;
    }
    case "synthesis":
    default:
      return `Thinking about your capstone project, how did the concepts from earlier in the cohort (embeddings, agents, deployment) come together in what you built? What engineering decision are you most proud of, and what would you change?`;
  }
}

const CLARIFY_FOLLOWUPS = [
  "Can you make that more concrete — walk me through it with a specific example?",
  "Let's slow down on one part of that: what exactly happens at the step where the data leaves your application and hits the model or database?",
  "If I asked you to explain that to a non-technical stakeholder in two sentences, what would you say?",
];

const DEPTH_FOLLOWUPS = [
  "Good — now, what's the biggest trade-off in that approach, and when would you choose a different one?",
  "What would break first if you scaled that 10x in traffic or data size, and how would you notice?",
  "Suppose that approach failed in production. What's your first debugging move?",
  "How does that compare to the main alternative approach, and why did you pick this one?",
];

function shortOrVague(answer) {
  if (!answer) return true;
  const words = answer.trim().split(/\s+/).filter(Boolean);
  if (words.length < 12) return true;
  const vague = /\b(not sure|don'?t (know|remember)|no idea|maybe|i guess|not really)\b/i;
  return vague.test(answer);
}

function followUpQuestion(stop, previousAnswer, seed) {
  if (shortOrVague(previousAnswer)) {
    return pick(CLARIFY_FOLLOWUPS, seed);
  }
  return pick(DEPTH_FOLLOWUPS, seed);
}

function heuristicFeedback(candidate, transcript, plan) {
  const strengths = [];
  const gaps = [];
  const next = [];

  const vagueCount = transcript.filter((t) => shortOrVague(t.answer)).length;
  const totalAnswers = transcript.length;

  for (const stop of plan) {
    const related = transcript.filter((t) => t.day === stop.day);
    const vagueHere = related.some((t) => shortOrVague(t.answer));
    if (stop.angle === "stretch" && !vagueHere) {
      strengths.push(`Strong command of ${stop.title} (Day ${stop.day}), including reasoning beyond the basics.`);
    }
    if ((stop.angle === "gap" || stop.angle === "backfill") && vagueHere) {
      gaps.push(`${stop.title} (Day ${stop.day}) still shows gaps — answers were short or uncertain.`);
      next.push(`Revisit Day ${stop.day} ("${stop.title}") objectives and rebuild a small example from scratch.`);
    }
    if (stop.angle === "depth" && !vagueHere) {
      strengths.push(`Recovered well on ${stop.title} (Day ${stop.day}) — multiple attempts turned into real understanding.`);
    }
  }

  if (!strengths.length) {
    strengths.push("Engaged consistently with follow-up questions and attempted to reason through each topic.");
  }
  if (!gaps.length) {
    gaps.push("No major conceptual gaps surfaced; focus on articulating trade-offs faster under interview pressure.");
  }
  if (!next.length) {
    next.push("Practice explaining system design decisions (RAG, agents, deployment) out loud in under 90 seconds each.");
  }

  const clarityNote =
    vagueCount / Math.max(totalAnswers, 1) > 0.4
      ? "Several answers were brief or uncertain — this is the area to prioritize before a real interview."
      : "Most answers were substantive and example-driven.";

  return {
    summary: `${candidate.member.name} completed a ${plan.length}-topic technical interview spanning ${new Set(
      plan.map((p) => p.day)
    ).size} curriculum days. ${clarityNote}`,
    strengths: strengths.slice(0, 5),
    gaps: gaps.slice(0, 5),
    next: next.slice(0, 5),
  };
}

module.exports = { primaryQuestion, followUpQuestion, heuristicFeedback, shortOrVague };
