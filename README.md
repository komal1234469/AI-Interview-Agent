# AI Interview Agent — The AI Cohort

A conversational technical interview agent that builds a **personalized interview plan** from a
candidate's real progress through the 31-day AI Cohort curriculum, conducts it as a multi-turn
conversation with adaptive follow-ups, and produces structured, evidence-based feedback at the end.

## Quick start

```bash
npm install
cp .env.example .env      # optional — see "LLM mode" below
npm start                 # http://localhost:3000
```

Open `http://localhost:3000` for a small built-in chat UI that lets you pick any of the 20 sample
candidates and run a live interview against the real API. This UI is a convenience for
demoing/testing — the graded surface is the HTTP API below.

## The API (per the technical spec)

Single endpoint: `POST /api/interview`

**Turn 1 — start a session**
```json
{ "sessionId": "abc-123", "candidate": { ...candidate.json entry... } }
```
→ `{ "reply": "...", "done": false }`

**Turn 2+ — answer**
```json
{ "sessionId": "abc-123", "message": "candidate's answer" }
```
→ `{ "reply": "...", "done": false }`

**Final turn**
```json
{
  "reply": "Interview completed. ...",
  "done": true,
  "feedback": {
    "summary": "...", "strengths": [...], "gaps": [...], "next": [...],
    "topicScores": [{ "day": 12, "title": "Prompt Engineering Fundamentals", "score": 4.5 }, ...],
    "readinessScore": 4.2,
    "readinessLabel": "Interview-ready"
  }
}
```

Every response (not just the final one) also includes a `progress` object — this is additive and
outside the spec's minimum fields, so it's safe to ignore if you only need the required contract:
```json
"progress": {
  "questionsAsked": 5, "topicsCompleted": 2, "totalTopics": 6,
  "distinctDaysCovered": 2, "currentTopic": { "day": 22, "title": "...", "angle": "depth" },
  "elapsedSeconds": 96
}
```

## How personalization works (`src/interviewPlanner.js`)

Rather than asking generic questions, the agent reads each candidate's `missions` array and
classifies every completed curriculum day into one of four signals:

| Signal | Meaning | Interview angle |
|---|---|---|
| `failed` | attempted, never passed | probe for a real conceptual gap |
| `skipped` | never attempted | check if they backfilled the knowledge elsewhere |
| `struggled` | passed, but took 4+ attempts | check whether it became real mastery or was trial-and-error |
| `strong` | passed on the first try | push past basics into edge cases and trade-offs |

The planner picks a spread across these buckets (prioritizing gaps and skips first, since those are
the most diagnostic), always spans **≥ 4 distinct curriculum days**, and closes on the Day 31
capstone for a synthesis question. Each stop generates a primary question **and** one adaptive
follow-up, so a typical plan of 5-6 stops yields 10-12 questions — comfortably above the 8-question
minimum.

## Adaptive follow-ups

After every primary answer, the agent decides the follow-up based on the answer itself:
- Short, vague, or uncertain answers → a clarifying question that forces a concrete example.
- Specific, confident answers → a deeper question about trade-offs, failure modes, scaling, or
  alternative approaches.

## Live scoring & the adaptive challenge round

Every completed topic (primary answer + follow-up) is scored 1-5 in real time
(`src/scoring.js`) using answer length, specificity, mentions of the day's actual tools, and
reasoning language ("because", "trade-off", "compared to", etc.) — no LLM call needed, so this
works instantly even in template-fallback mode.

If a candidate's last two topic scores average **≥ 4.2**, the agent dynamically inserts a **bonus
"System Design Challenge"** stop into the plan: a harder, cross-topic question that asks the
candidate to connect two topics they've already handled well into one system design decision. This
only fires once per interview and is capped so the interview never runs away in length — it's the
agent rewarding strong performance with a harder bar, the same way a real interviewer would.

At the end, all topic scores roll up into a single **readiness score (1-5)** with a plain-language
label (e.g. "Interview-ready", "Needs focused practice"), alongside the qualitative
summary/strengths/gaps/next feedback.

## Live progress + downloadable report

Every response includes a `progress` object (questions asked, topics completed, distinct days
covered, current topic, elapsed time) so a UI can render a live progress bar and topic chip without
extra polling. The bundled demo UI (`public/index.html`) uses this for a progress bar, a pulsing
"currently discussing" chip, a running timer, animated typing indicators, per-topic score bars on
the results screen, and a one-click **downloadable Markdown report**. There's also a
`GET /api/interview/:sessionId/report` endpoint that returns the full transcript, scores, and
feedback as JSON for any external tooling.

## LLM mode vs. offline template mode

If `ANTHROPIC_API_KEY` is set (`.env`), the agent uses Claude (`src/llm.js`) to generate every
question, follow-up, and the final feedback in natural language, grounded in the candidate's
curriculum data and the running transcript.

If no key is set, the agent automatically falls back to a deterministic template engine
(`src/questionTemplates.js`) that is still personalized (it uses the same day/angle/rationale data)
so the **API and demo remain fully functional with zero external dependencies** — useful for
judging environments without shipping API keys. The same fallback also protects any single LLM call
that errors mid-interview, so a flaky API never breaks a session.

## Project structure

```
server.js                  Express app, the required /api/interview endpoint, session state machine
src/interviewPlanner.js    Builds the personalized question plan from candidate + curriculum data
src/llm.js                 Claude API wrapper (question / follow-up / feedback generation) + fallback
src/questionTemplates.js   Deterministic offline generator (questions, follow-ups, feedback)
src/sessionStore.js        In-memory session store (per spec, no persistence required)
data/                      Provided curriculum.json and candidates.json
public/index.html          Minimal demo chat UI (not part of the graded contract)
```

## Out of scope (per spec, intentionally not implemented)

Voice interaction, authentication, persistent accounts, long-term history, mobile apps.
