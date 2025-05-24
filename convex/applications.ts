import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export const createApplication = mutation({
  args: {
    userId: v.id("users"),
    jobPostId: v.id("jobPosts"),
  },
  async handler(ctx, args) {
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

    // Check if application already exists
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_userId_and_jobPostId", (q) => 
        q.eq("userId", args.userId).eq("jobPostId", args.jobPostId)
      )
      .first();

    if (existingApplication) {
      throw new Error("Application already exists");
    }

    // Create the application
    return await ctx.db.insert("applications", {
      userId: args.userId,
      jobPostId: args.jobPostId,
      matchRatio,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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
