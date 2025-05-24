import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Expected body: { job: {...}, messages: [...], application?: {...} }
    const { job, messages, application } = body;

    if (!job || !messages) {
      return NextResponse.json({ error: "Missing required fields: job or messages" }, { status: 400 });
    }

    // Create the system prompt based on whether application details are available
    let systemPrompt = "";

    const salary = job.salary || "Competitive salary";
    const location = job.location || "Not specified";
    const recruiterName = job.recruiterName || "Not specified"; // Assuming recruiterName is passed from frontend

    const jobDetails = `
      Job Title: ${job.title || "Not specified"}
      Company: ${job.company || "Not specified"}
      Location: ${location}
      Salary: ${salary}
      Recruiter: ${recruiterName}
      Description: ${job.description || "No detailed description provided"}
    `;

    if (application) {
      // After application scenario
      systemPrompt = `
You are a friendly and helpful AI assistant for a job portal.

The user has already applied for the following job. Here are the job details and their application status:

${jobDetails}

Application Details:
  Match Ratio: ${application.matchRatio !== undefined ? application.matchRatio : 'Not available'}
  Status: ${application.status || 'Not available'}
  Application Date: ${application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Not available'}

Assist the user by providing information based on the job and their application details. You can discuss the job details, the significance of their match ratio, and explain their application status. If the user asks questions not covered by this information, politely state that you do not have that specific information.
`;
    } else {
      // Before application scenario
      systemPrompt = `
You are a friendly and helpful AI assistant for a job portal.

The user is asking questions about the following job posting:

${jobDetails}

Assist the user by providing information based ONLY on the provided job details. You can answer questions about the role, company (based on provided details), location, salary, and description. If the user asks questions not covered by this information, politely state that you do not have that specific information.
`;
    }

    // Set up response as a stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Initialize the Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
    });

    // Format the messages for the Groq API
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Start the response stream
    const response = new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

    // Call the Groq API with streaming enabled
    const chatStreamResponse = await groq.chat.completions.create({
      messages: formattedMessages as any, // Cast as any for now, consider stricter typing
      model: "llama-3.3-70b-versatile", // Or another suitable model
      stream: true,
    });

    // Process the streaming response
    (async () => {
      try {
        for await (const chunk of chatStreamResponse) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // Send each chunk as an SSE event
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ content })}` + "\n\n")
            );
          }
        }
        // Signal the end of the stream
        await writer.write(encoder.encode("data: [DONE]" + "\n\n"));
      } catch (error) {
        console.error("Error in stream:", error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}` + "\n\n")
        );
      } finally {
        await writer.close();
      }
    })();

    return response;
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}