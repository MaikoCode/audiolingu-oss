import {
  internalMutation,
  internalQuery,
  query,
  mutation,
  action,
} from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const now = () => Date.now();

type NormalizedAlignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

const getArrayFromKeys = (
  obj: Record<string, unknown>,
  keys: string[]
): unknown[] => {
  for (const key of keys) {
    const value = obj[key];
    if (Array.isArray(value)) return value;
  }
  return [];
};

const isWordCharacter = (char: string): boolean => {
  if (!char) return false;
  // Basic alphanumerics first
  if (/^[A-Za-z0-9]$/.test(char)) return true;
  // Common accented letters and non-latin ranges fallback
  // This keeps runtime regex simple and avoids unsupported Unicode classes in some envs
  return /[À-ÖØ-öø-ÿĀ-žȘșȚțА-Яа-яΑ-Ωα-ω一-龯々〆〤가-힣]/.test(char);
};

const buildWordAlignments = (
  aligned: NormalizedAlignment
): { word: string; start: number; end: number }[] => {
  const chars = Array.isArray(aligned.characters) ? aligned.characters : [];
  const starts = Array.isArray(aligned.character_start_times_seconds)
    ? aligned.character_start_times_seconds
    : [];
  const ends = Array.isArray(aligned.character_end_times_seconds)
    ? aligned.character_end_times_seconds
    : [];

  const len = Math.min(chars.length, starts.length, ends.length);
  if (len === 0) return [];

  const results: { word: string; start: number; end: number }[] = [];
  let currentWord = "";
  let wordStart = 0;
  let wordEnd = 0;

  for (let i = 0; i < len; i++) {
    const rawChar = chars[i];
    const ch = typeof rawChar === "string" ? rawChar : String(rawChar ?? "");
    const isDelimiter = !isWordCharacter(ch) || /\s/.test(ch);
    const startTime = Number(starts[i]);
    const endTime = Number(ends[i]);
    const validTimes = Number.isFinite(startTime) && Number.isFinite(endTime);

    if (!isDelimiter && validTimes) {
      if (currentWord.length === 0) {
        wordStart = startTime;
      }
      currentWord += ch;
      wordEnd = endTime;
    } else {
      if (currentWord.length > 0) {
        results.push({ word: currentWord, start: wordStart, end: wordEnd });
        currentWord = "";
      }
    }
  }

  if (currentWord.length > 0) {
    results.push({ word: currentWord, start: wordStart, end: wordEnd });
  }

  return results;
};

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

export const setAlignedTranscript = internalMutation({
  args: {
    episodeId: v.id("episodes"),
    alignedTranscript: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.episodeId, {
      aligned_transcript: args.alignedTranscript,
      updatedAt: now(),
    });
  },
});

export const computeAndSaveWordAlignments = internalMutation({
  args: {
    episodeId: v.id("episodes"),
  },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (!episode) return;

    const raw = episode.aligned_transcript;
    if (typeof raw !== "string" || raw.length === 0) return;

    let parsed: NormalizedAlignment | null = null;
    try {
      const obj = JSON.parse(raw) as unknown;
      if (obj && typeof obj === "object") {
        const o = obj as Record<string, unknown>;
        const startArrayUnknown = getArrayFromKeys(o, [
          "character_start_times_seconds",
          "characterStartTimesSeconds",
        ]);
        const endArrayUnknown = getArrayFromKeys(o, [
          "character_end_times_seconds",
          "characterEndTimesSeconds",
        ]);
        parsed = {
          characters: Array.isArray(o.characters)
            ? (o.characters as unknown[]).map((c) => String(c))
            : [],
          character_start_times_seconds: startArrayUnknown.map((n) =>
            typeof n === "number" ? n : Number(n)
          ),
          character_end_times_seconds: endArrayUnknown.map((n) =>
            typeof n === "number" ? n : Number(n)
          ),
        };
      }
    } catch {
      parsed = null;
    }

    if (!parsed) return;
    const words = buildWordAlignments(parsed);
    console.log("word alignments: ", words);
    await ctx.db.patch(args.episodeId, {
      word_alignments: words.map((w) => ({
        word: w.word,
        start: w.start,
        end: w.end,
      })),
      updatedAt: now(),
    });
  },
});

const SENTENCE_BREAK_REGEX = /[\.\!\?…]+/; // ellipsis and common sentence enders

