import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const seedDashboardData = mutation({
  args: { salonId: v.id("salons") },
  handler: async (ctx, args) => {
    const salonId = args.salonId;

    // 1. Ensure Services
    let services = await ctx.db
      .query("services")
      .withIndex("by_salon", (q) => q.eq("salonId", salonId))
      .collect();

    if (services.length === 0) {
      const newServices = [
        { name: "Herreklip", duration: 30, price: 350 },
        { name: "Dameklip", duration: 60, price: 650 },
        { name: "Farvning", duration: 120, price: 1200 },
        { name: "Børneklip", duration: 30, price: 250 },
      ];

      for (const s of newServices) {
        await ctx.db.insert("services", {
          salonId,
          name: s.name,
          description: "Standard behandling",
          durationMinutes: s.duration,
          priceDkk: s.price,
          active: true,
        });
      }
      // Re-fetch
      services = await ctx.db
        .query("services")
        .withIndex("by_salon", (q) => q.eq("salonId", salonId))
        .collect();
    }

    // 2. Ensure Hairdressers
    let hairdressers = await ctx.db
      .query("hairdressers")
      .withIndex("by_salon", (q) => q.eq("salonId", salonId))
      .collect();

    if (hairdressers.length === 0) {
      const names = ["Alice", "Bob", "Charlie", "Diana"];
      for (const name of names) {
        await ctx.db.insert("hairdressers", {
          salonId,
          name,
          active: true,
          bio: `Experienced stylist named ${name}`,
        });
      }
      hairdressers = await ctx.db
        .query("hairdressers")
        .withIndex("by_salon", (q) => q.eq("salonId", salonId))
        .collect();
    }

    // 3. Ensure Customers
    let customers = await ctx.db
      .query("customers")
      .withIndex("by_salon", (q) => q.eq("salonId", salonId))
      .collect();

    if (customers.length === 0) {
      const customerNames = [
        "Emma Watson",
        "Liam Neeson",
        "Olivia Wilde",
        "Noah Centineo",
        "Ava Max",
        "Elijah Wood",
        "Sophia Turner",
        "James Bond",
      ];
      for (const name of customerNames) {
        await ctx.db.insert("customers", {
          salonId,
          name,
          phone: Math.floor(Math.random() * 90000000 + 10000000).toString(),
          firstSeenAt: Date.now(),
          lastSeenAt: Date.now(),
        });
      }
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salon", (q) => q.eq("salonId", salonId))
        .collect();
    }

    // 4. Generate Appointments (Last 6 Months + Next 1 Month)
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 6);

    // We want a good distribution.
    // Let's create ~300 appointments distributed randomly.
    const TOTAL_APPTS_TO_GENERATE = 300;

    for (let i = 0; i < TOTAL_APPTS_TO_GENERATE; i++) {
      // Random days from startDate to now + 30 days
      const limit = new Date(now);
      limit.setDate(limit.getDate() + 30);

      const randomTime =
        startDate.getTime() +
        Math.random() * (limit.getTime() - startDate.getTime());
      const apptDate = new Date(randomTime);

      // Random hour 9-17
      apptDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

      const service = services[Math.floor(Math.random() * services.length)];
      const hairdresser =
        hairdressers[Math.floor(Math.random() * hairdressers.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];

      let status: "completed" | "booked" | "cancelled" = "booked";
      if (apptDate < now) {
        status = Math.random() > 0.1 ? "completed" : "cancelled";
      }

      await ctx.db.insert("appointments", {
        salonId,
        hairdresserId: hairdresser._id,
        serviceId: service._id,
        customerId: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        startsAt: apptDate.getTime(),
        endsAt: apptDate.getTime() + service.durationMinutes * 60 * 1000,
        status,
      });
    }

    return "Seeded successfully!";
  },
});
