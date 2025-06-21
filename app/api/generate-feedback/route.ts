import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { FEEDBACK_PROMPT } from "../../../utils/prompts";

export async function POST(req: NextRequest) {
  try {
    const { conversation } = await req.json();

    // Format the conversation array into a readable string
    const formattedConversation = conversation
      .map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const prompt = FEEDBACK_PROMPT.replace("{{conversation}}", formattedConversation);

    console.log(prompt);

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
