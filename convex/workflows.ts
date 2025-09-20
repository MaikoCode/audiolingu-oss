import { v } from "convex/values";
import { internal } from "./_generated/api";
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";

export const workflow = new WorkflowManager(components.workflow);

export const podcastGenerationWorkflow = workflow.define({
  args: {
    userId: v.id("users"),
  },
  handler: async (step, args) => {
    // 1- Generate the podcast script
    const script = await step.runAction(internal.agents.podcast_writer, {
      userId: args.userId,
    });
    // 2- Generate the podcast cover image
    // 3- Generate the podcast audio
  },
});
