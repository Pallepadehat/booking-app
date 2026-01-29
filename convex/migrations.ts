/**
 * ONE-TIME MIGRATION SCRIPT
 * Run this once to populate salonStats for all existing salons
 *
 * How to run:
 * 1. Go to Convex Dashboard > Functions
 * 2. Run: migrations:populateAllSalonStats
 * 3. Wait for completion
 */
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

/**
 * Populate stats for all existing salons
 * This is a one-time migration to create cached stats
 */
export const populateAllSalonStats = internalMutation({
  handler: async (ctx) => {
    // Get all salons
    const salons = await ctx.db.query("salons").collect();

    console.log(`Found ${salons.length} salons to process`);

    // Process each salon
    for (const salon of salons) {
      console.log(`Processing salon: ${salon.name} (${salon._id})`);

      // Recalculate stats for this salon
      await ctx.scheduler.runAfter(
        0,
        internal.salonStats.recalculateSalonStats,
        {
          salonId: salon._id,
        }
      );
    }

    console.log("Migration queued for all salons!");
    return { processed: salons.length };
  },
});
