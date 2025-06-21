import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api"; 
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (payload.message.type === "end-of-call") {
      const { call } = payload.message;

      if (!call.id) {
        console.error("Vapi webhook error: No call ID in payload");
        return new NextResponse("Error: No call ID", { status: 400 });
      }

      // Vapi doesn't send the full call object in the webhook.
      // We need to fetch it to get the recordingUrl and transcript.
      const vapiCall = await fetch(`https://api.vapi.ai/call/${call.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        },
      }).then((res) => res.json());

      const recordingUrl = vapiCall.recordingUrl;
      const transcript = vapiCall.transcript;

      if (recordingUrl && transcript) {
        await convex.mutation(api.audio.updateInterviewWithRecording, {
          vapiCallId: call.id,
          recordingUrl: recordingUrl
        });
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 