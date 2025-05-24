import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwIfNotAuthorized } from "./utils";

export const getMatchByApplication = query({
  args: {
    applicationId: v.id("applications"),
  },
  async handler(ctx, args) {
    const application = await ctx.db.get(args.applicationId);
    if (!application) return null;

    return await ctx.db
      .query("matches")
      .withIndex("by_jobPostId", (q) => q.eq("jobPostId", application.jobPostId))
      .first();
  },
});

export const getMatchByJobPost = query({
  args: {
    jobPostId: v.id("jobPosts"),
    userId: v.id("users")
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("matches")
      .withIndex("by_jobPostId", (q) => q.eq("jobPostId", args.jobPostId))
      .filter((q) => q.eq(q.field("jobSeekerId"), args.userId))
      .first();
  },
});

export const getOrCreateMatch = mutation({
  args: {
    jobPostId: v.id("jobPosts"),
    userId: v.id("users")
  },
  async handler(ctx, args) {
    // First check if match exists
    const existingMatch = await ctx.db
      .query("matches")
      .withIndex("by_jobPostId", (q) => q.eq("jobPostId", args.jobPostId))
      .filter((q) => q.eq(q.field("jobSeekerId"), args.userId))
      .first();

    if (existingMatch) {
      return existingMatch;
    }

    // If no match exists, create one
    const jobPost = await ctx.db.get(args.jobPostId);
    if (!jobPost) {
      throw new Error("Job post not found");
    }

    return await ctx.db.insert("matches", {
      jobSeekerId: args.userId,
      recruiterId: jobPost.recruiterId,
      jobPostId: args.jobPostId,
      status: "new",
      matchReport: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

