import { v } from "convex/values";
import { internal } from "./_generated/api";
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
        userId: args.userId as Id<"users"> as unknown as string,
      }
    );
    await step.runMutation(
      internal.episodes.setScript,
      {
        episodeId,
        script,
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
    const imageUrl = await step.runAction(internal.images.generateCoverImage, {
      script: imagePrompt,
    });
    if (imageUrl) {
      const stored = await step.runAction(internal.r2.storeImageFromUrl, {
        imageUrl,
      });
      await step.runMutation(
        internal.episodes.setCoverImage,
        {
          episodeId,
          coverKey: stored.key,
        },
        { name: "set-episode-cover-image" }
      );
    }

    // 4- Generate audio via ElevenLabs and store in R2
    const audio = await step.runAction(
      internal.elevenlabs.generateAudio,
      {
        script,
      },
      { name: "generate-audio" }
    );
    const storedAudio = await step.runAction(
      internal.r2.storeAudioFromBytes,
      {
        bytes: audio.bytes,
        contentType: audio.contentType,
      },
      { name: "store-audio" }
    );
    await step.runMutation(
      internal.episodes.setAudio,
      {
        episodeId,
        audioKey: storedAudio.key,
      },
      { name: "set-episode-audio" }
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
