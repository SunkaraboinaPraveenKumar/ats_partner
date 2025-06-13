import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { cosineSimilarity } from "./utils";

export const createApplication = mutation({
  args: {
    userId: v.id("users"),
    jobPostId: v.id("jobPosts"),
  },
  async handler(ctx, args) {
    // Check if application already exists first
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_userId_and_jobPostId", (q) =>
        q.eq("userId", args.userId).eq("jobPostId", args.jobPostId)
      )
      .first();

    if (existingApplication) {
      throw new Error("Application already exists");
    }

    // Get the job seeker profile
    const profile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile || !profile.resumeEmbedding) {
      throw new Error("Resume embedding not found");
    }

    // Get the job post
    const jobPost = await ctx.db.get(args.jobPostId);
    if (!jobPost || !jobPost.jdEmbedding) {
      throw new Error("Job description embedding not found");
    }

    // Calculate match ratio
    const matchRatio = cosineSimilarity(profile.resumeEmbedding, jobPost.jdEmbedding);

    // Create the application first
    const applicationId = await ctx.db.insert("applications", {
      userId: args.userId,
      jobPostId: args.jobPostId,
      matchRatio,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Then create the match
    const matchId = await ctx.db.insert("matches", {
      jobSeekerId: args.userId,
      recruiterId: jobPost.recruiterId,
      jobPostId: args.jobPostId,
      status: "new",
      matchReport: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {applicationId,matchId};
  },
});

export const getApplicationsByUser = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get job post details for each application
    const applicationsWithJobs = await Promise.all(
      applications.map(async (app) => {
        const jobPost = await ctx.db.get(app.jobPostId);
        return {
          ...app,
          jobPost,
        };
      })
    );

    return applicationsWithJobs;
  },
});

export const getApplicationsByJobPost = query({
  args: { jobPostId: v.id("jobPosts") },
  async handler(ctx, args) {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_jobPostId", (q) => q.eq("jobPostId", args.jobPostId))
      .collect();

    // Get profiles for each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const profile = await ctx.db
          .query("jobSeekerProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", app.userId))
          .first();
        return {
          ...app,
          profile,
        };
      })
    );

    return applicationsWithProfiles;
  },
});

export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.string(), // "pending", "accepted", "rejected"
  },
  async handler(ctx, args) {
    return await ctx.db.patch(args.applicationId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

export const updateApplicationMatchRatio = mutation({
  args: { applicationId: v.id("applications") },
  async handler(ctx, args) {
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("Application not found");

    const jobSeekerProfile = await ctx.db
      .query("jobSeekerProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", application.userId))
      .first();

    const jobPost = await ctx.db.get(application.jobPostId);
    if (!jobPost) throw new Error("Job post not found");

    const recruiterProfile = await ctx.db
      .query("recruiterProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", jobPost.recruiterId))
      .first();

    // Calculate resume match
    const resumeMatch = cosineSimilarity(jobSeekerProfile?.resumeEmbedding || [], jobPost.jdEmbedding);

    // Calculate attitude match
    let attitudeMatch = 0;
    if (jobSeekerProfile?.attitudeQuizResults && recruiterProfile?.attitudePreferences) {
      const matchingPreferences = recruiterProfile.attitudePreferences.filter(pref =>
        Object.values(jobSeekerProfile.attitudeQuizResults).includes(pref)
      );
      attitudeMatch = matchingPreferences.length / recruiterProfile.attitudePreferences.length;
    }

    // Calculate overall match (70% resume, 30% attitude)
    const overallMatch = (resumeMatch * 0.7) + (attitudeMatch * 0.3);

    await ctx.db.patch(args.applicationId, {
      matchRatio: resumeMatch,
      attitudeMatch,
      overallMatch,
      updatedAt: Date.now(),
    });
  },
});

export const getApplicationByUserAndJob = query({
  args: {
    userId: v.id("users"),
    jobPostId: v.id("jobPosts"),
  },
  async handler(ctx, args) {
    return await ctx.db
      .query("applications")
      .withIndex("by_userId_and_jobPostId", (q) =>
        q.eq("userId", args.userId).eq("jobPostId", args.jobPostId)
      )
      .first();
  },
});

export const getApplicationForMatch = query({
  args: {
    matchId: v.id("matches"),
    userId: v.id("users")
  },
  handler: async (ctx: QueryCtx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      return null;
    }

    // Ensure the user is part of the match
    if (match.jobSeekerId !== args.userId && match.recruiterId !== args.userId) {
      throw new ConvexError("Not authorized to access this match.");
    }

    // Only job seekers have applications
    if (match.jobSeekerId !== args.userId) {
      return null;
    }

    return await ctx.db
      .query("applications")
      .withIndex("by_userId_and_jobPostId", (q) =>
        q.eq("userId", args.userId).eq("jobPostId", match.jobPostId)
      )
      .first();
  },
});

export const getApplicationById = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return null;
    }

    const jobPost = await ctx.db.get(application.jobPostId);
    const user = await ctx.db.get(application.userId);

    if (!jobPost || !user) {
      throw new ConvexError("Related job post or user not found.");
    }

    return {
      ...application,
      jobPost,
      user,
    };
  },
});

