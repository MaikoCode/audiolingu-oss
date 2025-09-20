import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
    await ctx.db.patch(args.episodeId, {
      transcript: args.script,
      title: args.title,
      summary: args.summary,
      updatedAt: now(),
    });
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
