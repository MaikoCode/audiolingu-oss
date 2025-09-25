import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { Resend } from "resend";
import { EmailTemplate } from "../components/email-template";

export const sendEmail = internalAction({
  args: {
    from: v.string(),
    to: v.string(),
    subject: v.string(),
    firstName: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { from, to, subject, firstName } = args;
    await resend.emails.send({
      from,
      to,
      subject,
      react: EmailTemplate({ firstName }),
    });
  },
});

// Centralized notification action used by workflow and workpool
// Note: sendPodcastNotification is now defined in workflows.ts to keep
// all daily generation-related logic in one place.
