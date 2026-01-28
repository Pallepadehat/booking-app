import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  salons: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    ownerId: v.string(),
  }).index("by_owner", ["ownerId"]),

  memberships: defineTable({
    userId: v.string(),
    salonId: v.id("salons"),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("stylist")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_salon", ["salonId"]),

  // Services / behandlinger i en salon
  services: defineTable({
    salonId: v.id("salons"),
    name: v.string(), // fx "Dameklip kort"
    description: v.string(),
    durationMinutes: v.number(), // fx 30, 60
    priceDkk: v.number(), // lagres som heltal, fx 550
    active: v.boolean(),
  }).index("by_salon", ["salonId"]),

  // Frisører / medarbejdere
  hairdressers: defineTable({
    salonId: v.id("salons"),
    userId: v.optional(v.string()), // Better Auth user
    inviteCode: v.optional(v.string()), // "CUTN4K9P" - kobling
    name: v.string(),
    bio: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_salon", ["salonId"]),

  inviteCodes: defineTable({
    salonId: v.id("salons"),
    code: v.string(), // "CUTN4K9P"
    role: v.union(v.literal("stylist"), v.literal("manager")),
    usedBy: v.optional(v.string()), // null = unused
    expiresAt: v.number(), // auto expire efter 30 dage
    createdBy: v.string(),
  }).index("by_code", ["code"]),

  // Bookinger
  appointments: defineTable({
    salonId: v.id("salons"),
    hairdresserId: v.id("hairdressers"),
    serviceId: v.id("services"),
    // kunde-info: enten guest eller user
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),

    // timestamps som ms siden epoch
    startsAt: v.number(),
    endsAt: v.number(),

    // PUBLIC PORTAL FIELDS
    bookingCode: v.optional(v.string()), // 6-char alphanumeric
    customerSurname: v.optional(v.string()), // used as "password"

    status: v.union(
      v.literal("booked"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
    createdBy: v.optional(v.string()), // optional because public bookings have no user
  })
    .index("by_salon_and_start", ["salonId", "startsAt"])
    .index("by_hairdresser_and_start", ["hairdresserId", "startsAt"])
    .index("by_booking_code", ["bookingCode"]),
});
