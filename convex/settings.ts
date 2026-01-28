import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Get salon settings (including opening hours)
export const getSalonSettings = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const salon = await ctx.db.get(args.salonId);
    if (!salon) throw new Error("Salon not found");

    // Check permissions (owner or manager)
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "manager")
    ) {
      throw new Error("Unauthorized");
    }

    return salon;
  },
});

// Update salon general info (name, address, city)
export const updateSalonGeneral = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    address: v.string(),
    city: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Permission check
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!membership || membership.role !== "owner") {
      throw new Error("Only owners can update salon details");
    }

    await ctx.db.patch(args.salonId, {
      name: args.name,
      address: args.address,
      city: args.city,
    });
  },
});

// Update opening hours
export const updateOpeningHours = mutation({
  args: {
    salonId: v.id("salons"),
    openingHours: v.object({
      monday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      tuesday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      wednesday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      thursday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      friday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      saturday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
      sunday: v.optional(
        v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Permission check
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "manager")
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.salonId, {
      openingHours: args.openingHours,
    });
  },
});
