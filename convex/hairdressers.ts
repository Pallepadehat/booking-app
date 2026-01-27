import { v } from "convex/values";

import { query } from "./_generated/server";

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
