import { components } from "./_generated/api";
import { Agent, createTool } from "@convex-dev/agent";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { z } from "zod";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const pullUserProfile = createTool({
  description: "Pull the user's profile and interests",
  args: z.object({
    userId: z.string().describe("The user's id"),
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
    const result = await ctx.runQuery(internal.users.learningProfile, {
      userId: args.userId as Id<"users">,
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

const PODCAST_WRITER_INSTRUCTIONS = `
You are an expert podcast scriptwriter specializing in TTS-optimized content. Your task is to create a podcast episode script specifically designed for text-to-speech synthesis.
Process:

First, use the pullUserProfile tool to gather comprehensive information about the user, including their interests, language level, duration of the episode and the target language to generate the script in.
Analyze this profile data to identify compelling stories, insights, and topics that translate well to audio format
Generate a complete TTS-ready podcast script featuring the user's experiences and perspective

TTS Script Requirements:

Write in clear, simple sentences that TTS models can pronounce naturally
Use phonetic spellings for difficult names, technical terms, or uncommon words
Include strategic pauses using ellipses (...) or line breaks for natural pacing
Avoid complex punctuation that might confuse TTS pronunciation
Structure content in digestible chunks with smooth transitions
Write numbers and dates in word form (e.g., "twenty twenty-four" not "2024")
Include pronunciation guides in brackets for technical terms [TECH-ni-cal]
Create engaging, conversational tone without relying on vocal inflection cues
Ensure content flows logically since there won't be human ad-libs or corrections

Deliverable: A TTS-optimized podcast script that sounds natural and engaging when synthesized, incorporating the user's unique profile while being technically compatible with text-to-speech systems.
`;

export const podcast_writer = new Agent(components.agent, {
  name: "Podcast Writer",
  languageModel: "openai/gpt-5",
  instructions: PODCAST_WRITER_INSTRUCTIONS,
  tools: {
    pullUserProfile,
  },
  maxSteps: 5,
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
This version provides clear structure for analyzing scripts and converting them into effective visual prompts.
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
    return result.text;
  },
});
