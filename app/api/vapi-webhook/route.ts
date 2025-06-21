import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"; 
import { NextRequest, NextResponse } from "next/server";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log("Vapi webhook raw payload:", rawBody);

    // It's possible the body is empty, handle that case.
    if (!rawBody) {
      return new NextResponse("Empty request body", { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Vapi webhook parsed payload:", JSON.stringify(payload, null, 2));
    
    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");

    // We are interested in the 'call-end' event
    if (payload.message.type === "call-end") {
      const { call } = payload.message;

      if (!interviewId) {
        console.error("Vapi webhook error: No interviewId in URL query parameters");
        // Return 200 to acknowledge receipt and prevent Vapi from retrying.
        return new NextResponse("Error: No interviewId in URL", { status: 200 });
      }

      const recordingUrl = call.recordingUrl;

      if (recordingUrl) {
        console.log(`Webhook: Saving recording for interview ${interviewId}`);
        await convex.mutation(api.interviews.addRecordingUrl, {
          interviewId: interviewId as Id<"interviews">,
          recordingUrl: recordingUrl,
        });
        console.log(`Webhook: Successfully saved recording for interview ${interviewId}`);
      } else {
        console.log(`Webhook: No recording URL for interview ${interviewId}`);
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 