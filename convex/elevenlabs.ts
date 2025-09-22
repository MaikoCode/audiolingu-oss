"use node";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { R2 } from "@convex-dev/r2";
import { components, internal } from "./_generated/api";

const elevenlabs = new ElevenLabsClient();

export const generateAudio = internalAction({
  args: {
    script: v.string(),
    voiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const r2 = new R2(components.r2);
    const voiceId = args.voiceId || "KoVIHoyLDrQyd4pGalbs";
    const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
      text: args.script,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });
    // Read ReadableStream<Uint8Array> into a single Uint8Array
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    let totalLength = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        totalLength += value.length;
      }
    }
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }
    // Store directly to R2 to avoid returning huge arrays from actions
    const key = await r2.store(ctx, merged, { type: "audio/mpeg" });
    return { key, contentType: "audio/mpeg" } as const;
  },
});

export const getVoices = internalAction({
  args: {
    language: v.string(),
    gender: v.optional(v.string()),
    category: v.optional(v.string()),
    age: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const voices = await elevenlabs.voices.getShared({
      language: args.language,
      gender: args.gender,
      age: args.age,
      // @ts-expect-error - deactivated
      category: args.category,
      page_size: 10,
    });

    return voices;
  },
});

type VoiceSearchResult = {
  hasMore: boolean;
  voices: Array<{
    voiceId: string;
    name: string;
    gender?: "male" | "female" | "neutral";
    age?: "young" | "middle_aged" | "old";
    category?: "professional" | "famous" | "high_quality";
    language?: string;
    previewUrl?: string;
    imageUrl?: string;
    descriptive?: string;
  }>;
};

export const searchVoices = action({
  args: {
    language: v.string(),
    gender: v.optional(
      v.union(v.literal("male"), v.literal("female"), v.literal("neutral"))
    ),
    age: v.optional(
      v.union(v.literal("young"), v.literal("middle_aged"), v.literal("old"))
    ),
    category: v.optional(
      v.union(
        v.literal("professional"),
        v.literal("famous"),
        v.literal("high_quality")
      )
    ),
  },
  handler: async (ctx, args): Promise<VoiceSearchResult> => {
    const resUnknown = (await ctx.runAction(internal.elevenlabs.getVoices, {
      language: args.language,
      gender: args.gender,
      age: args.age,
      category: args.category,
    })) as unknown;

    const resObj =
      typeof resUnknown === "object" && resUnknown !== null
        ? (resUnknown as { hasMore?: boolean; voices?: unknown })
        : {};

    const rawVoices = Array.isArray(resObj.voices) ? resObj.voices : [];

    const voices: VoiceSearchResult["voices"] = rawVoices
      .map((v) =>
        typeof v === "object" && v !== null
          ? (v as Record<string, unknown>)
          : null
      )
      .filter((v): v is Record<string, unknown> => v !== null)
      .map((v) => ({
        voiceId:
          typeof v["voiceId"] === "string" ? (v["voiceId"] as string) : "",
        name: typeof v["name"] === "string" ? (v["name"] as string) : "",
        gender:
          typeof v["gender"] === "string"
            ? (v["gender"] as VoiceSearchResult["voices"][number]["gender"])
            : undefined,
        age:
          typeof v["age"] === "string"
            ? (v["age"] as VoiceSearchResult["voices"][number]["age"])
            : undefined,
        category:
          typeof v["category"] === "string"
            ? (v["category"] as VoiceSearchResult["voices"][number]["category"])
            : undefined,
        language:
          typeof v["language"] === "string"
            ? (v["language"] as string)
            : undefined,
        previewUrl:
          typeof v["previewUrl"] === "string"
            ? (v["previewUrl"] as string)
            : undefined,
        imageUrl:
          typeof v["imageUrl"] === "string"
            ? (v["imageUrl"] as string)
            : undefined,
        descriptive:
          typeof v["descriptive"] === "string"
            ? (v["descriptive"] as string)
            : undefined,
      }))
      .filter((v) => v.voiceId && v.name);

    return {
      hasMore: Boolean(resObj.hasMore),
      voices,
    };
  },
});

// export const getVoice = internalAction({
//   args: {
//     voiceId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const voice = await elevenlabs.voices.get("e6jXBfaeBHpXh71h9m2Z");
//     return voice;
//   },
// });
