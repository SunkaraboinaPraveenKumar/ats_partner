import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { hashPassword, comparePasswords } from "./utils";

export const signup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("job-seeker"), v.literal("recruiter")),
  },
  async handler(ctx, args) {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new ConvexError("Email already registered");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash,
      role: args.role,
      createdAt: Date.now(),
    });

    return { userId };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new ConvexError("Invalid email or password");
    }

    const valid = await comparePasswords(args.password, user.passwordHash);
    if (!valid) {
      throw new ConvexError("Invalid email or password");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
});