import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const createInvite = mutation({
  args: {
    salonId: v.id("salons"),
    role: v.union(v.literal("manager"), v.literal("stylist")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Check if user is owner or manager of the salon
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("salonId"), args.salonId))
      .first();

    if (
      !membership ||
      (membership.role !== "owner" && membership.role !== "manager")
    ) {
      throw new Error("No permission to create invites");
    }

    // Generate a simple 8-char code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    await ctx.db.insert("inviteCodes", {
      salonId: args.salonId,
      code,
      role: args.role,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      createdBy: identity.subject,
    });

    return code;
  },
});

export const joinSalon = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const invite = await ctx.db
      .query("inviteCodes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!invite) throw new Error("Invalid code");
    if (invite.usedBy) throw new Error("Code already used");
    if (invite.expiresAt < Date.now()) throw new Error("Code expired");

    // Check if already a member
    const existingcheck = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.eq(q.field("salonId"), invite.salonId))
      .first();

    if (existingcheck) throw new Error("Already a member of this salon");

    await ctx.db.insert("memberships", {
      userId: identity.subject,
      salonId: invite.salonId,
      role: invite.role,
    });

    await ctx.db.patch(invite._id, {
      usedBy: identity.subject,
    });

    return invite.salonId;
  },
});
