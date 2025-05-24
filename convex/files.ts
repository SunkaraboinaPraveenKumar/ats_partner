import { mutation } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Generate a Convex upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // This function fetches the public URL for a given storage ID
    return ctx.storage.getUrl(args.storageId);
  },
}); 