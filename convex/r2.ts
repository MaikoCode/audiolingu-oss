// convex/media.ts
import { internalAction } from "./_generated/server";
import { components } from "./_generated/api";
import { R2 } from "@convex-dev/r2";
import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";

const r2 = new R2(components.r2);

export const storeImageFromUrl = internalAction({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const res = await fetch(args.imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const blob = await res.blob();

    // Generate UUID for unique key
    const uuid = uuidv4();
    const fileExtension = blob.type === "image/png" ? "png" : "jpg";
    const key = await r2.store(ctx, blob, {
      key: `covers/${uuid}.${fileExtension}`,
      type: blob.type || "image/jpeg",
    });

    return { key };
  },
});

export const storeAudioFromBytes = internalAction({
  args: {
    bytes: v.array(v.number()),
    key: v.optional(v.string()), // optional custom object key
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, { bytes, key, contentType }) => {
    const audioBytes = new Uint8Array(bytes);

    const r2Key = await r2.store(ctx, audioBytes, {
      key, // omit for default UUID
      type: contentType ?? "audio/mpeg",
    });

    return { key: r2Key };
  },
});
