import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { QuestionPrompt } from "../../../utils/prompts";

export const maxDuration=30;

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, jobDescription, duration, type, skills, resumeText } = await req.json();

    // Build the prompt using your template
    let prompt = QuestionPrompt
      .replace("{{jobTitle}}", jobTitle)
      .replace("{{jobDescription}}", jobDescription)
      .replace("{{duration}}", duration)
      .replace("{{type}}", type)
      .replace("{{skills}}",skills)
      .replace("{{resumeText}}",resumeText)

    // Optionally, append skills and resumeText to the prompt if needed

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt }
      ],
      model: "llama-3.1-8b-instant", // or your preferred model
      stream: false,
    });

    // Parse the response as needed (e.g., extract JSON from the model's output)
    const content = response.choices[0]?.message?.content || "";
    // You may need to parse the JSON from the content string
    const questions = JSON.parse(content.replace(/```json|```/g, "").trim());

    return NextResponse.json({ interviewQuestions: questions.interviewQuestions });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
