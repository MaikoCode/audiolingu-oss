import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user record (Auth identity + basic profile)
  users: defineTable({
    email: v.string(),
    first_name: v.string(),
    last_name: v.string(),
    image_url: v.optional(v.string()),
    tokenIdentifier: v.string(),
    onboarding_completed: v.boolean(),
    // Optional quick-access fields for active learning settings
    target_language: v.optional(v.string()), // ISO 639-1, e.g. "es", "fr"
    proficiency_level: v.optional(
      v.union(
        v.literal("A1"),
        v.literal("A2"),
        v.literal("B1"),
        v.literal("B2"),
        v.literal("C1")
      )
    ),
    preferred_voice: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"]) // required for auth lookups
    .index("by_email", ["email"]),

  // Learning profiles allow users to keep multiple configurations over time
  learning_profiles: defineTable({
    userId: v.id("users"),
    active: v.boolean(),
    target_language: v.string(), // ISO 639-1
    proficiency_level: v.union(
      v.literal("A1"),
      v.literal("A2"),
      v.literal("B1"),
      v.literal("B2"),
      v.literal("C1")
    ),
    episode_duration: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_active", ["userId", "active"])
    .index("by_user", ["userId"]),

  // Curated topics catalog
  topics: defineTable({
    slug: v.string(), // unique key like "technology", "sports"
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()), // optional grouping
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"]) // enforce uniqueness at application level
    .index("by_active", ["isActive"]),

  // Many-to-many join for user interests
  user_interests: defineTable({
    userId: v.id("users"),
    topicId: v.id("topics"),
    weight: v.optional(v.number()), // preference weight (default 1)
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_topic", ["topicId"])
    .index("by_user_topic", ["userId", "topicId"]),

  // Personalized episodes generated for a user
  episodes: defineTable({
    userId: v.id("users"),
    learningProfileId: v.optional(v.id("learning_profiles")),
    language: v.string(), // ISO 639-1
    proficiency_level: v.union(
      v.literal("A1"),
      v.literal("A2"),
      v.literal("B1"),
      v.literal("B2"),
      v.literal("C1")
    ),
    title: v.string(),
    cover_image_id: v.optional(v.string()),
    summary: v.optional(v.string()),
    topics: v.optional(v.array(v.id("topics"))),
    transcript: v.optional(v.string()),
    aligned_transcript: v.optional(v.string()),
    word_alignments: v.optional(
      v.array(
        v.object({
          word: v.string(),
          start: v.number(),
          end: v.number(),
        })
      )
    ),
    sentence_alignments: v.optional(
      v.array(
        v.object({
          text: v.string(),
          start: v.number(),
          end: v.number(),
        })
      )
    ),
    audioStorageId: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("queued"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("failed")
    ),
    feedback: v.optional(v.union(v.literal("good"), v.literal("bad"))),
    feedbackComment: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"]),
});
