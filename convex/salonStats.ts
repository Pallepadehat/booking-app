import { v } from "convex/values";

import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Initialize salon stats for a new salon or recalculate from scratch
 * This should be called when creating a new salon or when doing a data migration
 */
export const initializeSalonStats = internalMutation({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    // Check if stats already exist
    const existing = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    if (existing) {
      // Update existing stats
      await ctx.db.patch(existing._id, {
        totalEarnings: 0,
        totalCuts: 0,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new stats record
      await ctx.db.insert("salonStats", {
        salonId: args.salonId,
        totalEarnings: 0,
        totalCuts: 0,
        lastUpdated: Date.now(),
      });
    }
  },
});

/**
 * Recalculate salon stats from all completed appointments
 * Use this for data migration or fixing inconsistencies
 */
export const recalculateSalonStats = internalMutation({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    // Fetch all completed appointments
    const completedAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_salon_status_and_start", (q) =>
        q.eq("salonId", args.salonId).eq("status", "completed")
      )
      .collect();

    // Fetch services for pricing
    const services = await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();

    const servicePriceMap = new Map(services.map((s) => [s._id, s.priceDkk]));

    // Calculate totals
    let totalEarnings = 0;
    let totalCuts = completedAppointments.length;

    completedAppointments.forEach((appt) => {
      totalEarnings += servicePriceMap.get(appt.serviceId) || 0;
    });

    // Update or create stats
    const existing = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalEarnings,
        totalCuts,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("salonStats", {
        salonId: args.salonId,
        totalEarnings,
        totalCuts,
        lastUpdated: Date.now(),
      });
    }
  },
});

/**
 * Increment salon stats when an appointment is completed
 * Call this from appointment mutations
 */
export const incrementSalonStats = mutation({
  args: {
    salonId: v.id("salons"),
    earnings: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate earnings
    if (args.earnings < 0) {
      console.error("Cannot increment with negative earnings:", args.earnings);
      throw new Error("Earnings must be non-negative");
    }

    const stats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    try {
      if (stats) {
        await ctx.db.patch(stats._id, {
          totalEarnings: stats.totalEarnings + args.earnings,
          totalCuts: stats.totalCuts + 1,
          lastUpdated: Date.now(),
        });
      } else {
        // Stats don't exist yet, create them
        await ctx.db.insert("salonStats", {
          salonId: args.salonId,
          totalEarnings: args.earnings,
          totalCuts: 1,
          lastUpdated: Date.now(),
        });
      }
    } catch (error) {
      console.error("Failed to increment salon stats:", error);
      // Log for reconciliation
      throw error;
    }
  },
});

/**
 * Decrement salon stats when a completed appointment is cancelled or deleted
 * Call this from appointment mutations
 */
export const decrementSalonStats = mutation({
  args: {
    salonId: v.id("salons"),
    earnings: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate earnings
    if (args.earnings < 0) {
      console.error("Cannot decrement with negative earnings:", args.earnings);
      throw new Error("Earnings must be non-negative");
    }

    const stats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    if (stats) {
      try {
        // Prevent negative values
        const newEarnings = Math.max(0, stats.totalEarnings - args.earnings);
        const newCuts = Math.max(0, stats.totalCuts - 1);

        // Warn if we're going negative (data inconsistency)
        if (stats.totalEarnings - args.earnings < 0) {
          console.warn(
            `Stats would go negative for salon ${args.salonId}. Clamping to 0. This indicates a data inconsistency.`
          );
        }

        await ctx.db.patch(stats._id, {
          totalEarnings: newEarnings,
          totalCuts: newCuts,
          lastUpdated: Date.now(),
        });
      } catch (error) {
        console.error("Failed to decrement salon stats:", error);
        throw error;
      }
    } else {
      console.warn(
        `Attempted to decrement stats for salon ${args.salonId} but no stats record exists`
      );
    }
  },
});

/**
 * Get salon stats (for debugging/testing)
 */
export const getSalonStats = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const stats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    return stats || null;
  },
});
