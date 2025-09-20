import { internalAction } from "./_generated/server";
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
      response_format: "url", // Get URL instead of base64
    });
    const imageUrl = result?.data?.[0]?.url;
    console.log("The image url is: ", imageUrl);
    return imageUrl;
  },
});
