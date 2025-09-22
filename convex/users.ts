import { mutation, query, internalQuery } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const now = () => Date.now();

export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    return existing ?? null;
  },
});

export const current = internalQuery({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    return existing ?? null;
  },
});

export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    return await ensureUser(ctx);
  },
});

export const completeOnboarding = mutation({
  args: {
    target_language: v.string(),
    proficiency_level: v.union(
      v.literal("A1"),
      v.literal("A2"),
      v.literal("B1"),
      v.literal("B2"),
      v.literal("C1")
    ),
    interests: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    if (!user) user = await ensureUser(ctx);

    // Update user profile fields
    await ctx.db.patch(user!._id, {
      target_language: args.target_language,
      proficiency_level: args.proficiency_level,
      onboarding_completed: true,
      updatedAt: now(),
    });

    // Deactivate existing active learning profiles
    const existingProfiles = await ctx.db
      .query("learning_profiles")
      .withIndex("by_user", (q) => q.eq("userId", user!._id))
      .collect();
    await Promise.all(
      existingProfiles
        .filter((p) => p.active)
        .map((p) => ctx.db.patch(p._id, { active: false, updatedAt: now() }))
    );

    // Create active learning profile
    await ctx.db.insert("learning_profiles", {
      userId: user!._id,
      active: true,
      target_language: args.target_language,
      proficiency_level: args.proficiency_level,
      createdAt: now(),
      updatedAt: now(),
    });

    // Ensure topics exist and link interests
    for (const slug of args.interests) {
      const topic = await ctx.db
        .query("topics")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      const topicId =
        topic?._id ??
        (await ctx.db.insert("topics", {
          slug,
          title: slug
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          description: undefined,
          category: undefined,
          isActive: true,
          createdAt: now(),
          updatedAt: now(),
        }));

      const existingLink = await ctx.db
        .query("user_interests")
        .withIndex("by_user_topic", (q) =>
          q.eq("userId", user!._id).eq("topicId", topicId)
        )
        .unique();
      if (!existingLink) {
        await ctx.db.insert("user_interests", {
          userId: user!._id,
          topicId,
          weight: 1,
          createdAt: now(),
        });
      }
    }

    return { ok: true } as const;
  },
});

export const learningProfile = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const activeProfile = await ctx.db
      .query("learning_profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("active", true)
      )
      .unique();

    const fallbackTargetLanguage = user.target_language;
    const fallbackProficiency = user.proficiency_level;

    if (!fallbackTargetLanguage) {
      throw new Error("Target language is required");
    }
    if (!fallbackProficiency) {
      throw new Error("Proficiency level is required");
    }

    const learning = activeProfile;

    const links = await ctx.db
      .query("user_interests")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const topics = await Promise.all(links.map((l) => ctx.db.get(l.topicId)));
    const interests = topics.filter(Boolean).map((t) => t?.slug);

    return {
      learningProfile: {
        target_language: learning?.target_language,
        proficiency_level: learning?.proficiency_level,
        episode_duration: learning?.episode_duration ?? 5,
      },
      interests,
    };
  },
});

export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) return null;

    const activeProfile = await ctx.db
      .query("learning_profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("active", true)
      )
      .unique();

    return {
      userId: user._id,
      target_language:
        activeProfile?.target_language ?? user.target_language ?? null,
      proficiency_level:
        activeProfile?.proficiency_level ?? user.proficiency_level ?? null,
      episode_duration: activeProfile?.episode_duration ?? 10,
      preferred_voice: user.preferred_voice ?? null,
    } as const;
  },
});

export const updateLearningSettings = mutation({
  args: {
    target_language: v.optional(v.string()),
    proficiency_level: v.optional(
      v.union(
        v.literal("A1"),
        v.literal("A2"),
        v.literal("B1"),
        v.literal("B2"),
        v.literal("C1")
      )
    ),
    episode_duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) throw new Error("User not found");

    // Update quick-access fields on user if provided
    if (args.target_language || args.proficiency_level) {
      await ctx.db.patch(user._id, {
        target_language: args.target_language ?? user.target_language,
        proficiency_level:
          (args.proficiency_level as typeof user.proficiency_level) ??
          user.proficiency_level,
        updatedAt: now(),
      });
    }

    // Upsert active learning profile
    let activeProfile = await ctx.db
      .query("learning_profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", user._id).eq("active", true)
      )
      .unique();

    if (!activeProfile) {
      const newProfileId = await ctx.db.insert("learning_profiles", {
        userId: user._id,
        active: true,
        target_language: args.target_language ?? user.target_language ?? "en",
        proficiency_level:
          (args.proficiency_level as NonNullable<
            typeof user.proficiency_level
          >) ??
          (user.proficiency_level as NonNullable<
            typeof user.proficiency_level
          >) ??
          "A1",
        episode_duration: args.episode_duration ?? 10,
        createdAt: now(),
        updatedAt: now(),
      });
      activeProfile = (await ctx.db.get(newProfileId))!;
    } else {
      await ctx.db.patch(activeProfile._id, {
        target_language: args.target_language ?? activeProfile.target_language,
        proficiency_level:
          (args.proficiency_level as typeof activeProfile.proficiency_level) ??
          activeProfile.proficiency_level,
        episode_duration:
          args.episode_duration ?? activeProfile.episode_duration,
        updatedAt: now(),
      });
    }

    return { ok: true } as const;
  },
});

export const setPreferredVoice = mutation({
  args: {
    voiceId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      preferred_voice: args.voiceId,
      updatedAt: now(),
    });
    return { ok: true } as const;
  },
});

// Shared helper to ensure a user document exists for the current identity
const ensureUser = async (ctx: MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const byToken = await ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique();
  if (byToken) return byToken;

  const email = identity.email ?? "";
  const fullName = identity.name ?? "";
  const imageUrl = identity.pictureUrl ?? undefined;

  const [firstName, ...lastParts] = fullName.split(" ");
  const lastName = lastParts.join(" ");

  const userId = await ctx.db.insert("users", {
    email,
    first_name: firstName ?? "",
    last_name: lastName ?? "",
    image_url: imageUrl,
    tokenIdentifier: identity.tokenIdentifier,
    onboarding_completed: false,
    createdAt: now(),
    updatedAt: now(),
  });

  const created = await ctx.db.get(userId);
  return created!;
};
