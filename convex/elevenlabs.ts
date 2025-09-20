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
    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text: args.script,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });
    return audio;
  },
});
