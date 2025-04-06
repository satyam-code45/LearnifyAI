import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    subscription: v.optional(v.string()),
  }),
  DiscussionRoom: defineTable({
    coachingOptions: v.string(),
    topic: v.string(),
    expertName: v.string(),
    conversation: v.optional(v.any()),
    summary: v.optional(v.any()),
    uid: v.id("users")
  }),
});
