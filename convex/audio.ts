import { v } from "convex/values";
import {mutation } from "./_generated/server";

export const saveVapiCall = mutation({
  args: {
    vapiCallId: v.string(),
    interviewId: v.id("interviews"),
  },
  async handler(ctx, { vapiCallId, interviewId }) {
    await ctx.db.patch(interviewId, {
      vapiCallId: vapiCallId,
    });
  },
});


export const updateInterviewWithRecording = mutation({
  args: {
    vapiCallId: v.string(),
    recordingUrl: v.string()
  },
  async handler(ctx, { vapiCallId, recordingUrl }) {
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_vapiCallId", (q) => q.eq("vapiCallId", vapiCallId))
      .unique();

    if (!interview) {
      console.error(`Interview with Vapi call ID ${vapiCallId} not found.`);
      return;
    }

    await ctx.db.patch(interview._id, {
      recordingUrl: recordingUrl,
      updatedAt: Date.now(),
    });
  },
}); 