const buildSentenceAlignments = (
  aligned: NormalizedAlignment
): { text: string; start: number; end: number }[] => {
  const chars = Array.isArray(aligned.characters) ? aligned.characters : [];
  const starts = Array.isArray(aligned.character_start_times_seconds)
    ? aligned.character_start_times_seconds
    : [];
  const ends = Array.isArray(aligned.character_end_times_seconds)
    ? aligned.character_end_times_seconds
    : [];
  const len = Math.min(chars.length, starts.length, ends.length);
  if (len === 0) return [];

  const sentences: { text: string; start: number; end: number }[] = [];
  let buffer = "";
  let sentStart = Number.isFinite(starts[0]) ? Number(starts[0]) : 0;
  let lastValidEnd = sentStart;

  for (let i = 0; i < len; i++) {
    const ch = typeof chars[i] === "string" ? chars[i] : String(chars[i] ?? "");
    const start = Number(starts[i]);
    const end = Number(ends[i]);
    if (Number.isFinite(end)) lastValidEnd = end;
    buffer += ch;
    if (SENTENCE_BREAK_REGEX.test(ch)) {
      const text = buffer.trim();
      if (text) sentences.push({ text, start: sentStart, end: lastValidEnd });
      buffer = "";
      // Next sentence start is next char's start if valid, else carry lastValidEnd
      const nextStart = Number(starts[i + 1]);
      sentStart = Number.isFinite(nextStart) ? nextStart : lastValidEnd;
    }
  }

  const tail = buffer.trim();
  if (tail) sentences.push({ text: tail, start: sentStart, end: lastValidEnd });
  return sentences;
};

export const computeAndSaveSentenceAlignments = internalMutation({
  args: { episodeId: v.id("episodes") },
  handler: async (ctx, args) => {
    const episode = await ctx.db.get(args.episodeId);
    if (!episode) return;
    const raw = episode.aligned_transcript;
    if (typeof raw !== "string" || raw.length === 0) return;

    let parsed: NormalizedAlignment | null = null;
    try {
      const obj = JSON.parse(raw) as Record<string, unknown>;
      const startArrayUnknown = getArrayFromKeys(obj, [
        "character_start_times_seconds",
        "characterStartTimesSeconds",
      ]);
      const endArrayUnknown = getArrayFromKeys(obj, [
        "character_end_times_seconds",
        "characterEndTimesSeconds",
      ]);
      parsed = {
        characters: Array.isArray(obj.characters)
          ? (obj.characters as unknown[]).map((c) => String(c))
          : [],
        character_start_times_seconds: startArrayUnknown.map((n) =>
          typeof n === "number" ? n : Number(n)
        ),
        character_end_times_seconds: endArrayUnknown.map((n) =>
          typeof n === "number" ? n : Number(n)
        ),
      };
    } catch {
      parsed = null;
    }
    if (!parsed) return;

    const sentences = buildSentenceAlignments(parsed);
    await ctx.db.patch(args.episodeId, {
      sentence_alignments: sentences,
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

export const getPastSummaries = internalQuery({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 10, 1), 50);
    const page = await ctx.db
      .query("episodes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate({ cursor: null, numItems: limit });

    return page.page.map((e) => ({
      title: e.title,
      summary: e.summary,
    }));
  },
});

export const getFeedbackData = internalQuery({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);

    // Fetch all episodes with feedback
    const allEpisodes = await ctx.db
      .query("episodes")
      .withIndex("by_user_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Filter episodes that have feedback
    const episodesWithFeedback = allEpisodes
      .filter((e) => e.feedback !== undefined)
      .slice(0, limit);

    return episodesWithFeedback.map((e) => ({
      episodeId: e._id,
      title: e.title,
      summary: e.summary,
      transcript: e.transcript,
      language: e.language,
      proficiency_level: e.proficiency_level,
      durationSeconds: e.durationSeconds,
      feedback: e.feedback,
      feedbackComment: e.feedbackComment,
      createdAt: e.createdAt,
    }));
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
    feedbackComment: v.optional(v.string()),
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
      feedbackComment: args.feedbackComment,
      updatedAt: now(),
    });

    // Schedule feedback analysis in the background
    console.log("Scheduling feedback analysis for user ", user._id);
    await ctx.scheduler.runAfter(
      0,
      internal.agents.analyzeFeedbackAndUpdatePrompt,
      {
        userId: user._id,
      }
    );

    return { ok: true } as const;
  },
});
