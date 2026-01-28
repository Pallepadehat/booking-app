import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// Public query to get salon details for the booking page
export const getSalonPublic = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.salonId);
  },
});

// Public: Get services for a salon
export const getServicesPublic = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// Public: Get hairdressers for a salon
export const getHairdressersPublic = query({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("hairdressers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

// Public: Get availability (appointments) without sensitive data
export const getPublicAvailability = query({
  args: {
    salonId: v.id("salons"),
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_salon_and_start", (q) =>
        q.eq("salonId", args.salonId).gte("startsAt", args.from)
      )
      .filter((q) => q.lte(q.field("startsAt"), args.to))
      .collect();

    // Map to only return necessary fields + obscure customer data
    return appointments.map((appt) => ({
      _id: appt._id,
      startsAt: appt.startsAt,
      endsAt: appt.endsAt,
      hairdresserId: appt.hairdresserId,
      status: appt.status,
    }));
  },
});

// Public: Create an appointment
export const createPublicAppointment = mutation({
  args: {
    salonId: v.id("salons"),
    hairdresserId: v.id("hairdressers"),
    serviceId: v.id("services"),
    customerName: v.string(),
    customerSurname: v.string(), // used for auth later
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    startsAt: v.number(),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const endsAt = args.startsAt + service.durationMinutes * 60 * 1000;

    // Generate a simple 6-char booking code (uppercase alphanumeric)
    const bookingCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const appointmentId = await ctx.db.insert("appointments", {
      salonId: args.salonId,
      hairdresserId: args.hairdresserId,
      serviceId: args.serviceId,
      customerName: args.customerName,
      customerSurname: args.customerSurname, // Save surname
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      startsAt: args.startsAt,
      endsAt,
      status: "booked",
      bookingCode, // Save code
    });

    return { appointmentId, bookingCode };
  },
});

// Public: Get appointment by code and surname
export const getMyAppointment = query({
  args: {
    bookingCode: v.string(),
    surname: v.string(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_booking_code", (q) =>
        q.eq("bookingCode", args.bookingCode)
      )
      .first();

    if (!appointment) return null;

    // Simple "auth" check
    if (
      !appointment.customerSurname ||
      appointment.customerSurname.toLowerCase() !== args.surname.toLowerCase()
    ) {
      return null;
    }

    // Fetch related details for display
    const salon = await ctx.db.get(appointment.salonId);
    const hairdresser = await ctx.db.get(appointment.hairdresserId);
    const service = await ctx.db.get(appointment.serviceId);

    return {
      appointment,
      salon,
      hairdresser,
      service,
    };
  },
});
