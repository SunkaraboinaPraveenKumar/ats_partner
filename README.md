# SwipeIt

## AI-Powered Recruitment Platform

SwipeIt revolutionizes the recruitment process by leveraging AI for deep semantic matching, automated interviews, and a modern, intuitive experience for both job seekers and recruiters.

---

## Features

- **AI-Powered Semantic Matching:**
  - Uses advanced embeddings and cosine similarity to match candidates and jobs based on true context, not just keywords.
- **Swipe-Based Interface:**
  - Engaging swipe UI for both job seekers and recruiters to quickly browse and act on matches.
- **Attitude & Blind Hiring:**
  - Attitude/culture fit matching and a blind mode to reduce bias and promote fair hiring.
- **AI-Powered Interviews:**
  - Automated, voice-based interviews conducted by an AI recruiter.
  - Each interview is recorded, transcribed, and evaluated by AI.
  - Automatic feedback with ratings (communication, technical skills, problem solving, experience), summary, and recommendation.
  - Recruiters can view all interviews for each application, with detailed feedback and transcripts.
  - Dedicated recruiter pages for all applications of a job and all interviews of an application.
  - Quick navigation via icons for interview and application details.
- **Recruiter Dashboard:**
  - Manage job postings.
  - View all applications for each job (modal or dedicated page).
  - Drill down to all interviews and feedback for each application.
  - See candidate status, resume, and AI feedback at a glance.
- **Job Seeker Dashboard:**
  - Track all applications and interviews.
  - View detailed AI feedback and ratings for completed interviews.
- **Real-Time Messaging:**
  - (Planned/partially implemented) Chat between job seekers and recruiters.
- **Resume Parsing & AI Feedback:**
  - Upload resumes, get parsed data, and receive AI-generated feedback.
- **Modern UI:**
  - Built with Tailwind CSS, Radix UI, and custom components for a seamless, responsive experience.
- **Authentication:**
  - Secure login and signup with NextAuth.js.
- **Convex Backend:**
  - Real-time, serverless backend for data and business logic.

---

## How It Works

1. **Create Your Profile or Job Posting:**
   - Job seekers upload resumes; recruiters create job posts.
2. **AI Analysis:**
   - The platform analyzes and understands the context behind skills and job requirements using embeddings.
3. **Start Matching:**
   - Swipe through AI-recommended matches, ranked by relevance.
4. **Interview & Feedback:**
   - Candidates can take AI-powered interviews; recruiters review detailed feedback and transcripts.
5. **Connect & Hire:**
   - Use messaging (coming soon) and dashboards to manage the hiring process end-to-end.

---

## Folder Structure

```
.
├── app/
│   ├── api/
│   ├── dashboard/
│   │   ├── job-seeker/
│   │   └── recruiter/
│   ├── login/
│   ├── messages/
│   ├── signup/
│   │   ├── job-seeker/
│   │   └── recruiter/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── provider.tsx
├── components/
│   └── ... (various UI components)
├── convex/
│   └── ... (Convex backend files)
├── hooks/
│   └── ... (custom React hooks)
├── lib/
│   └── ... (utility functions and libraries)
├── public/
│   └── ... (static assets)
├── types/
│   └── ... (TypeScript type definitions)
├── utils/
│   └── ... (AI prompts, assistant options)
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Technologies Used

- **Next.js** (App Router)
- **React** (with hooks)
- **TypeScript**
- **Convex** (serverless backend, real-time data)
- **Tailwind CSS** (utility-first styling)
- **Radix UI** (accessible UI primitives)
- **shadcn/ui** (custom UI components)
- **NextAuth.js** (authentication)
- **Langchain** (AI/LLM orchestration)
- **Google GenAI** (embeddings for semantic matching)
- **Zustand** (state management)
- **React Hook Form** (form handling)

---

## Setup

1. **Clone the repository:**
    ```bash
    git clone <repository_url>
    ```
2. **Navigate to the project directory:**
    ```bash
    cd SwipeIt
    ```
3. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
4. **Set up Convex:**
    - Install the Convex CLI:
      ```bash
      npm install -g convex-cli
      ```
    - Log in to Convex:
      ```bash
      convex login
      ```
    - Deploy your Convex backend:
      ```bash
      convex deploy
      ```
    - Add your Convex deployment URL to your environment variables (e.g., `.env.local`).
5. **Set up Google GenAI and Langchain:**
    - Obtain API keys and configure them in your environment variables.
    - Refer to the relevant documentation for specific Langchain integrations and setup.
6. **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
7. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Scripts

- `npm run dev`: Runs the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the project.

---

## Contributing

We welcome contributions! Please open issues or pull requests for new features, bug fixes, or improvements.

---

## License

(Add license information here)