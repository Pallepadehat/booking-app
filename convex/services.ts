import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// List services
export const getServices = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
  },
});

// Create new service
export const createService = mutation({
  args: {
    salonId: v.id("salons"),
    name: v.string(),
    description: v.string(),
    durationMinutes: v.number(),
    priceDkk: v.number(),
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

    await ctx.db.insert("services", {
      salonId: args.salonId,
      name: args.name,
      description: args.description,
      durationMinutes: args.durationMinutes,
      priceDkk: args.priceDkk,
      active: true,
    });
  },
});

// Update service
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    description: v.string(),
    durationMinutes: v.number(),
    priceDkk: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    // Permission check
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_salon", (q) => q.eq("salonId", service.salonId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "manager")
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.serviceId, {
      name: args.name,
      description: args.description,
      durationMinutes: args.durationMinutes,
      priceDkk: args.priceDkk,
      active: args.active,
    });
  },
});

// Delete Service (Hard delete if unused, or just soft delete? User said manage so let's stick to update active: false for now usually, but I'll add a delete mutation that does hard delete)
export const deleteService = mutation({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    // Permission check
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_salon", (q) => q.eq("salonId", service.salonId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "manager")
    ) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.serviceId);
  },
});
