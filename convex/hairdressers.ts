import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getBySalonId = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const hairdressers = await ctx.db
      .query("hairdressers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();

    return hairdressers;
  },
});

export const createHairdresser = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check permissions
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("salonId"), args.salonId))
      .first();

    if (!membership) throw new Error("Not a member of this salon");

    await ctx.db.insert("hairdressers", {
      salonId: args.salonId,
      name: args.name,
      bio: args.bio,
      active: true,
    });
  },
});

export const updateHairdresser = mutation({
  args: {
    id: v.id("hairdressers"),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const hairdresser = await ctx.db.get(args.id);
    if (!hairdresser) throw new Error("Hairdresser not found");

    // Check permissions
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("salonId"), hairdresser.salonId))
      .first();

    if (!membership) throw new Error("Not a member of this salon");

    await ctx.db.patch(args.id, {
      name: args.name,
      bio: args.bio,
      active: args.active,
    });
  },
});
