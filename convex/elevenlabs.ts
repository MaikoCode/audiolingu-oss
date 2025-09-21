"use node";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";

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
