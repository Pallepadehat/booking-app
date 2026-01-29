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
        { name: "Dameklip Lang", duration: 90, price: 850 },
        { name: "Farvning", duration: 120, price: 1200 },
        { name: "Highlights", duration: 150, price: 1500 },
        { name: "Permanent", duration: 90, price: 900 },
        { name: "Børneklip", duration: 30, price: 250 },
        { name: "Skæg Trim", duration: 20, price: 200 },
        { name: "Styling", duration: 45, price: 400 },
        { name: "Bryllupshår", duration: 120, price: 1800 },
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
      const names = [
        "Emma",
        "Liam",
        "Sophia",
        "Noah",
        "Olivia",
        "Elijah",
        "Ava",
        "William",
        "Isabella",
        "James",
        "Mia",
        "Lucas",
      ];
      for (const name of names) {
        await ctx.db.insert("hairdressers", {
          salonId,
          name,
          active: true,
          bio: `Professional stylist with 5+ years experience`,
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
      // Generate 50 customers for realistic large salon
      const firstNames = [
        "Emma",
        "Liam",
        "Sophia",
        "Noah",
        "Olivia",
        "William",
        "Ava",
        "James",
        "Isabella",
        "Lucas",
        "Mia",
        "Alexander",
        "Charlotte",
        "Ethan",
        "Amelia",
        "Benjamin",
        "Harper",
        "Elijah",
        "Evelyn",
        "Logan",
        "Abigail",
        "Mason",
        "Emily",
        "Sebastian",
        "Ella",
        "Jack",
        "Scarlett",
        "Henry",
        "Grace",
        "Theodore",
        "Chloe",
        "Owen",
        "Camila",
        "Matthew",
        "Penelope",
        "Samuel",
        "Layla",
        "Joseph",
        "Aria",
        "David",
        "Zoey",
        "Carter",
        "Nora",
        "Wyatt",
        "Lily",
        "John",
        "Eleanor",
        "Dylan",
        "Hannah",
        "Luke",
      ];
      const lastNames = [
        "Hansen",
        "Nielsen",
        "Jensen",
        "Andersen",
        "Pedersen",
        "Christensen",
        "Larsen",
        "Sørensen",
        "Rasmussen",
        "Jørgensen",
        "Petersen",
        "Madsen",
        "Kristensen",
        "Olsen",
        "Thomsen",
        "Christiansen",
        "Poulsen",
        "Johansen",
        "Møller",
        "Mortensen",
        "Knudsen",
        "Jakobsen",
        "Winther",
        "Lund",
        "Bertelsen",
      ];

      const customerData = [];
      for (let i = 0; i < 50; i++) {
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        customerData.push({
          name: `${firstName} ${lastName}`,
          phone:
            `${20000000 + i * 100000 + Math.floor(Math.random() * 99999)}`.slice(
              0,
              8
            ),
        });
      }

      const now = Date.now();
      for (let i = 0; i < customerData.length; i++) {
        const data = customerData[i];
        // Stagger firstSeenAt to make it realistic
        const firstSeen =
          now - (customerData.length - i) * 30 * 24 * 60 * 60 * 1000; // 30 days apart
        await ctx.db.insert("customers", {
          salonId,
          name: data.name,
          phone: data.phone,
          email: `${data.name.toLowerCase().replace(" ", ".")}@example.com`,
          firstSeenAt: firstSeen,
          lastSeenAt: now,
        });
      }
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salon", (q) => q.eq("salonId", salonId))
        .collect();
    }

    // 4. Initialize salon stats
    const existingStats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", salonId))
      .first();

    if (!existingStats) {
      await ctx.db.insert("salonStats", {
        salonId,
        totalEarnings: 0,
        totalCuts: 0,
        lastUpdated: Date.now(),
      });
    }

    // 5. Generate Appointments - MASSIVE DATA! EVENLY distributed across 12 months
    const now = Date.now();
    const TOTAL_APPTS = 6000; // 6,000 appointments (500 per month - ensures we complete all 12 months!)
    const APPTS_PER_MONTH = TOTAL_APPTS / 12; // 500 per month

    // Track stats to update in batch (avoids hitting 16k write limit)
    let totalCompletedEarnings = 0;
    let totalCompletedCuts = 0;

    // Generate month by month for even distribution
    for (let monthAgo = 11; monthAgo >= 0; monthAgo--) {
      const monthStart = new Date(now);
      monthStart.setMonth(monthStart.getMonth() - monthAgo);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month
      monthEnd.setHours(23, 59, 59, 999);

      // Generate appointments for this specific month
      for (let i = 0; i < APPTS_PER_MONTH; i++) {
        // Random timestamp within THIS month only
        const randomTime =
          monthStart.getTime() +
          Math.random() * (monthEnd.getTime() - monthStart.getTime());
        const apptDate = new Date(randomTime);

        // Random business hour (9-17)
        apptDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

        const service = services[Math.floor(Math.random() * services.length)];
        const hairdresser =
          hairdressers[Math.floor(Math.random() * hairdressers.length)];
        const customer =
          customers[Math.floor(Math.random() * customers.length)];

        // Determine status
        let status: "completed" | "booked" | "cancelled" = "booked";
        if (apptDate.getTime() < now) {
          // Past: 85% completed, 15% cancelled
          status = Math.random() > 0.15 ? "completed" : "cancelled";
        }

        // Create appointment
        await ctx.db.insert("appointments", {
          salonId,
          hairdresserId: hairdresser._id,
          serviceId: service._id,
          customerId: customer._id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          startsAt: apptDate.getTime(),
          endsAt: apptDate.getTime() + service.durationMinutes * 60 * 1000,
          status,
          createdBy: "seed",
        });

        // Track stats (don't update DB each time - batch it!)
        if (status === "completed") {
          totalCompletedEarnings += service.priceDkk;
          totalCompletedCuts += 1;
        }
      }
    }

    // Update stats once at the end (single write instead of thousands!)
    const stats = await ctx.db
      .query("salonStats")
      .withIndex("by_salon", (q) => q.eq("salonId", salonId))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        totalEarnings: totalCompletedEarnings,
        totalCuts: totalCompletedCuts,
        lastUpdated: now,
      });
    }

    return `Seeded ${TOTAL_APPTS.toLocaleString()} appointments evenly across 12 months (${APPTS_PER_MONTH.toLocaleString()} per month)! Total: ${totalCompletedCuts.toLocaleString()} cuts, ${totalCompletedEarnings.toLocaleString("da-DK", { style: "currency", currency: "DKK" })}`;
  },
});
