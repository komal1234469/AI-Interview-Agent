"use strict";

const curriculum = require("../data/curriculum.json");

const dayById = new Map(curriculum.days.map((d) => [d.day, d]));

function moduleForDay(day) {
  const m = curriculum.modules.find((m) => day >= m.days[0] && day <= m.days[1]);
  return m ? m.title : "General";
}

/**
 * Classify each mission the candidate attempted/skipped into a signal
 * bucket that drives *why* we'd want to ask about it in an interview.
 */
function classifyMissions(candidate) {
  const buckets = {
    failed: [], // attempted, never passed -> probe for real understanding / gaps
    struggled: [], // passed, but took many attempts -> probe depth, was it luck or mastery
    skipped: [], // skipped entirely -> probe whether they backfilled the knowledge
    strong: [], // passed quickly -> push for deeper / edge-case reasoning
  };

  for (const m of candidate.missions || []) {
    const day = dayById.get(m.day);
    if (!day) continue;
    const entry = { ...m, day: day };

    if (m.skipped) {
      buckets.skipped.push(entry);
    } else if (m.passed === false) {
      buckets.failed.push(entry);
    } else if (m.passed === true && (m.attempts || 1) >= 4) {
      buckets.struggled.push(entry);
    } else if (m.passed === true) {
      buckets.strong.push(entry);
    }
  }
  return buckets;
}

/**
 * Build an ordered interview plan: a list of "stops", each anchored to
 * one curriculum day, each carrying a rationale (why we're asking) and
 * a difficulty/angle tag that later drives question + follow-up generation.
 *
 * Guarantees: covers >= 4 distinct days, produces >= 8 question slots
 * once primary + adaptive follow-up are counted (2 per stop x 4 stops = 8 min).
 */
function buildInterviewPlan(candidate) {
  const buckets = classifyMissions(candidate);
  const plan = [];
  const usedDays = new Set();

  const push = (entry, angle, rationale) => {
    if (!entry || usedDays.has(entry.day.day)) return;
    usedDays.add(entry.day.day);
    plan.push({
      day: entry.day.day,
      title: entry.day.title,
      module: moduleForDay(entry.day.day),
      tools: entry.day.tools || [],
      objectives: entry.day.objectives || [],
      attempts: entry.attempts,
      skipped: !!entry.skipped,
      passed: entry.passed,
      angle, // 'gap' | 'depth' | 'backfill' | 'stretch' | 'synthesis'
      rationale,
    });
  };

  // Priority 1: things that failed -> understand real gaps (max 2)
  buckets.failed
    .slice()
    .sort((a, b) => b.day.day - a.day.day)
    .slice(0, 2)
    .forEach((e) =>
      push(
        e,
        "gap",
        `Did not pass "${e.day.title}" after ${e.attempts} attempt(s) — checking for a real conceptual gap vs. an execution slip.`
      )
    );

  // Priority 2: skipped topics -> did they backfill the knowledge elsewhere? (max 2)
  buckets.skipped
    .slice()
    .sort((a, b) => a.day.day - b.day.day)
    .slice(0, 2)
    .forEach((e) =>
      push(
        e,
        "backfill",
        `Skipped "${e.day.title}" during the cohort — checking whether they picked up the concept some other way.`
      )
    );

  // Priority 3: struggled but passed -> probe whether it was mastery or trial-and-error (max 2)
  buckets.struggled
    .slice()
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 3)
    .forEach((e) =>
      push(
        e,
        "depth",
        `Passed "${e.day.title}" but needed ${e.attempts} attempts — probing whether the underlying concept is now solid.`
      )
    );

  // Priority 4: strong, first-try topics -> push for deeper/edge-case reasoning
  buckets.strong
    .slice()
    .sort((a, b) => b.day.day - a.day.day)
    .forEach((e) =>
      push(
        e,
        "stretch",
        `Passed "${e.day.title}" on the first try — pushing past the basics into edge cases and trade-offs.`
      )
    );

  // Ensure at least 4-6 distinct days by backfilling from any remaining missions
  if (plan.length < 5) {
    for (const m of candidate.missions || []) {
      if (plan.length >= 6) break;
      const day = dayById.get(m.day);
      if (!day || usedDays.has(m.day)) continue;
      push({ ...m, day }, m.passed ? "stretch" : "gap", `Additional coverage of "${day.title}".`);
    }
  }

  // Cap plan length so the interview stays a reasonable size (5-6 stops * 2 Qs = 10-12 Qs)
  const trimmed = plan.slice(0, 6);

  // Always try to close on the capstone (day 31) for a synthesis question if not already included
  if (!usedDays.has(31)) {
    const cap = candidate.missions?.find((m) => m.day === 31);
    const capDay = dayById.get(31);
    if (cap && capDay) {
      trimmed.push({
        day: 31,
        title: capDay.title,
        module: moduleForDay(31),
        tools: capDay.tools || [],
        objectives: capDay.objectives || [],
        attempts: cap.attempts,
        skipped: !!cap.skipped,
        passed: cap.passed,
        angle: "synthesis",
        rationale: "Closing with the capstone to see how they connect concepts across the whole cohort.",
      });
    }
  }

  return trimmed;
}

/**
 * Build one extra "challenge round" stop when a candidate is performing strongly.
 * This is the adaptive-difficulty hook: it's only ever added mid-interview, once,
 * and only if the running score justifies pushing further (see server.js).
 * It's a synthetic day (day: 0) that asks the candidate to connect two topics
 * they've already covered well, rather than re-testing a single curriculum day.
 */
function buildChallengeStop(coveredStops) {
  const [a, b] = coveredStops.slice(-2);
  return {
    day: 0,
    title: "System Design Challenge",
    module: "Cross-cutting",
    tools: [...(a?.tools || []), ...(b?.tools || [])].slice(0, 4),
    objectives: [
      `Connect ${a?.title || "an earlier topic"} and ${b?.title || "another topic"} into one end-to-end design decision`,
    ],
    attempts: null,
    skipped: false,
    passed: null,
    angle: "challenge",
    rationale: "Candidate is performing strongly — raising the bar with a cross-topic system design question.",
    from: a,
    to: b,
  };
}

module.exports = { buildInterviewPlan, classifyMissions, dayById, moduleForDay, buildChallengeStop };
