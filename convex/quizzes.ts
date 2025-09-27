import { internalMutation, action, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id, Doc } from "./_generated/dataModel";
import { v } from "convex/values";

const now = () => Date.now();

export const save = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    publicId: v.string(),
    title: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        prompt: v.string(),
        choices: v.array(v.string()),
        correctIndex: v.number(),
        explanation: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const quizId = await ctx.db.insert("quizzes", {
      episodeId: args.episodeId,
      publicId: args.publicId,
      title: args.title,
      questions: args.questions,
      createdAt: now(),
      updatedAt: now(),
    });
    return quizId;
  },
});

// Local helper to generate public ids
const generateQuizPublicId = (): string => {
  const rand = () => Math.random().toString(36).slice(2, 10);
  return `quiz_${rand()}${rand()}`.slice(0, 21);
};

// Public action: generate a quiz for an episode and return publicId
export const generateQuizForEpisode = action({
  args: { episodeId: v.id("episodes") },
  handler: async (
    ctx,
    args
  ): Promise<{ publicId: string; quizId: Id<"quizzes"> }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const episode = (await ctx.runQuery(internal.episodes.get, {
      episodeId: args.episodeId,
    })) as Doc<"episodes"> | null;
    if (!episode) throw new Error("Episode not found");

    const script = episode.transcript ?? "";
    if (!script || script.trim().length === 0)
      throw new Error("Episode has no script");

    const quizJson = await ctx.runAction(
      internal.agents.generateQuizFromScript,
      {
        script,
      }
    );

    let parsed: {
      title?: string;
      questions?: {
        id: string;
        prompt: string;
        choices: string[];
        correctIndex: number;
        explanation?: string;
      }[];
    } | null = null;
    try {
      parsed = JSON.parse(quizJson);
    } catch {
      throw new Error("Quiz generator returned invalid JSON");
    }
    if (
      !parsed ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    )
      throw new Error("Quiz has no questions");

    const publicId = generateQuizPublicId();

    const quizId = (await ctx.runMutation(internal.quizzes.save, {
      episodeId: args.episodeId,
      publicId,
      title: parsed.title ?? (episode.title || "Episode Quiz"),
      questions: parsed.questions.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? undefined,
      })),
    })) as Id<"quizzes">;

    return { publicId, quizId } as const;
  },
});

export const getQuizByPublicId = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_publicId", (q) => q.eq("publicId", args.id))
      .unique();
    if (!quiz) return null;
    return quiz;
  },
});

// Public query: get latest quiz publicId for an episode (if it exists)
export const getQuizPublicIdForEpisode = query({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, args) => {
    const list = await ctx.db
      .query("quizzes")
      .withIndex("by_episode", (q) => q.eq("episodeId", args.episodeId))
      .collect();
    if (!list || list.length === 0) return null;
    let latest = list[0];
    for (const q of list) {
      const t = (q.updatedAt as number | undefined) ?? (q.createdAt as number);
      const lt =
        (latest.updatedAt as number | undefined) ??
        (latest.createdAt as number);
      if (t > lt) latest = q;
    }
    return { publicId: latest.publicId, title: latest.title } as const;
  },
});
