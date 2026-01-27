import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getMySalons = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const salons = await Promise.all(
      memberships.map(async (membership) => {
        const salon = await ctx.db.get(membership.salonId);
        if (!salon) return null;
        return {
          ...salon,
          role: membership.role,
        };
      })
    );

    return salons.filter((salon) => salon !== null);
  },
});

export const createSalon = mutation({
  args: { name: v.string(), address: v.string(), city: v.string() },
  handler: async (ctx, { name, address, city }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const salon = await ctx.db.insert("salons", {
      name,
      address,
      ownerId: identity.subject,
      city,
    });

    await ctx.db.insert("memberships", {
      userId: identity.subject,
      salonId: salon,
      role: "owner",
    });

    return salon;
  },
});
