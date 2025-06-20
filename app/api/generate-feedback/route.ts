import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { FEEDBACK_PROMPT } from "../../../utils/prompts";

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();
    console.log(conversation);
    const prompt = FEEDBACK_PROMPT.replace("{{conversation}}", conversation);

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      stream: false,
    });

    const content = response.choices[0]?.message?.content || "";
    // Parse the JSON from the model's output
    const feedback = JSON.parse(content.replace(/```json|```/g, "").trim());

    return NextResponse.json({ feedback });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}
