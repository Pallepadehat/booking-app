import { v } from "convex/values";

import { query } from "./_generated/server";

/**
 * Normalize phone number for consistent matching
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

export const getCustomers = query({
  args: {
    salonId: v.id("salons"),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 0;
    const pageSize = args.pageSize ?? 50;
    const offset = page * pageSize;

    let customers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();

    // Sort by lastSeenAt desc (most recent first)
    customers = customers.sort((a, b) => b.lastSeenAt - a.lastSeenAt);

    // Apply search filter if provided (case-insensitive + normalized phone)
    if (args.searchQuery && args.searchQuery.trim()) {
      const searchLower = args.searchQuery.toLowerCase();
      const searchNormalized = normalizePhone(args.searchQuery);

      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          normalizePhone(c.phone).includes(searchNormalized) ||
          (c.email && c.email.toLowerCase().includes(searchLower))
      );
    }

    // Paginate results
    const totalCount = customers.length;
    const paginatedCustomers = customers.slice(offset, offset + pageSize);

    return {
      customers: paginatedCustomers,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
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

    // Sort appointments: Future first (asc), then Past (desc)
    const now = Date.now();
    const future = appointments
      .filter((a) => a.startsAt >= now)
      .sort((a, b) => a.startsAt - b.startsAt);

    const past = appointments
      .filter((a) => a.startsAt < now)
      .sort((a, b) => b.startsAt - a.startsAt);

    const sortedAppointments = [...future, ...past];

    // Calculate stats
    const completedCount = appointments.filter(
      (a) => a.status === "completed"
    ).length;
    const cancelledCount = appointments.filter(
      (a) => a.status === "cancelled"
    ).length;
    const bookedCount = appointments.filter(
      (a) => a.status === "booked"
    ).length;

    // Calculate total spent (completed appointments only)
    let totalSpent = 0;
    for (const appt of appointments) {
      if (appt.status === "completed") {
        const service = await ctx.db.get(appt.serviceId);
        if (service) {
          totalSpent += service.priceDkk;
        }
      }
    }

    return {
      customer,
      appointments: sortedAppointments,
      stats: {
        totalBookings: appointments.length,
        completed: completedCount,
        cancelled: cancelledCount,
        booked: bookedCount,
        totalSpent, // New metric!
        cancelRate:
          appointments.length > 0
            ? Math.round((cancelledCount / appointments.length) * 100)
            : 0,
      },
    };
  },
});
