import { v } from "convex/values";

import { query } from "./_generated/server";

export const getCustomers = query({
  args: {
    salonId: v.id("salons"),
  },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .order("desc") // Most recently added first? Or maybe sort by name client side?
      .collect();

    // Sort by lastSeenAt desc by default?
    return customers.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
  },
});
