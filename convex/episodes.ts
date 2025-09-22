import {
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

const now = () => Date.now();

export const createDraft = internalMutation({
  args: {
    userId: v.id("users"),
    language: v.string(),
    proficiency_level: v.union(
      v.literal("A1"),
      v.literal("A2"),
      v.literal("B1"),
      v.literal("B2"),
      v.literal("C1")
    ),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const episodeId = await ctx.db.insert("episodes", {
      userId: args.userId,
      learningProfileId: undefined,
      language: args.language,
      proficiency_level: args.proficiency_level as
        | "A1"
        | "A2"
        | "B1"
        | "B2"
        | "C1",
      title: args.title ?? "Personalized Episode",
      cover_image_id: undefined,
      summary: undefined,
      topics: undefined,
      transcript: undefined,
      audioStorageId: undefined,
      durationSeconds: undefined,
      status: "generating",
      errorMessage: undefined,
      createdAt: now(),
      publishedAt: undefined,
      updatedAt: now(),
    });
    return { episodeId } as const;
  },
});

export const setScript = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    script: v.string(),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const update: Record<string, unknown> = {
      transcript: args.script,
      updatedAt: now(),
    };
    if (args.title !== undefined) update.title = args.title;
    if (args.summary !== undefined) update.summary = args.summary;
    await ctx.db.patch(args.episodeId, update);
  },
});

export const setCoverImage = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    coverKey: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.episodeId, {
      cover_image_id: args.coverKey,
      updatedAt: now(),
    });
  },
});

export const setAudio = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    audioKey: v.string(),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.episodeId, {
      audioStorageId: args.audioKey,
      durationSeconds: args.durationSeconds,
      updatedAt: now(),
    });
  },
});

export const setStatus = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("failed")
    ),
    errorMessage: v.optional(v.string()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.episodeId, {
      status: args.status,
      errorMessage: args.errorMessage,
      publishedAt: args.published ? now() : undefined,
      updatedAt: now(),
    });
  },
});

export const get = internalQuery({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.episodeId);
  },
});

// Public queries for listing episodes for the current user
export const myRecentEpisodes = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) return [];

    const limit = Math.min(Math.max(args.limit ?? 5, 1), 20);
    const page = await ctx.db
      .query("episodes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate({ cursor: null, numItems: limit });

    return page.page;
  },
});

export const myEpisodesPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
      return await ctx.db
        .query("episodes")
        .order("desc")
        .paginate({ cursor: null, numItems: 0 });

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user)
      return await ctx.db
        .query("episodes")
        .order("desc")
        .paginate({ cursor: null, numItems: 0 });

    return await ctx.db
      .query("episodes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const setFeedback = mutation({
  args: {
    episodeId: v.id("episodes"),
    feedback: v.optional(v.union(v.literal("good"), v.literal("bad"))),
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
    if (!user) throw new Error("Unauthorized");

    const episode = await ctx.db.get(args.episodeId);
    if (!episode || episode.userId !== user._id) throw new Error("Not found");

    await ctx.db.patch(args.episodeId, {
      feedback: args.feedback,
      updatedAt: now(),
    });

    return { ok: true } as const;
  },
});
