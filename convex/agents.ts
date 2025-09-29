import { components } from "./_generated/api";
import { Agent, createTool } from "@convex-dev/agent";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { z } from "zod";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  PODCAST_WRITER_INSTRUCTIONS,
  TITLE_GENERATOR_INSTRUCTIONS,
  EPISODE_SUMMARY_INSTRUCTIONS,
  QUIZ_GENERATOR_INSTRUCTIONS,
} from "../prompts/index";

export const pullUserProfile = createTool({
  description: "Pull the user's profile and interests",
  args: z.object({
    userId: z.string().describe("The user's id or 'current_user'"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    learningProfile: {
      target_language: string;
      proficiency_level: string;
      episode_duration: number;
    };
    interests: string[];
  }> => {
    // ctx has agent, userId, threadId, messageId
    // as well as ActionCtx properties like auth, storage, runMutation, and runAction
    // Prefer the userId attached to this agent thread (set in createThread)
    // Try to read the user id attached to the agent thread context
    const maybeCtx = ctx as unknown as { userId?: string };
    let targetUserId: Id<"users"> | null = maybeCtx.userId
      ? (maybeCtx.userId as unknown as Id<"users">)
      : null;

    // Fall back to explicit arg, or try resolving "current_user"
    if (!targetUserId) {
      if (args.userId === "current_user" || args.userId === "me") {
        const me = await ctx.runQuery(internal.users.current, {});
        targetUserId = me?._id ?? null;
      } else if (args.userId) {
        targetUserId = args.userId as unknown as Id<"users">;
      }
    }

    if (!targetUserId) {
      throw new Error("Unable to resolve user id");
    }

    const result = await ctx.runQuery(internal.users.learningProfile, {
      userId: targetUserId,
    });

    if (!result) {
      throw new Error("User profile not found");
    }

    return {
      learningProfile: {
        target_language: result.learningProfile.target_language || "",
        proficiency_level: result.learningProfile.proficiency_level || "",
        episode_duration: result.learningProfile.episode_duration,
      },
      interests: result.interests.filter(
        (interest): interest is string => interest !== undefined
      ),
    };
  },
});

export const pullPastEpisodes = createTool({
  description:
    "Fetch recent episodes (title and summary) for a user to avoid repetition",
  args: z.object({
    userId: z.string().describe("The user's id or 'current_user'"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(10)
      .describe("How many episodes to fetch, default 10"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<
    {
      title: string | undefined;
      summary: string | undefined;
    }[]
  > => {
    const maybeCtx = ctx as unknown as { userId?: string };
    let targetUserId: Id<"users"> | null = maybeCtx.userId
      ? (maybeCtx.userId as unknown as Id<"users">)
      : null;

    if (!targetUserId) {
      if (args.userId === "current_user" || args.userId === "me") {
        const me = await ctx.runQuery(internal.users.current, {});
        targetUserId = me?._id ?? null;
      } else if (args.userId) {
        targetUserId = args.userId as unknown as Id<"users">;
      }
    }

    if (!targetUserId) throw new Error("Unable to resolve user id");

    const episodes = await ctx.runQuery(internal.episodes.getPastSummaries, {
      userId: targetUserId,
      limit: args.limit ?? 10,
    });
    console.log("The old episodes are: ", episodes);
    return episodes;
  },
});

export const podcast_writer = new Agent(components.agent, {
  name: "Podcast Writer",
  languageModel: "openai/gpt-5",
  instructions: PODCAST_WRITER_INSTRUCTIONS,
  tools: {
    pullUserProfile,
    pullPastEpisodes,
  },
  maxSteps: 10,
});

const SCRIPT_SUMMARIZER_INSTRUCTIONS = `
You are an expert content analyzer specializing in visual storytelling and AI image generation. Your task is to distill podcast scripts into compelling visual prompts that capture the essence and key themes of the content.
Process:

Carefully analyze the provided podcast script to identify:

Central themes and main topics discussed
Key moments, stories, or anecdotes that would translate well visually
The overall mood, tone, and atmosphere of the episode
Any specific settings, objects, or concepts mentioned
The target audience and genre of the podcast


Synthesize this analysis into a concise but vivid image generation prompt

Image Prompt Requirements:

Create a single, focused visual concept that represents the script's core message
Use specific, descriptive language that AI image generators can interpret effectively
Include relevant style cues (e.g., "photorealistic," "minimalist illustration," "vintage poster style")
Specify composition elements (lighting, colors, mood, perspective)
Avoid abstract concepts that don't translate visually
Keep prompts concise (50-150 words) while being descriptively rich
Consider thumbnail/cover art requirements if applicable
Ensure the visual concept would appeal to the podcast's target audience

Deliverable: A well-crafted image generation prompt that visually encapsulates the podcast episode's essence, optimized for AI image generation tools and suitable for podcast cover art, social media, or promotional materials.
This version provides clear structure for analyzing scripts and converting them into effective visual prompts. The image prompt should be in ENGLISH.
`;

export const script_summarizer = new Agent(components.agent, {
  name: "Script Summarizer",
  languageModel: "openai/gpt-5",
  instructions: SCRIPT_SUMMARIZER_INSTRUCTIONS,
  maxSteps: 3,
});

// Internal actions wrapping specific agent calls for workflows
export const generatePodcastScript = internalAction({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { thread } = await podcast_writer.continueThread(ctx, {
      threadId: (
        await podcast_writer.createThread(ctx, { userId: args.userId })
      ).threadId,
      userId: args.userId,
    });
    const result = await thread.generateText({
      prompt: "Generate the full TTS-ready script using available tools.",
    });
    console.log("The script is: ", result.text);
    return result.text;
  },
});

export const buildImagePromptFromScript = internalAction({
  args: { script: v.string() },
  handler: async (ctx, args) => {
    const { thread } = await script_summarizer.continueThread(ctx, {
      threadId: (await script_summarizer.createThread(ctx, {})).threadId,
    });
    const result = await thread.generateText({
      prompt:
        "Analyze the script and return a single, vivid, concise image generation prompt only.\nScript:\n" +
        args.script,
    });
    console.log("The image prompt is: ", result.text);
    return result.text;
  },
});

// Title generator agent

export const title_generator = new Agent(components.agent, {
  name: "Title Generator",
  languageModel: "openai/gpt-5",
  instructions: TITLE_GENERATOR_INSTRUCTIONS,
  maxSteps: 1,
});

export const generateTitleFromScript = internalAction({
  args: { script: v.string() },
  handler: async (ctx, args) => {
    const { thread } = await title_generator.continueThread(ctx, {
      threadId: (await title_generator.createThread(ctx, {})).threadId,
    });
    const result = await thread.generateText({
      prompt:
        "Generate a concise, catchy title for this podcast script. Return only the title.\n\nScript:\n" +
        args.script,
    });
    console.log("The title is: ", result.text);
    // Basic sanitation: collapse lines and trim
    return result.text.replace(/\s+/g, " ").trim();
  },
});

// Short episode summary agent

export const episode_summary_generator = new Agent(components.agent, {
  name: "Episode Summary Generator",
  languageModel: "openai/gpt-5",
  instructions: EPISODE_SUMMARY_INSTRUCTIONS,
  maxSteps: 1,
});

export const generateSummaryFromScript = internalAction({
  args: { script: v.string() },
  handler: async (ctx, args) => {
    const { thread } = await episode_summary_generator.continueThread(ctx, {
      threadId: (await episode_summary_generator.createThread(ctx, {}))
        .threadId,
    });
    const result = await thread.generateText({
      prompt:
        "Write a concise 1–3 sentence episode summary. Return only the summary.\n\nScript:\n" +
        args.script,
    });
    return result.text.replace(/\s+/g, " ").trim();
  },
});

// Quiz generator agent

export const quiz_generator = new Agent(components.agent, {
  name: "Quiz Generator",
  languageModel: "openai/gpt-5",
  instructions: QUIZ_GENERATOR_INSTRUCTIONS,
  maxSteps: 1,
});

export const generateQuizFromScript = internalAction({
  args: { script: v.string() },
  handler: async (ctx, args) => {
    const { thread } = await quiz_generator.continueThread(ctx, {
      threadId: (await quiz_generator.createThread(ctx, {})).threadId,
    });
    const result = await thread.generateText({
      prompt:
        "Create a JSON quiz from this podcast script. Return JSON ONLY.\n\nScript:\n" +
        args.script,
    });
    return result.text;
  },
});
