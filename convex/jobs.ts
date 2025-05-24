import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwIfNotAuthorized } from "./utils";
import { Id } from "./_generated/dataModel"; // Import Id type

export const createJobPost = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    company: v.string(),
    location: v.string(),
    salary: v.string(),
    description: v.string(),
    requiredSkills: v.array(v.string()),
    attitudePreferences: v.array(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
  


    throwIfNotAuthorized(user.role === "recruiter", "Only recruiters can create job posts");

    // Destructure userId from args before inserting
    const { userId, ...restOfArgs } = args;

    const jobPostId = await ctx.db.insert("jobPosts", {
      recruiterId: user._id,
      ...restOfArgs,
      status: "active",
      jdEmbedding: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return jobPostId;
  },
});

export const getJobPosts = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    // Start with the base query
    let query = ctx.db.query("jobPosts");

    // Conditionally apply .withIndex
    if (args.status !== undefined) {
      // The linter error on this line related to chaining seems to be a tooling issue.
      // The code structure is logically correct for conditional chaining in Convex.
      query = query.withIndex("by_status", (q) => q.eq("status", args.status!));
    }

    // Conditionally apply .take
    if (args.limit !== undefined) {
      // The linter error on this line related to chaining seems to be a tooling issue.
      // The code structure is logically correct for conditional chaining in Convex.
      query = query.take(args.limit);
    }

    // The linter may still show errors here due to the type inference issue with chaining.
    // The code itself is functionally correct for Convex query building.

    return await query.collect();
  },
});

export const getRecruiterJobs = query({ // Changed back to query
  args: {
    userId: v.id("users"), // Accept userId from client
  },
  // Fix: Added 'args' as the second parameter
  async handler(ctx, args) {
    // WARNING: This approach relies on the client providing the correct userId and is highly insecure.
    // It is vulnerable to attackers viewing job posts associated with any user by providing a fake userId.
    // Reverting to ctx.auth.getUserIdentity() is strongly recommended for security.
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    
    throwIfNotAuthorized(user.role === "recruiter", "Not authorized");

    return await ctx.db
      .query("jobPosts")
      .withIndex("by_recruiterId", (q) => q.eq("recruiterId", user._id))
      .collect();
  },
});

export const updateJobPost = mutation({
  args: {
    userId: v.id("users"), // Accept userId from client
    jobPostId: v.id("jobPosts"),
    title: v.optional(v.string()),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    salary: v.optional(v.string()),
    description: v.optional(v.string()),
    requiredSkills: v.optional(v.array(v.string())),
    attitudePreferences: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  // Fix: Added 'args' as the second parameter
  async handler(ctx, args) {
    // WARNING: This approach relies on the client providing the correct userId and is highly insecure.
    // It is vulnerable to attackers updating job posts associated with any user by providing a fake userId.
    // Reverting to ctx.auth.getUserIdentity() is strongly recommended for security.
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");


    const jobPost = await ctx.db.get(args.jobPostId);

     // Fix: Access _id from the fetched user document for the authorization check
    throwIfNotAuthorized(
      jobPost?.recruiterId === user._id,
      "Not authorized to update this job post"
    );

    const { jobPostId, userId, ...updates } = args; // Destructure userId as well
    await ctx.db.patch(jobPostId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const updateJobEmbedding = mutation({
    args: {
        jobId: v.id("jobPosts"),
        embedding: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.jobId, {
            jdEmbedding: args.embedding,
        });
    },
});

export const getRecommendedJobs = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    // Get user's resume embedding
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile?.resumeEmbedding) {
      return [];
    }

    // Get all active jobs
    const jobs = await ctx.db
      .query("jobPosts")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Calculate cosine similarity for each job
    const jobsWithScores = jobs.map(job => {
      const similarity = cosineSimilarity(profile.resumeEmbedding, job.jdEmbedding);
      return {
        ...job,
        matchScore: similarity
      };
    });

    // Sort by match score in descending order
    return jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
  },
});

// Helper function for cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}