import { v } from "convex/values";

import { query } from "./_generated/server";

export const getDashboardStats = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    const todayEnd = new Date(now).setHours(23, 59, 59, 999);

    // Fetch all appointments for the salon
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_salon_and_start", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Fetch all services to map price
    const services = await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Create a map for service prices for O(1) lookup
    const servicePriceMap = new Map(services.map((s) => [s._id, s.priceDkk]));
    // Also map duration just in case
    const serviceDurationMap = new Map(
      services.map((s) => [s._id, s.durationMinutes])
    );

    // Fetch hairdressers for name mapping
    const hairdressers = await ctx.db
      .query("hairdressers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();
    const hairdresserMap = new Map(hairdressers.map((h) => [h._id, h.name]));

    let todayBookings = 0;
    let totalEarnings = 0;
    let totalCuts = 0;

    // Data structures for charts
    const monthlyStatsMap = new Map<
      string,
      { earnings: number; cuts: number }
    >();
    const hairdresserStatsMap = new Map<string, number>();

    // Initialize last 6 months in the map to ensure we have data points even if 0
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleString("default", { month: "long" });
      monthlyStatsMap.set(key, { earnings: 0, cuts: 0 });
    }

    appointments.forEach((appt) => {
      // 1. Today's Bookings (count all, regardless of status, or maybe just booked/completed?)
      // Let's count "booked" and "completed" for today.
      if (appt.startsAt >= todayStart && appt.startsAt <= todayEnd) {
        if (appt.status !== "cancelled") {
          todayBookings++;
        }
      }

      // 2. Total Earnings & Cuts (Only completed)
      if (appt.status === "completed") {
        totalCuts++;

        const price = servicePriceMap.get(appt.serviceId) || 0;
        totalEarnings += price;

        // 3. Monthly Data
        const date = new Date(appt.startsAt);
        const monthKey = date.toLocaleString("default", { month: "long" });

        // We only care about the last ~6 months for the chart, but simpler to just aggregate all
        // and filter or just let the map handle it if we pre-seeded.
        // If the appointment is older than 6 months and we didn't pre-seed it, it won't be shown if we iterate the map keys?
        // Let's just update if it exists in our pre-seeded map (last 6 months)
        if (monthlyStatsMap.has(monthKey)) {
          const current = monthlyStatsMap.get(monthKey)!;
          current.earnings += price;
          current.cuts += 1;
        }

        // 4. Hairdresser Stats
        const hdName = hairdresserMap.get(appt.hairdresserId) || "Unknown";
        const currentHdCount = hairdresserStatsMap.get(hdName) || 0;
        hairdresserStatsMap.set(hdName, currentHdCount + 1);
      }
    });

    const monthlyData = Array.from(monthlyStatsMap.entries()).map(
      ([month, data]) => ({
        month,
        earnings: data.earnings,
        cuts: data.cuts,
      })
    );

    const hairdresserData = Array.from(hairdresserStatsMap.entries()).map(
      ([name, bookings]) => ({
        hairdresser: name,
        bookings,
      })
    );

    return {
      todayBookings,
      totalEarnings,
      totalCuts,
      monthlyData,
      hairdresserData,
    };
  },
});
