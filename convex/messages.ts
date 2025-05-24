import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwIfNotAuthorized } from "./utils";

export const sendMessage = mutation({
  args: {
    matchId: v.id("matches"),
    content: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    const match = await ctx.db.get(args.matchId);
    throwIfNotAuthorized(
      match?.jobSeekerId === user?._id || match?.recruiterId === user?._id,
      "Not authorized to send messages in this match"
    );

    const messageId = await ctx.db.insert("messages", {
      matchId: args.matchId,
      senderId: user._id,
      content: args.content,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const getMessages = query({
  args: {
    matchId: v.id("matches"),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .first();

    const match = await ctx.db.get(args.matchId);
    throwIfNotAuthorized(
      match?.jobSeekerId === user?._id || match?.recruiterId === user?._id,
      "Not authorized to view messages in this match"
    );

    return await ctx.db
      .query("messages")
      .withIndex("by_matchId", (q) => q.eq("matchId", args.matchId))
      .collect();
  },
});