"use strict";

const { shortOrVague } = require("./questionTemplates");

/**
 * Score a single answer 1-5 using cheap, deterministic heuristics.
 * Used for the live progress bar / topic chips (needs to be instant, no LLM round trip)
 * and as the fallback when no LLM key is configured.
 */
function scoreSingleAnswer(answerText, stop) {
  if (!answerText) return 1;
  if (shortOrVague(answerText)) return 2;

  const words = answerText.trim().split(/\s+/).filter(Boolean).length;
  let score = 3;

  if (words >= 40) score += 1;
  if (words >= 90) score += 0.5;

  // Reward mentioning the actual tools/concepts for this day — signals grounded, specific recall
  const haystack = answerText.toLowerCase();
  const toolHits = (stop.tools || []).filter((t) => haystack.includes(t.toLowerCase())).length;
  if (toolHits >= 1) score += 0.5;
  if (toolHits >= 2) score += 0.5;

  // Reward reasoning language (trade-offs, comparisons, causality) — signals depth, not just recall
  if (/\b(because|trade-?off|however|instead|compared to|versus|vs\.?|alternative|scal(e|ing)|fail(s|ure)?)\b/i.test(answerText)) {
    score += 0.5;
  }

  return Math.max(1, Math.min(5, Math.round(score * 2) / 2));
}

/**
 * Score a full topic (primary answer + follow-up answer) as the average, rounded to 1 decimal.
 */
function scoreTopic(stop, qaPairs) {
  const scores = qaPairs.map((qa) => scoreSingleAnswer(qa.answer, stop));
  const avg = scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
  return Math.round(avg * 10) / 10;
}

function readinessLabel(avgScore) {
  if (avgScore >= 4.3) return "Interview-ready";
  if (avgScore >= 3.5) return "Mostly ready, some polish needed";
  if (avgScore >= 2.5) return "Needs focused practice";
  return "Not yet ready — revisit fundamentals";
}

module.exports = { scoreSingleAnswer, scoreTopic, readinessLabel };
