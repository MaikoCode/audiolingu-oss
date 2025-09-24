import { v } from "convex/values";
import { internal, api } from "./_generated/api";
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action, query } from "./_generated/server";

export const workflow = new WorkflowManager(components.workflow);

export const podcastGenerationWorkflow = workflow.define({
  args: {
    userId: v.id("users"),
  },
  handler: async (step, args): Promise<{ episodeId: Id<"episodes"> }> => {
    // 0- Pull learning profile for defaults
    const profile: {
      learningProfile: {
        target_language?: string;
        proficiency_level?: "A1" | "A2" | "B1" | "B2" | "C1";
        episode_duration: number;
      };
      interests: (string | undefined)[];
    } | null = await step.runQuery(internal.users.learningProfile, {
      userId: args.userId,
    });

    if (!profile) throw new Error("Missing learning profile");
    console.log("The profile is: ", profile);
    console.log("The interests are: ", profile.interests);

    // 1- Create an episode draft
    const { episodeId }: { episodeId: Id<"episodes"> } = await step.runMutation(
      internal.episodes.createDraft,
      {
        userId: args.userId,
        language: profile.learningProfile.target_language!,
        proficiency_level: profile.learningProfile.proficiency_level! as
          | "A1"
          | "A2"
          | "B1"
          | "B2"
          | "C1",
        title: "Your personalized episode",
      },
      { name: "create-episode-draft" }
    );

    // 2- Generate the podcast script using the agent
    const script: string = await step.runAction(
      internal.agents.generatePodcastScript,
      {
        userId: args.userId ?? "current_user",
      }
    );
    // 2b - Generate a concise episode title
    const episodeTitle = await step.runAction(
      internal.agents.generateTitleFromScript,
      { script }
    );

    await step.runMutation(
      internal.episodes.setScript,
      {
        episodeId,
        script,
        title: episodeTitle || "Personalized Episode",
        summary: undefined,
      },
      { name: "set-episode-script" }
    );

    // 3- Build an image prompt and generate cover image
    const imagePrompt = await step.runAction(
      internal.agents.buildImagePromptFromScript,
      {
        script,
      },
      { name: "build-image-prompt" }
    );
    const coverKey = await step.runAction(internal.images.generateCoverImage, {
      script: imagePrompt,
    });
    if (coverKey) {
      await step.runMutation(
        internal.episodes.setCoverImage,
        {
          episodeId,
          coverKey,
        },
        { name: "set-episode-cover-image" }
      );
    }

    // 4- Generate audio via ElevenLabs (already stored in R2) and save key
    const preferredVoice = await step.runQuery(
      internal.users.getPreferredVoiceByUserId,
      { userId: args.userId },
      { name: "get-preferred-voice" }
    );
    const audio = await step.runAction(
      internal.elevenlabs.generateAudioWithWordAlignments,
      {
        script,
        voiceId: preferredVoice ?? undefined,
        episodeId,
      },
      { name: "generate-audio" }
    );
    await step.runMutation(
      internal.episodes.setAudio,
      {
        episodeId,
        audioKey: audio.key,
      },
      { name: "set-episode-audio" }
    );

    // 4b - Compute word-level alignments from normalized character timings
    await step.runMutation(
      internal.episodes.computeAndSaveWordAlignments,
      { episodeId },
      { name: "compute-word-alignments" }
    );

    await step.runMutation(
      internal.episodes.computeAndSaveSentenceAlignments,
      { episodeId },
      { name: "compute-sentence-alignments" }
    );

    // 5- Mark as ready
    await step.runMutation(
      internal.episodes.setStatus,
      {
        episodeId,
        status: "ready",
        published: true,
      },
      { name: "set-episode-status" }
    );

    return { episodeId } as const;
  },
});

// Public action: start the podcast generation workflow for current user
export const startMyPodcastGeneration = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Resolve current user from our users table via public query
    const currentUser = await ctx.runQuery(api.users.me, {});
    if (!currentUser) throw new Error("User not found");

    await workflow.start(ctx, internal.workflows.podcastGenerationWorkflow, {
      userId: currentUser._id,
    });

    return { ok: true } as const;
  },
});

// Public query: minimal user greeting info
export const myGreeting = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();
    if (!user) return null;

    return {
      first_name: user.first_name,
      target_language: user.target_language,
    } as const;
  },
});
