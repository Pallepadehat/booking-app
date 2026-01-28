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

export const getCustomerStats = query({
  args: {
    salonId: v.id("salons"),
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.salonId !== args.salonId) {
      return null;
    }

    // Fetch appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    // In a real app we might want to join services to get prices,
    // but for now let's just count and show list.
    // If services are needed for price calculation we can fetch them.

    // Sort appointments: Future first (asc), then Past (desc)
    const now = Date.now();
    const future = appointments
      .filter((a) => a.startsAt >= now)
      .sort((a, b) => a.startsAt - b.startsAt);

    const past = appointments
      .filter((a) => a.startsAt < now)
      .sort((a, b) => b.startsAt - a.startsAt);

    const sortedAppointments = [...future, ...past];

    // Calculate generic stats
    const completedCount = appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const cancelledCount = appointments.filter(
      (a) => a.status === "cancelled"
    ).length;
    const bookedCount = appointments.filter(
      (a) => a.status === "booked"
    ).length;

    return {
      customer,
      appointments: sortedAppointments,
      stats: {
        totalBookings: appointments.length,
        completed: completedCount,
        cancelled: cancelledCount,
        booked: bookedCount,
      },
    };
  },
});
