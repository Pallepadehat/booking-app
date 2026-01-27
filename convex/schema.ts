import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  salons: defineTable({
    name: v.string(),
    address: v.string(),
    city: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  memberships: defineTable({
    userId: v.string(),
    salonId: v.id("salons"),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("stylist"),
    ),
    createdAt: v.number(),
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
    createdAt: v.number(),
  }).index("by_salon", ["salonId"]),

  // Frisører / medarbejdere
  hairdressers: defineTable({
    salonId: v.id("salons"),
    userId: v.string(), // hvis frisør også logger ind
    name: v.string(),
    bio: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_salon", ["salonId"]),

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

    status: v.union(
      v.literal("booked"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),

    createdAt: v.number(),
    createdBy: v.string(),
  })
    .index("by_salon_and_start", ["salonId", "startsAt"])
    .index("by_hairdresser_and_start", ["hairdresserId", "startsAt"]),
});
