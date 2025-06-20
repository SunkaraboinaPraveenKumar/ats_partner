import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.string(), // "job-seeker" or "recruiter"
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  jobSeekerProfiles: defineTable({
    userId: v.id("users"),
    title: v.string(),
    summary: v.string(),
    resumeText: v.string(),
    extractedSkills: v.array(v.string()),
    attitudeQuizResults: v.object({
      workStyle: v.string(),
      problemSolving: v.string(),
      teamDynamics: v.string(),
      workEnvironment: v.string(),
    }),
    attitudeTags: v.array(v.string()),
    resumeEmbedding: v.array(v.number()),
    fileUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    resumeIngested: v.optional(v.boolean())
  }).index("by_userId", ["userId"]),

  recruiterProfiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    companySize: v.string(),
    industry: v.string(),
    companyDescription: v.string(),
    attitudePreferences: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  jobPosts: defineTable({
    recruiterId: v.id("users"),
    title: v.string(),
    company: v.string(),
    location: v.string(),
    salary: v.string(),
    description: v.string(),
    requiredSkills: v.array(v.string()),
    attitudePreferences: v.array(v.string()),
    status: v.string(), // "active" or "inactive"
    jdEmbedding: v.array(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_recruiterId", ["recruiterId"])
    .index("by_status", ["status"]),

  swipes: defineTable({
    userId: v.id("users"),
    targetId: v.union(v.id("jobPosts"), v.id("jobSeekerProfiles")),
    direction: v.string(), // "left" or "right"
    type: v.string(), // "job" or "candidate"
    createdAt: v.number(),
  }).index("by_userId_and_targetId", ["userId", "targetId"]),

  matches: defineTable({
    jobSeekerId: v.id("users"),
    recruiterId: v.id("users"),
    jobPostId: v.id("jobPosts"),
    matchReport: v.string(),
    status: v.string(), // "new", "in_progress", "archived"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_jobSeekerId", ["jobSeekerId"])
    .index("by_recruiterId", ["recruiterId"])
    .index("by_jobPostId", ["jobPostId"]),

  messages: defineTable({
    matchId: v.id("matches"),
    senderId: v.id("users"),
    content: v.string(),
    createdAt: v.float64(),
    isAiResponse: v.optional(v.boolean()),
    messageType: v.optional(v.union(v.literal("text"), v.literal("ai"), v.literal("system")))
  }).index("by_matchId", ["matchId"]),

  applications: defineTable({
    userId: v.id("users"),
    jobPostId: v.id("jobPosts"),
    matchRatio: v.number(),
    attitudeMatch: v.optional(v.number()), // Attitude match
    overallMatch: v.optional(v.number()), // Combined match
    status: v.string(), // "pending", "accepted", "rejected"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_jobPostId", ["jobPostId"])
    .index("by_userId_and_jobPostId", ["userId", "jobPostId"]),

  // Interview sessions linked to applications
  interviews: defineTable({
    applicationId: v.id("applications"),
    jobSeekerId: v.id("users"),
    questions: v.array(v.object({
      question: v.string(),
      type: v.string(),
    })),
    answers: v.array(v.object({
      audioUrl: v.string(),
      transcript: v.string(),
      questionIndex: v.number(),
    })),
    conversation: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })), // full transcript as array of message objects
    feedback: v.optional(v.any()), // JSON feedback
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_applicationId", ["applicationId"]),
});