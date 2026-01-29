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

    // Validate inputs
    if (args.name.trim().length === 0) {
      throw new Error("Service name cannot be empty");
    }
    if (args.durationMinutes <= 0) {
      throw new Error("Duration must be positive (in minutes)");
    }
    if (args.durationMinutes > 480) {
      throw new Error("Duration cannot exceed 8 hours (480 minutes)");
    }
    if (args.priceDkk < 0) {
      throw new Error("Price cannot be negative");
    }
    if (args.priceDkk > 100000) {
      throw new Error("Price seems unreasonably high");
    }

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
      throw new Error(
        "Unauthorized: Only owners and managers can create services"
      );
    }

    await ctx.db.insert("services", {
      salonId: args.salonId,
      name: args.name.trim(),
      description: args.description.trim(),
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

    // Validate inputs
    if (args.name.trim().length === 0) {
      throw new Error("Service name cannot be empty");
    }
    if (args.durationMinutes <= 0) {
      throw new Error("Duration must be positive (in minutes)");
    }
    if (args.durationMinutes > 480) {
      throw new Error("Duration cannot exceed 8 hours (480 minutes)");
    }
    if (args.priceDkk < 0) {
      throw new Error("Price cannot be negative");
    }
    if (args.priceDkk > 100000) {
      throw new Error("Price seems unreasonably high");
    }

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
      throw new Error(
        "Unauthorized: Only owners and managers can update services"
      );
    }

    await ctx.db.patch(args.serviceId, {
      name: args.name.trim(),
      description: args.description.trim(),
      durationMinutes: args.durationMinutes,
      priceDkk: args.priceDkk,
      active: args.active,
    });
  },
});

// Delete Service
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
      throw new Error(
        "Unauthorized: Only owners and managers can delete services"
      );
    }

    // Safety check: prevent deletion if service has appointments
    const hasAppointments = await ctx.db
      .query("appointments")
      .filter((q) => q.eq(q.field("serviceId"), args.serviceId))
      .first();

    if (hasAppointments) {
      throw new Error(
        "Cannot delete service with existing appointments. Deactivate it instead."
      );
    }

    await ctx.db.delete(args.serviceId);
  },
});
