import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const siteUrl = process.env.SITE_URL!;

// Upstash Redis-backed rate limiter (shared across instances)
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  prefix: "magic_link",
});

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    // disable logging when createAuth is called just to generate options.
    // this is not required, but there's a lot of noise in logs without it.
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),

    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    // Configure simple, non-verified email/password to get started
    // emailAndPassword: {
    //   enabled: true,
    //   requireEmailVerification: false,
    // },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex(),
      magicLink({
        sendMagicLink: async ({ email, url }, request) => {
          // send email to user
          // Server-side rate limiting by email and IP
          const ipHeader = request?.headers.get("x-forwarded-for") || "";
          const ip = ipHeader.split(",")[0]?.trim() || "unknown";
          const emailKey = `email:${email.toLowerCase()}`;
          const ipKey = `ip:${ip}`;
          const [emailLimit, ipLimit] = await Promise.all([
            ratelimit.limit(emailKey),
            ratelimit.limit(ipKey),
          ]);
          if (!emailLimit.success || !ipLimit.success) {
            throw new Error("Too many requests. Please try again later.");
          }

          const resend = new Resend(process.env.RESEND_API_KEY);
          const from = process.env.RESEND_FROM!;
          const to = email;
          const subject = "Login to your Audiolingu account";
          await resend.emails.send({
            from,
            to,
            subject,
            html: `Click the link to login into your Audiolingu account: ${url}`,
          });
        },
      }),
    ],
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
