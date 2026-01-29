import { v } from "convex/values";

import { query } from "./_generated/server";

export const getRecentStats = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    const todayEnd = new Date(now).setHours(23, 59, 59, 999);

    // Calculate start of 6 months ago for the chart range
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const sixMonthsAgoTimestamp = sixMonthsAgo.getTime();

    // Fetch data in parallel
    const [completedAppointments, todayAppointments, services, hairdressers] =
      await Promise.all([
        ctx.db
          .query("appointments")
          .withIndex("by_salon_status_and_start", (q) =>
            q
              .eq("salonId", args.salonId)
              .eq("status", "completed")
              .gte("startsAt", sixMonthsAgoTimestamp)
          )
          .take(1000),
        ctx.db
          .query("appointments")
          .withIndex("by_salon_and_start", (q) =>
            q
              .eq("salonId", args.salonId)
              .gte("startsAt", todayStart)
              .lte("startsAt", todayEnd)
          )
          .take(100),
        ctx.db
          .query("services")
          .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
          .collect(),
        ctx.db
          .query("hairdressers")
          .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
          .filter((q) => q.eq(q.field("active"), true)) // Only active hairdressers
          .collect(),
      ]);

    // Create lookup maps for O(1) access
    const servicePriceMap = new Map(services.map((s) => [s._id, s.priceDkk]));
    const hairdresserMap = new Map(hairdressers.map((h) => [h._id, h.name]));

    // Count today's bookings (excluding cancelled)
    const todayBookings = todayAppointments.filter(
      (appt) => appt.status !== "cancelled"
    ).length;

    // Initialize monthly buckets for last 6 months (using Danish locale)
    const monthlyStatsMap = new Map<
      string,
      { earnings: number; cuts: number }
    >();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const key = date.toLocaleString("da-DK", { month: "long" });
      monthlyStatsMap.set(key, { earnings: 0, cuts: 0 });
    }

    // Track hairdresser performance
    const hairdresserStatsMap = new Map<string, number>();

    // Process completed appointments
    completedAppointments.forEach((appt) => {
      const price = servicePriceMap.get(appt.serviceId) || 0;

      // Aggregate monthly statistics (Danish locale)
      const date = new Date(appt.startsAt);
      const monthKey = date.toLocaleString("da-DK", { month: "long" });
      if (monthlyStatsMap.has(monthKey)) {
        const current = monthlyStatsMap.get(monthKey)!;
        current.earnings += price;
        current.cuts += 1;
      }

      // Aggregate hairdresser statistics (only if hairdresser still exists and is active)
      const hairdresserName = hairdresserMap.get(appt.hairdresserId);
      if (hairdresserName) {
        hairdresserStatsMap.set(
          hairdresserName,
          (hairdresserStatsMap.get(hairdresserName) || 0) + 1
        );
      }
    });

    // Convert maps to arrays
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

    // Handle empty state for hairdresser chart
    if (hairdresserData.length === 0) {
      hairdresserData.push({
        hairdresser: "Ingen data",
        bookings: 0,
      });
    }

    return {
      todayBookings,
      monthlyData,
      hairdresserData,
    };
  },
});

export const getLifetimeStats = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    // Use pre-computed stats for O(1) lookup
    const cachedStats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .first();

    if (cachedStats) {
      return {
        totalEarnings: cachedStats.totalEarnings,
        totalCuts: cachedStats.totalCuts,
      };
    }

    // Fallback: calculate on the fly if stats don't exist
    const [completedAppointments, services] = await Promise.all([
      ctx.db
        .query("appointments")
        .withIndex("by_salon_status_and_start", (q) =>
          q.eq("salonId", args.salonId).eq("status", "completed")
        )
        .take(10000),
      ctx.db
        .query("services")
        .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
        .collect(),
    ]);

    const servicePriceMap = new Map(services.map((s) => [s._id, s.priceDkk]));

    let totalEarnings = 0;
    const totalCuts = completedAppointments.length;

    completedAppointments.forEach((appt) => {
      totalEarnings += servicePriceMap.get(appt.serviceId) || 0;
    });

    return {
      totalEarnings,
      totalCuts,
    };
  },
});
