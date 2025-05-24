# SwipeIt

## AI-Powered Recruitment Platform

SwipeIt revolutionizes the recruitment process by using AI to semantically match job seekers with recruiters, going beyond traditional keyword matching.

## Features

-   **Semantic Matching:** Our AI understands the context in job descriptions and resumes by creating embeddings (vector representations) and calculating their cosine similarity to find the most relevant matches.
-   **Swipe-Based Interface:** Intuitive swipe interface for both job seekers and recruiters, making the matching process engaging and efficient.
-   **Attitude Matching:** Find candidates that fit not just the skills, but also the company culture and work environment.
-   **Blind Hiring Mode:** Reduce bias in your recruitment process with our unique blind hiring mode that focuses on skills, not demographics.
-   **Real-Time Chat:** Connect with matched candidates or recruiters instantly through our integrated real-time messaging system.(Yet to come).

## How It Works

1.  **Create Your Profile:** Upload your resume or create a job posting with our easy-to-use interface.
2.  **AI Analysis:** Our AI analyzes and understands the context behind your skills or job requirements by generating embeddings.
3.  **Start Matching:** Swipe through AI-recommended matches, ranked by cosine similarity, and connect with your perfect fit.

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
├── store/
│   └── ... (Zustand store files)
├── .git/
├── .gitignore
├── .eslintrc.json
├── components.json
├── improve
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── public/
│   └── ... (static assets)
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## Technologies Used

-   Next.js
-   React
-   TypeScript
-   Convex (Backend)
-   Google GenAI (Resume and Job Description embeddings)
-   Langchain
-   Tailwind CSS (for styling)
-   Radix UI (for UI components)
-   Zustand (for state management)
-   React Hook Form (for form handling)

## Setup

1.  Clone the repository:

    ```bash
    git clone <repository_url>
    ```

2.  Navigate to the project directory:

    ```bash
    cd SwipeIt
    ```

3.  Install dependencies:

    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
    or
    ```bash
    pnpm install
    ```

4.  Set up Convex:
    -   Install the Convex CLI:
        ```bash
        npm install -g convex-cli
        ```
    -   Log in to Convex:
        ```bash
        convex login
        ```
    -   Deploy your Convex backend:
        ```bash
        convex deploy
        ```
    -   Get your Convex deployment URL and add it to your environment variables (e.g., in a `.env.local` file).

5.  Set up Google GenAI and Langchain:
    -   Obtain API keys for Google GenAI and configure them in your environment variables.
    -   Refer to the relevant documentation for specific Langchain integrations and setup.

6.  Run the development server:

    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```
    or
    ```bash
    pnpm dev
    ```

7.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

-   `npm run dev`: Runs the development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the production server.
-   `npm run lint`: Lints the project.

## Contributing

(Add contributing guidelines here)

## License

(Add license information here)