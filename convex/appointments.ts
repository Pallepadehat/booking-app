import { v } from "convex/values";

import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/**
 * Normalize phone number for consistent matching
 * Removes spaces, hyphens, parentheses
 */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const getAppointments = query({
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Validate inputs
    if (args.customerName.trim().length === 0) {
      throw new Error("Customer name is required");
    }
    if (args.customerPhone.trim().length === 0) {
      throw new Error("Customer phone is required");
    }
    if (args.customerEmail && !isValidEmail(args.customerEmail)) {
      throw new Error("Invalid email format");
    }

    // Validate appointment is not in the past (with 5min grace period)
    const now = Date.now();
    if (args.startsAt < now - 5 * 60 * 1000) {
      throw new Error("Cannot create appointment in the past");
    }

    // Verify hairdresser exists and belongs to this salon
    const hairdresser = await ctx.db.get(args.hairdresserId);
    if (!hairdresser) {
      throw new Error("Hairdresser not found");
    }
    if (hairdresser.salonId !== args.salonId) {
      throw new Error("Hairdresser does not belong to this salon");
    }
    if (!hairdresser.active) {
      throw new Error("Hairdresser is not active");
    }

    // Verify service exists and belongs to this salon
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new Error("Service not found");
    }
    if (service.salonId !== args.salonId) {
      throw new Error("Service does not belong to this salon");
    }
    if (!service.active) {
      throw new Error("Service is not active");
    }

    const endsAt = args.startsAt + service.durationMinutes * 60 * 1000;

    // Check for scheduling conflicts
    const hasConflict = await ctx.db
      .query("appointments")
      .withIndex("by_hairdresser_and_start", (q) =>
        q
          .eq("hairdresserId", args.hairdresserId)
          .gte("startsAt", args.startsAt - service.durationMinutes * 60 * 1000)
      )
      .filter((q) =>
        q.and(
          q.lt(q.field("startsAt"), endsAt),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (hasConflict) {
      throw new Error(
        "Hairdresser is already booked during this time. Please choose another time."
      );
    }

    // Find or create customer with normalized phone
    const normalizedPhone = normalizePhone(args.customerPhone);
    let customerId: Id<"customers"> | undefined;

    // Try to find by normalized phone first
    const allCustomers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", args.salonId))
      .collect();

    let customer = allCustomers.find(
      (c) => normalizePhone(c.phone) === normalizedPhone
    );

    // If not found by phone and email provided, try email
    if (!customer && args.customerEmail) {
      const emailCustomer = await ctx.db
        .query("customers")
        .withIndex("by_salon_and_email", (q) =>
          q.eq("salonId", args.salonId).eq("email", args.customerEmail)
        )
        .first();
      if (emailCustomer) {
        customer = emailCustomer;
      }
    }

    if (customer) {
      customerId = customer._id;
      // Update customer info if changed (keep data current)
      const updates: any = {
        lastSeenAt: now,
      };
      if (customer.name !== args.customerName) {
        updates.name = args.customerName;
      }
      if (args.customerEmail && customer.email !== args.customerEmail) {
        updates.email = args.customerEmail;
      }
      if (customer.phone !== args.customerPhone) {
        updates.phone = args.customerPhone;
      }

      await ctx.db.patch(customer._id, updates);
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
      customerId,
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

    // Get the current appointment
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    const oldStatus = appointment.status;
    const newStatus = args.status;

    // Prevent completing appointments that haven't happened yet
    if (newStatus === "completed" && appointment.startsAt > Date.now()) {
      throw new Error("Cannot complete an appointment that hasn't started yet");
    }

    // Update appointment status
    await ctx.db.patch(args.appointmentId, {
      status: newStatus,
    });

    // Update stats if status changed to/from completed
    if (oldStatus !== newStatus) {
      const service = await ctx.db.get(appointment.serviceId);
      const earnings = service?.priceDkk || 0;

      try {
        // If changing TO completed: increment stats
        if (newStatus === "completed" && oldStatus !== "completed") {
          await ctx.runMutation(api.salonStats.incrementSalonStats, {
            salonId: appointment.salonId,
            earnings,
          });
        }

        // If changing FROM completed to something else: decrement stats
        if (oldStatus === "completed" && newStatus !== "completed") {
          await ctx.runMutation(api.salonStats.decrementSalonStats, {
            salonId: appointment.salonId,
            earnings,
          });
        }
      } catch (error) {
        console.error("Failed to update salon stats:", error);
        // Stats update failed but appointment was updated
        // This should trigger a reconciliation job in production
      }
    }

    // Return updated appointment
    return await ctx.db.get(args.appointmentId);
  },
});

/**
 * Delete an appointment
 * Only allowed for appointments that haven't been completed
 */
export const deleteAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Cannot delete completed appointments (data integrity)
    if (appointment.status === "completed") {
      throw new Error(
        "Cannot delete completed appointment. Cancel it instead."
      );
    }

    await ctx.db.delete(args.appointmentId);

    return { success: true };
  },
});
