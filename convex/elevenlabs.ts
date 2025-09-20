"use node";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const elevenlabs = new ElevenLabsClient();

export const generateAudio = internalAction({
  args: {
    script: v.string(),
    voiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
    const bytes = Array.from(merged);
    return { bytes, contentType: "audio/mpeg" } as const;
  },
});
