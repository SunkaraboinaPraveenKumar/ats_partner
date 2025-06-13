import { v } from "convex/values";
import { query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { cosineSimilarity } from "./utils";

export const getJobPostMatchPercentage = query({
  args: {
    jobPostId: v.id("jobPosts"),
    userId: v.id("users"),
  },
  async handler(ctx, args) {
    const jobPost = await ctx.db.get(args.jobPostId);
    if (!jobPost || !jobPost.jdEmbedding) {
      return null;
    }

    const jobSeekerProfile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!jobSeekerProfile || !jobSeekerProfile.resumeEmbedding) {
      return null;
    }

    const matchRatio = cosineSimilarity(
      jobSeekerProfile.resumeEmbedding,
      jobPost.jdEmbedding
    );

    return Math.round(matchRatio * 100);
  },
});

export const getJobPosts = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let jobPosts = await ctx.db.query("jobPosts").collect();

    if (args.status) {
      jobPosts = jobPosts.filter((job) => job.status === args.status);
    }
    return jobPosts;
  },
});

export const getJobPostById = query({
  args: {
    jobPostId: v.id("jobPosts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobPostId);
  },
}); 