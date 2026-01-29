import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  salons: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    ownerId: v.string(),
    openingHours: v.optional(
      v.object({
        monday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        tuesday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        wednesday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        thursday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        friday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        saturday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
        sunday: v.optional(
          v.object({ start: v.string(), end: v.string(), isOpen: v.boolean() })
        ),
      })
    ),
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

  customers: defineTable({
    salonId: v.id("salons"),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_salon", ["salonId"])
    .index("by_salon_and_phone", ["salonId", "phone"])
    .index("by_salon_and_email", ["salonId", "email"]),

  // Bookinger
  appointments: defineTable({
    salonId: v.id("salons"),
    hairdresserId: v.id("hairdressers"),
    serviceId: v.id("services"),

    // Linked customer (new way)
    customerId: v.optional(v.id("customers")),

    // Snapshotted customer info (legacy/robustness)
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()), // email is optional

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
    // Add index to find appointments by customer if needed, but not strictly required by task yet
    .index("by_customer", ["customerId"])
    .index("by_booking_code", ["bookingCode"])
    // Composite index for efficient status-based filtering (dashboard queries)
    .index("by_salon_status_and_start", ["salonId", "status", "startsAt"]),

  // Pre-computed statistics for instant dashboard loads
  // Updated incrementally by appointment mutations
  salonStats: defineTable({
    salonId: v.id("salons"),
    totalEarnings: v.number(), // Sum of all completed appointment earnings
    totalCuts: v.number(), // Count of all completed appointments
    lastUpdated: v.number(), // Timestamp of last update
  }).index("by_salon", ["salonId"]),
});
