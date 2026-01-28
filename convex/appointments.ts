import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getAppointments = query({
  args: {
    salonId: v.id("salons"),
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    // Determine the range of dates to query
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_salon_and_start", (q) =>
        q.eq("salonId", args.salonId).gte("startsAt", args.from)
      )
      .filter((q) => q.lte(q.field("startsAt"), args.to))
      .collect();

    return appointments;
  },
});

export const createAppointment = mutation({
  args: {
    salonId: v.id("salons"),
    hairdresserId: v.id("hairdressers"),
    serviceId: v.id("services"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    startsAt: v.number(),
    // We can calculate endsAt based on service duration, but passing it is also fine if calculated on client
    // For now let's assume client calculates it or we look up service.
    // Let's pass it for simplicity from client, but verify?
    // The schema says endsAt is required.
    // Let's look up the service to get duration and calculate endsAt to be safe/consistent.
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const endsAt = args.startsAt + service.durationMinutes * 60 * 1000;

    // Check for existing customer
    let customerId: string | undefined;
    let customer = await ctx.db
      .query("customers")
      .withIndex("by_salon_and_phone", (q) =>
        q.eq("salonId", args.salonId).eq("phone", args.customerPhone)
      )
      .first();

    // If not found by phone, try email if provided
    if (!customer && args.customerEmail) {
      customer = await ctx.db
        .query("customers")
        .withIndex("by_salon_and_email", (q) =>
          q.eq("salonId", args.salonId).eq("email", args.customerEmail)
        )
        .first();
    }

    const now = Date.now();

    if (customer) {
      customerId = customer._id;
      // Update lastSeenAt
      await ctx.db.patch(customer._id, {
        lastSeenAt: now,
        // Update name if changed? Maybe keep original? Let's just update lastSeenAt for now.
        // Actually, updating name/email might be good if they changed,
        // but let's stick to simple logic: "register creates/links".
      });
    } else {
      // Create new customer
      customerId = await ctx.db.insert("customers", {
        salonId: args.salonId,
        name: args.customerName,
        phone: args.customerPhone,
        email: args.customerEmail,
        firstSeenAt: now,
        lastSeenAt: now,
      });
    }

    const appointmentId = await ctx.db.insert("appointments", {
      salonId: args.salonId,
      hairdresserId: args.hairdresserId,
      serviceId: args.serviceId,
      customerId: customerId as any, // Cast to any to avoid type check until schema regen picks it up
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      startsAt: args.startsAt,
      endsAt,
      status: "booked",
      createdBy: identity.subject,
    });

    return appointmentId;
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("booked"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.patch(args.appointmentId, {
      status: args.status,
    });
  },
});
