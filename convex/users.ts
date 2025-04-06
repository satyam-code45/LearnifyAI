import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Query to see if the user already exists
    const userData = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    // If no user exists, add new user
    if (userData.length === 0) {
      const data = {
        name: args.name,
        email: args.email,
        credits: 5000,
      };
      console.log("creating user");
      // Insert the user and return the full record
      const result = await ctx.db.insert("users", data);
      console.log("Inserted:", result);
      return result;
    }
    // Return existing user
    console.log("Existed:", userData[0]);
    return userData[0];
  },
});


export const UpdateuserToken = mutation({
  args:{
    id: v.id("users"),
    credits: v.number()
  },
  handler: async (ctx,args) => {
    await ctx.db.patch(args.id,{
      credits:args.credits
    })
  }
})