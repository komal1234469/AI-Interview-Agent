# 🤖 AI Interview Agent — The AI Cohort

An AI-powered technical interview platform that conducts **personalized mock interviews** based on a candidate's real progress through the 31-day AI Cohort curriculum.

The system analyzes candidate progress, identifies strengths and knowledge gaps, creates a personalized interview plan, conducts a multi-turn adaptive interview, evaluates responses, and generates structured feedback.

The platform also includes **Ask AI, interview history, downloadable reports, authentication, profile management, Google Sign-Up/Login, password recovery, light/dark mode, live progress tracking, and Render deployment**.

---

## 🌐 Live Demo

The application is deployed on **Render** and can be accessed online:

### 🔗 Live Application

**https://ai-interview-agent-y4cl.onrender.com**

You can open the above link directly in a browser and use the application without running it locally.

---

## 💻 Run Locally

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file if required:

```bash
cp .env.example .env
```

Add the required API keys/configuration to `.env`.

### 3. Start the application

```bash
npm start
```

The application will run at:

```text
http://localhost:3000
```

The same application can therefore be used both:

* Locally → `http://localhost:3000`
* Online → `https://ai-interview-agent-y4cl.onrender.com`

---

# ✨ Features

## 🔐 Authentication

The application provides a complete authentication interface with:

* Sign Up
* Log In
* Google Sign-Up / Login
* Forgot Password
* Logout
* User session handling

### Forgot Password

The application includes a password recovery flow with a verification-code step.

**Important:** In the current implementation, the verification code is handled within the application for demonstration purposes. A real email/SMS OTP delivery service is **not currently configured**.

---

# 👤 Profile Management

After logging in, users can manage their profile.

Users can:

* View their profile
* Edit profile information
* Update candidate information
* Save profile changes
* Log out

The candidate profile can be used by the interview system when creating the personalized interview experience.

---

# 🎤 Personalized AI Mock Interview

The core feature of the application is a personalized technical mock interview.

Instead of asking every candidate the same generic questions, the system uses the candidate's actual progress through the **31-day AI Cohort curriculum**.

The interview planner analyzes the candidate's mission history and identifies different performance signals.

| Signal      | Meaning                        | Interview Purpose                             |
| ----------- | ------------------------------ | --------------------------------------------- |
| `failed`    | Attempted but never passed     | Identify conceptual gaps                      |
| `skipped`   | Never attempted                | Check whether knowledge was learned elsewhere |
| `struggled` | Passed after multiple attempts | Check genuine understanding                   |
| `strong`    | Passed on the first attempt    | Test deeper knowledge and trade-offs          |

The planner prioritizes weaker areas while still testing strong areas.

---

# 🧠 Adaptive Interview

The interview is conducted as a multi-turn conversation.

The next question can change depending on the candidate's previous answer.

### If the answer is short or unclear

The system can ask:

* Clarifying questions
* Concrete examples
* Explanation-based questions

### If the answer is specific and confident

The system can move toward:

* Deeper technical concepts
* Trade-offs
* Failure modes
* Scaling
* Alternative approaches
* System design reasoning

This makes the interview adaptive instead of completely static.

---

# 🏆 Adaptive Challenge Round

When a candidate performs particularly well, the system can introduce a bonus:

### System Design Challenge

The challenge asks the candidate to connect multiple topics already discussed during the interview and reason about a larger engineering decision.

The challenge is dynamically inserted based on the candidate's performance and is limited so that the interview does not become unnecessarily long.

---

# 📊 Interview Scoring

Each completed topic is scored on a **1–5 scale**.

The scoring system considers factors such as:

* Answer length
* Specificity
* Technical terminology
* Relevant tools
* Reasoning
* Trade-offs
* Comparisons
* Explanation depth

The individual topic scores are combined into an overall readiness score.

### Example

```text
Readiness Score: 4.2 / 5
Readiness Label: Interview-ready
```

---

# 📝 Interview Feedback

After completing an interview, the application generates structured feedback.

The final report includes:

* Summary
* Strengths
* Knowledge gaps
* Recommended next steps
* Topic-wise scores
* Overall readiness score
* Readiness label

Example readiness labels can include:

```text
Interview-ready
Needs focused practice
```

The feedback is designed to help candidates understand **what they know, where they need improvement, and what they should practice next**.

---

# 📈 Live Interview Progress

The application provides live interview progress while the interview is running.

It can display:

* Questions asked
* Topics completed
* Total topics
* Distinct curriculum days covered
* Current topic
* Current discussion indicator
* Running interview timer
* Topic progress
* Live score information

This gives the candidate a clear view of their interview progress.

---

# 🤖 Ask AI

The application includes a separate **Ask AI** feature.

Users can ask questions outside the structured interview.

Ask AI provides a dedicated interface for:

* Technical questions
* Concept explanations
* General questions
* AI-generated answers

Ask AI is separate from the structured mock interview workflow.

---

# 📜 Interview History

Completed interviews can be accessed through the **Report History** section.

Users can return to previous interview results and review their performance.

The history allows users to keep track of their previous interview reports and feedback.

---

# 📥 Download Interview Report

After completing an interview, users can download their interview report.

The downloadable report contains important interview results such as:

* Interview summary
* Strengths
* Knowledge gaps
* Recommended next steps
* Topic scores
* Readiness score
* Readiness level

This allows candidates to save their interview results for future preparation and review.

---

# 🌙 Light & Dark Mode

The application supports:

* 🌙 Dark Mode
* ☀️ Light Mode

The selected theme is remembered by the application so that the user's preferred appearance can be maintained.

---

# 🧠 Personalization System

The interview planner reads the candidate's mission history and classifies curriculum progress into four major signals.

## Failed

The candidate attempted the mission but never successfully completed it.

