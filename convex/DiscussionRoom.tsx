import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewRoom = mutation({
  args: {
    coachingOptions: v.string(),
    topic: v.string(),
    expertName: v.string(),
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert("DiscussionRoom", {
      coachingOptions: args.coachingOptions,
      topic: args.topic,
      expertName: args.expertName,
      uid: args.uid,
    });
    console.log("Inserted:", result);
    return result;
  },
});

export const GetDiscussionRoom = query({
  args: {
    id: v.id("DiscussionRoom"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.id);
    return result;
  },
});

export const UpdateConversation = mutation({
  args: {
    id: v.id("DiscussionRoom"),
    conversation: v.any(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.id, {
      conversation: args.conversation,
    });
    console.log("Inserted:", result);
    return result;
  },
});

export const UpdateSummary = mutation({
  args: {
    id: v.id("DiscussionRoom"),
    summary: v.any(),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.patch(args.id, {
      summary: args.summary,
    });
    console.log("Inserted:", result);
    return result;
  },
});

export const GetAllPreviousDiscussion = query({
  args: {
    uid: v.id("users"),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("DiscussionRoom")
      .filter((q) => q.eq(q.field("uid"), args.uid)).order("desc")
      .collect();
    return result;
  },
});
