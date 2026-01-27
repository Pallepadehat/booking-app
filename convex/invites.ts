import { v } from "convex/values";

import { mutation } from "./_generated/server";

// Generate invite code: "CUTN4K9P"
export const generateInviteCode = mutation({
  args: {
    salonId: v.id("salons"),
    role: v.union(v.literal("stylist"), v.literal("manager")),
  },
  handler: async (ctx, { salonId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    let code: string;
    do {
      code =
        Math.random().toString(36).substr(2, 4).toUpperCase() +
        Math.random().toString(36).substr(2, 4).toUpperCase();
    } while (
      await ctx.db
        .query("inviteCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first()
    );

    return await ctx.db.insert("inviteCodes", {
      salonId,
      code,
      role,
      usedBy: undefined,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dage
      createdBy: identity.subject,
    });
  },
});

// Redeem invite code
export const joinSalonWithCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const invite = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();

    if (!invite || invite.usedBy) throw new Error("Ugyldig eller brugt kode");

    const salonId = invite.salonId;

    // Opret hairdresser record
    const hairdresserId = await ctx.db.insert("hairdressers", {
      salonId,
      userId: identity.subject,
      inviteCode: code,
      name: identity.name || "Frisør",
      active: true,
    });

    // Markér som brugt
    await ctx.db.patch(invite._id, { usedBy: identity.subject });

    // Opret membership
    await ctx.db.insert("memberships", {
      userId: identity.subject,
      salonId,
      role: invite.role as any,
    });

    return { salonId, hairdresserId };
  },
});
