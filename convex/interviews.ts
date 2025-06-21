import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx } from "./_generated/server";

// Create a new interview session
export const createInterview = mutation({
  args: {
    applicationId: v.id("applications"),
    jobSeekerId: v.id("users"),
    questions: v.array(v.object({
      question: v.string(),
      type: v.string(),
    })),
  },
  async handler(ctx: MutationCtx, args) {
    const now = Date.now();
    const interviewId = await ctx.db.insert("interviews", {
      applicationId: args.applicationId,
      jobSeekerId: args.jobSeekerId,
      questions: args.questions,
      answers: [],
      conversation: [],
      createdAt: now,
      updatedAt: now,
    });
    return interviewId;
  },
});

// Add an answer (audio + transcript) to an interview
export const addInterviewAnswer = mutation({
  args: {
    interviewId: v.id("interviews"),
    audioUrl: v.string(),
    transcript: v.string(),
    questionIndex: v.number(),
  },
  async handler(ctx: MutationCtx, args) {
    const interview = await ctx.db.get(args.interviewId);
    if (!interview) throw new Error("Interview not found");
    const updatedAnswers = [
      ...interview.answers,
      {
        audioUrl: args.audioUrl,
        transcript: args.transcript,
        questionIndex: args.questionIndex,
      },
    ];
    // Update conversation as array of message objects
    const updatedConversation = [
      ...interview.conversation,
      { role: "assistant", content: interview.questions[args.questionIndex]?.question },
      { role: "user", content: args.transcript }
    ];
    await ctx.db.patch(args.interviewId, {
      answers: updatedAnswers,
      conversation: updatedConversation,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// Finalize interview with feedback
export const finalizeInterviewWithFeedback = mutation({
  args: {
    interviewId: v.id("interviews"),
    feedback: v.any(),
    conversation: v.array(v.object({ role: v.string(), content: v.string() })),
  },
  async handler(ctx: MutationCtx, args) {
    await ctx.db.patch(args.interviewId, {
      feedback: args.feedback,
      conversation: args.conversation,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// Get interview by applicationId
export const getInterviewByApplicationId = query({
  args: { applicationId: v.id("applications") },
  async handler(ctx: QueryCtx, args) {
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();
    // Return the latest interview if multiple
    return interviews.sort((a, b) => b.createdAt - a.createdAt)[0] || null;
  },
});

// Get all interviews by applicationId
export const getInterviewsByApplicationId = query({
  args: { applicationId: v.id("applications") },
  async handler(ctx, args) {
    return await ctx.db
      .query("interviews")
      .withIndex("by_applicationId", (q) => q.eq("applicationId", args.applicationId))
      .collect();
  },
});

export const getInterviewById = query({
  args: { interviewId: v.id("interviews") },
  async handler(ctx, args) {
    return await ctx.db.get(args.interviewId);
  },
});

// Add an update mutation for conversation
export const updateInterviewConversation = mutation({
  // conversation must always be an array of { role, content } objects
  args: {
    interviewId: v.id("interviews"),
    conversation: v.array(v.object({ role: v.string(), content: v.string() }))
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.interviewId, {
      conversation: args.conversation,
      updatedAt: Date.now(),
    });
    return true;
  },
});

// Add recording URL to interview
export const addRecordingUrl = mutation({
  args: {
    interviewId: v.id("interviews"),
    recordingUrl: v.string(),
  },
  async handler(ctx, args) {
    await ctx.db.patch(args.interviewId, {
      recordingUrl: args.recordingUrl,
      updatedAt: Date.now(),
    });
    return true;
  }
});

// Reset interview for retake (clear feedback, answers, conversation)
export const resetInterview = mutation({
  args: { interviewId: v.id("interviews") },
  async handler(ctx, args) {
    await ctx.db.patch(args.interviewId, {
      feedback: undefined,
      answers: [],
      conversation: [],
      updatedAt: Date.now(),
    });
    return true;
  },
}); 