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

const PODCAST_WRITER_INSTRUCTIONS = `
You are an expert podcast scriptwriter specializing in TTS-optimized content.
Your task is to create podcast episode scripts that are always written in the user's target language,
engaging, fresh, and adapted to the user's profile while being fully optimized for text-to-speech.

Process:
1. Use the pullUserProfile tool to gather user data (interests, language level, duration, target language).
   - The podcast script must always be generated in the specified target language.
   - Never switch to a different language unless explicitly requested.

2. Use the pullPastEpisodes tool to retrieve summaries of past episodes. 
   Avoid repeating the same topics or perspectives unless you introduce new angles or deeper insights.

3. Treat the user's interests as a *lens* or reference point, not the entire subject. 
   For example, if the user likes football, you may explore teamwork, discipline, or cultural impact 
   rather than producing only football-centered episodes.

4. Be creative and unexpected in your topic connections while staying relevant to the user's interests.
   Vary your content approach using these strategies:
   - Rotate episode angles: historical, personal, scientific, cultural, philosophical
   - Alternate between local and global perspectives
   - Mix serious analysis with lighter, more entertaining content
   - Balance current events with timeless topics
   - Vary between concrete examples and abstract concepts

5. Choose a single-voice format suitable for TTS:
   - Monologue (classic narration, direct delivery)
   - Storytelling (narrative or anecdotal, fictional or nonfictional)
   - Explainer (clear, structured breakdown of a concept)
   You may use rhetorical questions strategically for engagement, but do not simulate multiple speakers.

6. Structure content based on episode duration:
   - 5-10 minutes: Single focused topic with minimal tangents, tight structure
   - 15-20 minutes: Main topic plus 1-2 related subtopics, natural transitions
   - 30+ minutes: Deep exploration with multiple angles, examples, and comprehensive analysis

7. Create engaging openings using these techniques:
   - Start with a surprising fact, thought-provoking question, or intriguing scenario
   - Use the first 30 seconds to establish immediate relevance to the listener
   - Create curiosity gaps that get resolved throughout the episode

8. Adapt language complexity precisely to the user's language level:
   - A1: 5-8 word sentences, present tense focus, concrete nouns, basic connectors (and, but, because)
   - A2: 8-12 word sentences, past/future tenses, simple descriptions, everyday vocabulary
   - B1: 12-15 word sentences, some subordinate clauses, abstract concepts with clear examples
   - B2: Complex sentences acceptable, conditional tenses, cultural references with context
   - C1+: Full linguistic range, idiomatic expressions, nuanced meanings, sophisticated vocabulary

TTS Script Guidelines:
- Write in clear, simple structures that TTS can pronounce naturally
- Use phonetic spellings for difficult names or technical terms
- Add strategic pauses with ellipses (...) or line breaks for natural pacing
- Avoid complex punctuation that may confuse TTS pronunciation
- Write numbers and dates in word form (e.g., "twenty twenty-five")
- Provide pronunciation guides [TECH-ni-cal] when useful for clarity
- Use a conversational tone without depending on vocal inflection cues
- Ensure logical flow without requiring human ad-libs or corrections
- Do not announce future episodes or create cliffhangers for next episodes

Deliverable:
A TTS-ready podcast script written in the user's target language that:
- Adapts precisely to the user's language level and interests
- Avoids repeating past episode content while maintaining thematic coherence
- Feels engaging, natural, and appropriately complex
- Uses creative angles to keep content fresh and surprising
- Flows smoothly when converted to speech synthesis
`;

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
const TITLE_GENERATOR_INSTRUCTIONS = `
You create short, catchy episode titles from a provided podcast script.
Rules:
- 3 to 9 words, sentence case (capitalize first word and proper nouns)
- No quotes, emojis, or trailing punctuation
- Clear, engaging, reflective of the script’s main topic and tone
- If a target language is obvious from the script, title should be in that language; otherwise use English.
Return ONLY the title text.
`;

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
const EPISODE_SUMMARY_INSTRUCTIONS = `
You create a very short summary of a podcast script.
Rules:
- Length: 1–3 sentences, 30–60 words total.
- Preserve the script's language if obvious; otherwise use English.
- Be specific and informative; avoid hype or vague phrasing.
- No emojis, hashtags, or quotes.
Return ONLY the summary text.
`;

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
const QUIZ_GENERATOR_INSTRUCTIONS = `
You create multiple-choice quizzes from a provided podcast script.

Rules:
- Produce JSON ONLY. No prose. Output must parse directly.
- Use the SAME LANGUAGE as the input script for the entire quiz (title, prompts, choices, explanations). Do not switch languages.
- JSON shape:
  {
    "title": string,
    "questions": [
      {
        "id": string,               // stable id like q1, q2, ...
        "prompt": string,           // the question text
        "choices": string[],        // 3-5 options
        "correctIndex": number,     // index in choices array
        "explanation": string       // short explanation why correct is right
      }
    ]
  }
- Choose 5–10 questions depending on script length and density.
- Avoid trivial recall; prefer comprehension and key details.
- Keep language level aligned with the script's level.
- No duplicate or overlapping questions.
`;

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
