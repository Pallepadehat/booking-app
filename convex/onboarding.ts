import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const createFirstSalon = mutation({
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

export const createFirstHairdresser = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    services: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("hairdressers", {
      salonId: args.salonId,
      name: args.name,
      userId: identity.subject,
      active: true,
    });
  },
});
