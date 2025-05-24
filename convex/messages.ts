import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const sendMessage = mutation({
  args: {
    matchId: v.id("matches"),
    content: v.string(),
    userId: v.id("users"),
    isAiResponse: v.optional(v.boolean()), // Add support for AI messages
    messageType: v.optional(v.union(v.literal("text"), v.literal("ai"), v.literal("system"))), // Optional message type
  },
  async handler(ctx, args) {
    // Special handling for AI messages - skip user validation
    if (args.isAiResponse) {
      const match = await ctx.db.get(args.matchId);
      if (!match) {
        throw new ConvexError("Match not found.");
      }

      return await ctx.db.insert("messages", {
        matchId: args.matchId,
        senderId: args.userId as Id<"users">,
        content: args.content,
        createdAt: Date.now(),
        isAiResponse: args?.isAiResponse || false,
        messageType: args.messageType || "ai",
      });
    }

    // Regular user message validation
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new ConvexError("Match not found.");
    }

    // Check if user is part of this match
    if (match.jobSeekerId !== args.userId && match.recruiterId !== args.userId) {
      throw new ConvexError("Not authorized to send messages in this match.");
    }

    // Validate message content
    if (!args.content.trim()) {
      throw new ConvexError("Message content cannot be empty.");
    }

    if (args.content.length > 2000) {
      throw new ConvexError("Message content is too long. Maximum 2000 characters allowed.");
    }

    return await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: args.userId,
      content: args.content.trim(),
      createdAt: Date.now(),
      isAiResponse: args.isAiResponse || false,
      messageType: args.messageType || "text",
    });
  },
});


export const getMessages = query({
  args: {
    matchId: v.id("matches"),
    userId: v.id("users")
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) {
      throw new ConvexError("Match not found.");
    }

    // Check if user is part of this match
    if (match.jobSeekerId !== args.userId && match.recruiterId !== args.userId) {
      throw new ConvexError("Not authorized to access this match.");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .order("asc") // Ensure messages are in chronological order
      .collect();

    const jobPost = await ctx.db.get(match.jobPostId);
    
    return { messages, jobPost };
  },
});