**Purpose:** Probe for the underlying conceptual gap.

## Skipped

The candidate never attempted the mission.

**Purpose:** Check whether the candidate learned the topic elsewhere.

## Struggled

The candidate eventually passed but required multiple attempts.

**Purpose:** Determine whether the candidate developed genuine understanding or relied on trial and error.

## Strong

The candidate passed on the first attempt.

**Purpose:** Move beyond basic knowledge and test edge cases, reasoning, and trade-offs.

---

# 🧩 Interview Planning Process

The interview planner follows this general workflow:

```text
Candidate Progress
       ↓
Mission History Analysis
       ↓
Strength & Gap Identification
       ↓
Personalized Topic Selection
       ↓
Primary Questions
       ↓
Adaptive Follow-ups
       ↓
Live Scoring
       ↓
Adaptive Challenge
       ↓
Final Feedback
       ↓
Downloadable Report
       ↓
Interview History
```

The planner also ensures that the interview covers a spread of curriculum topics rather than repeatedly focusing on one area.

---

# 🤖 LLM Mode

When the required LLM API key is configured, the application can use the LLM integration to generate:

* Interview questions
* Adaptive follow-up questions
* Final interview feedback

The generated content is grounded in the candidate's curriculum information and interview conversation.

---

# ⚡ Offline Template / Fallback Mode

The application also supports a deterministic fallback mode.

If the required LLM API key is unavailable, the system can use predefined question templates based on:

* Curriculum day
* Topic
* Interview angle
* Candidate progress
* Interview context

This keeps the core interview functionality usable even without an external LLM call.

The fallback also helps protect the interview from individual LLM/API failures.

---

# 🔌 API

The primary interview API is:

```http
POST /api/interview
```

---

## Start an Interview

### Request

```json
{
  "sessionId": "abc-123",
  "candidate": {
    "...": "candidate data"
  }
}
```

### Response

```json
{
  "reply": "...",
  "done": false,
  "progress": {
    "questionsAsked": 1,
    "topicsCompleted": 0,
    "totalTopics": 6,
    "distinctDaysCovered": 1,
    "currentTopic": {
      "day": 12,
      "title": "Prompt Engineering Fundamentals",
      "angle": "depth"
    },
    "elapsedSeconds": 12
  }
}
```

---

## Continue an Interview

### Request

```json
{
  "sessionId": "abc-123",
  "message": "Candidate's answer"
}
```

The server returns the next adaptive question along with updated progress.

---

## Final Interview Response

When the interview is complete:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": [],
    "topicScores": [],
    "readinessScore": 4.2,
    "readinessLabel": "Interview-ready"
  }
}
```

---

# 📄 Interview Report API

A completed interview report can also be retrieved through:

```http
GET /api/interview/:sessionId/report
```

This endpoint can provide the interview transcript, scores, and feedback for external tools or integrations.

---

# 📁 Project Structure

```text
AI-Interview-Agent/
│
├── server.js
│
├── src/
│   ├── interviewPlanner.js
│   ├── llm.js
│   ├── questionTemplates.js
│   ├── scoring.js
│   └── sessionStore.js
│
├── data/
│   ├── curriculum.json
│   └── candidates.json
│
├── public/
│   └── index.html
│
├── .env.example
├── package.json
└── README.md
```

### Main Components

| File                   | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `server.js`            | Express server and API routes              |
| `interviewPlanner.js`  | Personalized interview planning            |
| `llm.js`               | LLM question/follow-up/feedback generation |
| `questionTemplates.js` | Offline fallback questions                 |
| `scoring.js`           | Interview scoring                          |
| `sessionStore.js`      | Interview session management               |
| `curriculum.json`      | AI Cohort curriculum data                  |
| `candidates.json`      | Candidate progress data                    |
| `public/index.html`    | Complete web application interface         |

---

# 🛠️ Technologies Used

The project is built using:

* **HTML5**
* **CSS3**
* **JavaScript**
* **Node.js**
* **Express.js**
* **REST APIs**
* **LLM API integration**
* **JSON**
* **Browser-based session/storage**
* **Render**

---

# ☁️ Deployment

The application is deployed on **Render**.

### Production / Live

```text
https://ai-interview-agent-y4cl.onrender.com
```

### Local Development

```text
http://localhost:3000
```

The same project can therefore be tested locally and accessed publicly through the Render deployment.

---

# 🔄 Complete User Workflow

```text
Open Application
       ↓
Sign Up / Log In
       ↓
Google Login (optional)
       ↓
Candidate Profile
       ↓
Start Mock Interview
       ↓
Personalized Interview Plan
       ↓
Adaptive Technical Questions
       ↓
Candidate Answers
       ↓
Adaptive Follow-ups
       ↓
Live Scoring
       ↓
Bonus Challenge (when applicable)
       ↓
Interview Completed
       ↓
Feedback & Readiness Score
       ↓
Download Report
       ↓
Report History
```

Users can also independently use:

```text
Login
  ↓
Ask AI
  ↓
Ask Questions
  ↓
Receive AI Answers
```

---

# 🎯 Project Objective

The goal of **AI Interview Agent** is to provide a more realistic and personalized interview preparation experience than traditional generic question banks.

Instead of asking every candidate the same questions, the platform analyzes the candidate's learning journey and attempts to determine:

> **What does the candidate know, where did they struggle, how well can they explain technical concepts, and are they ready to defend their knowledge in a real interview?**

The platform combines:

* Personalized interview planning
* Adaptive AI questioning
* Real-time scoring
* Structured feedback
* Interview history
* Downloadable reports
* AI-powered Q&A
* User authentication
* Profile management

into a single end-to-end technical interview preparation platform.

---

# 👥 Team

## The AI Cohort — Root Access Team

Built as an AI-powered technical interview and assessment platform.
