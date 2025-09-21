import { internalAction } from "./_generated/server";
import { components } from "./_generated/api";
import { R2 } from "@convex-dev/r2";
import OpenAI from "openai";
import { v } from "convex/values";

const openai = new OpenAI();

export const generateCoverImage = internalAction({
  args: {
    script: v.string(),
  },
  handler: async (ctx, args) => {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: args.script,
      size: "1024x1024",
    });
    const b64 = result?.data?.[0]?.b64_json;
    if (!b64) return null;
    // Convert base64 string to bytes without Buffer using atob polyfill
    // atob is available in the Convex action runtime
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const r2 = new R2(components.r2);
    const key = await r2.store(ctx, bytes, { type: "image/png" });
    return key;
  },
});
