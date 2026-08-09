# AI Usage Log — AI Interview Agent

This file documents the AI-assisted development and refinement process used for the **AI Interview Agent — The AI Cohort** project.

The project was developed iteratively with AI assistance for feature planning, implementation, debugging, UI refinement, documentation, and deployment-related improvements.

## AI Development Conversation

An additional shared AI development conversation is available here:

**Claude shared conversation:**  
https://claude.ai/share/e0ad3d55-1c13-4a39-b080-8dba0ceb411f

---

# Actual AI Prompts & Development Log

## 1. Website UI Scaling

### Actual Prompt
> Increase the size of everything on the website slightly. The text and other elements look too small. Increase the size of the entire website by 15%, including all elements, while keeping the existing design and functionality unchanged.

### Development Result
The website UI was globally increased while keeping the existing colors, design, layout, and functionality unchanged.

---

## 2. Ask AI Main Box Size

### Actual Prompt
> The main Ask AI box is much smaller than the other two main sections. Please increase its size slightly so that it looks more consistent with the other sections.

### Development Result
The Ask AI main section was adjusted so that its size is more consistent with the other main sections.

---

## 3. Global Scaling Adjustment

### Actual Prompt
> Instead of increasing the global size by 15%, how can I change it to 10%?

### Development Result
The global UI scaling was changed from 15% to 10%.

---

## 4. Font Size Refinement

### Actual Prompt
> I want the font size throughout the website to be 0.5px larger.

### Development Result
Existing font-size values were refined by approximately 0.5px where needed while preserving the existing design.

---

## 5. Application Features

### Actual Prompt
> The application has proper interview history, Ask AI is working, interviews are working, interview feedback is generated, reports can be downloaded, profiles can be edited, users can log out, sign up, use forgot password, and sign up with Google.

### Development Result
The project documentation was updated to accurately describe the implemented application features, including interview history, Ask AI, mock interviews, feedback, report download, profile editing, logout, sign up, forgot password, and Google sign-up/login.

---

## 6. Forgot Password Behavior

### Actual Prompt
> The Forgot Password feature does not send an OTP when I use it.

### Development Result
The documentation was corrected so it does not claim that a real email/SMS OTP is delivered. The current verification-code flow is handled within the application for demonstration purposes.

---

## 7. Complete README

### Actual Prompt
> Combine both versions into one complete README. Also mention that the application is available both locally and on Render. I will provide the Render link so anyone can access the application.

### Development Result
A complete README was prepared covering local setup, Render deployment, authentication, Ask AI, personalized interviews, feedback, history, downloadable reports, profile management, APIs, project structure, and the public live application.

### Live Render Application
https://ai-interview-agent-y4cl.onrender.com

### Local Application
http://localhost:3000

---

## 8. PROMPTS.md

### Actual Prompt
> Create a PROMPTS.md file containing the actual AI prompts and development log used during the project.

### Development Result
This PROMPTS.md file was created to document the AI-assisted development process and provide evidence of the prompts used during development.

---

# Core Project Development Prompts

## 9. Personalized AI Interview

### Prompt
> Build an AI Interview Agent that creates personalized technical interviews based on a candidate's real progress through the AI Cohort curriculum.

### Development Result
The application was designed around personalized technical interviews using candidate progress and curriculum information.

---

## 10. Interview Planning

### Prompt
> Create an interview planner that analyzes candidate mission history and identifies failed, skipped, struggled, and strong areas. Use these signals to create a personalized interview plan.

### Development Result
The interview planner uses candidate progress signals to select and prioritize interview topics.

---

## 11. Adaptive Interview Questions

### Prompt
> Make the interview adaptive. After every candidate answer, decide whether to ask a clarification question or a deeper technical question based on the quality of the answer.

### Development Result
Adaptive follow-up questions were added based on candidate responses.

Short, vague, or uncertain answers can lead to clarification questions, while strong and specific answers can lead to deeper questions about trade-offs, failure modes, scaling, or alternative approaches.

---

