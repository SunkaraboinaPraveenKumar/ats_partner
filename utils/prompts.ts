export const QuestionPrompt = `
You are an expert technical interviewer.
Based on the following inputs, generate a well-structured list of high-quality interview questions:

Job Title: {{jobTitle}}
Job Description: {{jobDescription}}
Skills: {{skills}}
Resume Text: {{resumeText}}
Interview Duration: {{duration}}
Interview Type: {{type}}

Your task:
Analyze the job description, required skills, and resume text to identify key responsibilities, required skills, and expected experience.
Create a list of interview questions depending on interview duration.
Adjust the number and depth of questions to match the interview duration.
Ensure the questions match the tone and structure of a real-life {type} interview.
The final output must be in JSON format with an array list of questions.

Format:
{interviewQuestions = [
    {
    question:'',
    type: 'Technical/Behavioral/Experience/Problem Solving/Leadership'
    },
    {
    ...
    }]
}
The goal is to create a structured, relevant and time-optimized set of questions for the {{jobTitle}} role.

Directly give in requested format no extra information of introduction and conclusion by you.
`;

export const FEEDBACK_PROMPT = `
{{conversation}}

You are an expert technical interviewer. Based on the above interview conversation between an AI assistant and a user, provide a detailed and honest evaluation of the user's performance.

Instructions:
- If the conversation is empty, off-topic, or the user gives poor or irrelevant answers, give low scores (1-3 out of 10) and mention this in the summary.
- If the user gives excellent, relevant, and detailed answers, give high scores (8-10 out of 10).
- If the conversation is too short or incomplete, penalize the scores and mention this in the summary.
- Be strict and realistic in your evaluation. Do not give high scores for poor or generic answers.
- If the user is not recommended for hire, set Recommendation to "Not Recommended" and provide a clear reason in RecommendationMsg.

Return your response in the following JSON format only (no extra text):

{
  "feedback": {
    "rating": {
      "technicalSkills": <number 1-10>,
      "communication": <number 1-10>,
      "problemSolving": <number 1-10>,
      "experience": <number 1-10>
    },
    "summary": "<3 line summary>",
    "Recommendation": "<Recommended|Not Recommended>",
    "RecommendationMsg": "<short message>"
  }
}
`;