## 12. Interview Scoring

### Prompt
> Add real-time interview scoring from 1 to 5 based on answer quality, specificity, technical details, relevant tools, and reasoning.

### Development Result
Topic-level scoring and an overall readiness score were added.

The scoring process considers factors such as answer length, specificity, relevant technical tools, and reasoning language.

---

## 13. Adaptive Challenge Round

### Prompt
> If the candidate performs strongly, add a harder System Design Challenge that connects multiple topics.

### Development Result
A bonus System Design Challenge can be introduced for strong interview performance.

The challenge connects topics already discussed and provides a harder engineering/system-design decision.

---

## 14. Interview Feedback

### Prompt
> After the interview, generate structured feedback including summary, strengths, gaps, next steps, topic scores, readiness score, and readiness label.

### Development Result
Completed interviews produce structured feedback with:

- Summary
- Strengths
- Knowledge gaps
- Recommended next steps
- Topic scores
- Readiness score
- Readiness label

---

## 15. Ask AI

### Prompt
> Add an Ask AI feature where users can ask questions outside the structured interview.

### Development Result
A separate Ask AI interface was added so users can ask technical or general questions independently of the structured mock interview.

---

## 16. Interview History

### Prompt
> Add proper interview history so users can view their previous interview reports and feedback.

### Development Result
A Report History section was added for completed interviews so users can return to previous interview results.

---

## 17. Downloadable Interview Reports

### Prompt
> Allow users to download their completed interview feedback/report.

### Development Result
Users can download completed interview reports containing the relevant interview feedback and scoring information.

---

## 18. Authentication

### Prompt
> Add Sign Up, Login, Logout, Forgot Password, and Google Sign-Up/Login.

### Development Result
The application includes the requested authentication flows.

### Implementation Note
The current Forgot Password flow uses an in-application verification-code step for demonstration. Real email/SMS OTP delivery is not configured.

---

## 19. Profile Management

### Prompt
> Add profile editing and logout functionality.

### Development Result
Users can edit their profile information and log out from the application.

---

## 20. Theme Customization

### Prompt
> Keep the dark mode the same and change the light mode to light blue and pink.

### Development Result
The light theme was customized with light blue and pink styling while preserving the dark theme.

---

## 21. Footer Branding

### Prompt
> Change the footer text to "Developed by Root Access Team".

### Development Result
The application footer branding was updated to show **Developed by Root Access Team**.

---

# AI-Assisted Development Workflow

AI assistance was used iteratively throughout the development process.

The general workflow was:

1. Describe a feature, requirement, or issue to the AI.
2. Review the suggested implementation.
3. Apply or test the changes.
4. Identify UI, functionality, or documentation issues.
5. Give a follow-up prompt.
6. Refine the implementation.
7. Test the updated behavior.
8. Document the resulting feature when appropriate.

AI assistance was used for:

- Feature planning
- UI implementation and refinement
- Backend/API development
- Interview planning
- Adaptive questioning
- Interview scoring
- Feedback generation
- Ask AI functionality
- Authentication-related workflows
- Interview history
- Downloadable reports
- Profile management
- Theme customization
- Debugging
- README/documentation
- Deployment-related improvements

---

# Project Result

The resulting application provides an end-to-end AI interview preparation experience with:

- User authentication
- Sign Up
- Login
- Google Sign-Up/Login
- Forgot Password verification flow
- Profile editing
- Logout
- Personalized mock interviews
- Adaptive follow-up questions
- Live interview scoring
- Interview feedback
- Readiness score
- Ask AI
- Interview history
- Downloadable interview reports
- Light/Dark mode
- Local development
- Public Render deployment

## Live Application

https://ai-interview-agent-y4cl.onrender.com

## Local Application

http://localhost:3000

---

# AI Usage Evidence

The AI-assisted development process is also documented through the shared Claude conversation:

https://claude.ai/share/e0ad3d55-1c13-4a39-b080-8dba0ceb411f

This repository file provides a structured development log, while the shared conversation provides additional AI-development context.
