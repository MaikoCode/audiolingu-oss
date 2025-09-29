import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import Scorecard, { runAndEvaluate } from "scorecard-ai";
import { pathToFileURL } from "url";
import OpenAI from "openai";
import { PODCAST_WRITER_INSTRUCTIONS } from "../prompts/index.js";

// Load environment from the project root .env.local when running from /evals
const envPathFromRoot = path.resolve(process.cwd(), "..", ".env.local");
if (fs.existsSync(envPathFromRoot)) {
  // Explicitly load .env.local if present
  const dotenvModule = await import("dotenv");
  dotenvModule.config({ path: envPathFromRoot });
}

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value || typeof value !== "string") {
    throw new Error(`${name} must be a non-empty string`);
  }
  return value;
};

const SCORECARD_API_KEY = getRequiredEnv("SCORECARD_API_KEY");
const PROJECT_ID = getRequiredEnv("SCORECARD_PROJECT_ID");

const scorecardClient = new Scorecard({
  apiKey: SCORECARD_API_KEY,
});
if (!PROJECT_ID || typeof PROJECT_ID !== "string") {
  throw new Error(
    `SCORECARD_PROJECT_ID must be a non-empty string. Got: ${String(
      PROJECT_ID
    )} (type: ${typeof PROJECT_ID})`
  );
}
console.log(
  "Using SCORECARD_PROJECT_ID:",
  PROJECT_ID,
  `(type: ${typeof PROJECT_ID})`
);

async function runPodcastSystem(systemInput) {
  const userProfile = {
    interests: systemInput.interests,
    level: systemInput.level,
    duration: systemInput.duration,
    language: systemInput.language,
    userId: systemInput.userId || "test-user", // Mock for testing
  };

  try {
    const episode = await generatePodcastEpisode(userProfile);

    return {
      episode_script: episode,
      user_profile: userProfile,
    };
  } catch (error) {
    console.error("Episode generation failed:", error);
    return {
      episode_script: "Error generating episode",
      user_profile: userProfile,
      error: error.message,
    };
  }
}

async function generatePodcastEpisode(userProfile) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_KEY_FOR_SCORECARD });
  const response = await client.responses.create({
    model: "gpt-5",
    instructions: PODCAST_WRITER_INSTRUCTIONS,
    input: `Generate a podcast episode script for the user profile: ${JSON.stringify(userProfile)}`,
  });

  return response.output_text;
}

// Test cases - 20 diverse scenarios
const testCases = [
  // A1 Level Tests
  {
    inputs: {
      interests: ["cooking"],
      level: "A1",
      duration: 5,
      language: "English",
      userId: "user1",
    },
  },
  {
    inputs: {
      interests: ["animals", "pets"],
      level: "A1",
      duration: 8,
      language: "Spanish",
      userId: "user2",
    },
  },
  {
    inputs: {
      interests: ["sports"],
      level: "A1",
      duration: 10,
      language: "French",
      userId: "user3",
    },
  },
  {
    inputs: {
      interests: ["music"],
      level: "A1",
      duration: 7,
      language: "German",
      userId: "user4",
    },
  },

  // A2 Level Tests
  {
    inputs: {
      interests: ["travel", "photography"],
      level: "A2",
      duration: 12,
      language: "English",
      userId: "user5",
    },
  },
  {
    inputs: {
      interests: ["movies", "cinema"],
      level: "A2",
      duration: 15,
      language: "Italian",
      userId: "user6",
    },
  },
  {
    inputs: {
      interests: ["gardening"],
      level: "A2",
      duration: 10,
      language: "Portuguese",
      userId: "user7",
    },
  },

  // B1 Level Tests
  {
    inputs: {
      interests: ["technology", "smartphones"],
      level: "B1",
      duration: 15,
      language: "English",
      userId: "user8",
    },
  },
  {
    inputs: {
      interests: ["books", "reading"],
      level: "B1",
      duration: 18,
      language: "Spanish",
      userId: "user9",
    },
  },
  {
    inputs: {
      interests: ["fitness", "health"],
      level: "B1",
      duration: 20,
      language: "French",
      userId: "user10",
    },
  },
  {
    inputs: {
      interests: ["art", "painting"],
      level: "B1",
      duration: 16,
      language: "German",
      userId: "user11",
    },
  },

  // B2 Level Tests
  {
    inputs: {
      interests: ["business", "entrepreneurship"],
      level: "B2",
      duration: 25,
      language: "English",
      userId: "user12",
    },
  },
  {
    inputs: {
      interests: ["science", "biology"],
      level: "B2",
      duration: 22,
      language: "Spanish",
      userId: "user13",
    },
  },
  {
    inputs: {
      interests: ["psychology", "mental health"],
      level: "B2",
      duration: 20,
      language: "Italian",
      userId: "user14",
    },
  },
  {
    inputs: {
      interests: ["history", "ancient civilizations"],
      level: "B2",
      duration: 28,
      language: "French",
      userId: "user15",
    },
  },

  // C1 Level Tests
  {
    inputs: {
      interests: ["philosophy", "ethics"],
      level: "C1",
      duration: 30,
      language: "English",
      userId: "user16",
    },
  },
  {
    inputs: {
      interests: ["economics", "global markets"],
      level: "C1",
      duration: 35,
      language: "German",
      userId: "user17",
    },
  },
  {
    inputs: {
      interests: ["literature", "poetry"],
      level: "C1",
      duration: 25,
      language: "Spanish",
      userId: "user18",
    },
  },

  // C2 Level Tests
  {
    inputs: {
      interests: ["neuroscience", "consciousness"],
      level: "C2",
      duration: 40,
      language: "English",
      userId: "user19",
    },
  },
  {
    inputs: {
      interests: ["political science", "governance"],
      level: "C2",
      duration: 45,
      language: "French",
      userId: "user20",
    },
  },
];

// LLM-as-Judge Metrics
const metrics = [
  {
    name: "creativity_score",
    evalType: "ai",
    outputType: "integer",
    promptTemplate: `Rate 1-5: How creative and unexpected are the topic connections while staying relevant to user interests?
  
  User interests: {{inputs.interests}}
  Language level: {{inputs.level}}
  
  Episode to evaluate:
  {{outputs.episode_script}}
  
  Evaluation criteria:
  - 1: Too literal; just talks about the interest directly
  - 2: Slightly creative but mostly predictable
  - 3: Some creative angles with reasonable connections
  - 4: Creative, unexpected connections that feel natural
  - 5: Brilliant, surprising connections that make perfect sense
  
  Consider: Does this go beyond obvious topics related to the interests? Are the connections thoughtful and engaging?
  
  Provide only a number from 1-5.`,
    evalModelName: "gpt-5-2025-08-07",
    temperature: 0,
    passingThreshold: 4,
  },

  {
    name: "engagement_score",
    evalType: "ai",
    outputType: "integer",
    promptTemplate: `Rate 1-5: How engaging is the opening? Does it hook the listener in the first 30 seconds?
  
  Episode opening to evaluate:
  {{outputs.episode_script}}
  
  Focus on the first 2-3 sentences. Evaluation criteria:
  - 1: Boring, generic opening with no hook
  - 2: Weak hook; mildly interesting
  - 3: Decent opening but not compelling
  - 4: Strong hook that creates curiosity or a good question
  - 5: Irresistible opening that demands attention
  
  Consider: Does it start with something surprising, intriguing, or immediately relevant? Would you keep listening?
  
  Provide only a number from 1-5.`,
    evalModelName: "gpt-5-2025-08-07",
    temperature: 0,
    passingThreshold: 4,
  },

  {
    name: "language_level_score",
    evalType: "ai",
    outputType: "integer",
    promptTemplate: `Rate 1-5: How well does this script match {{inputs.level}} language complexity?
  
  Target level: {{inputs.level}}
  Episode to evaluate:
  {{outputs.episode_script}}
  
  Level requirements:
  - A1: 5-8 word sentences, present tense, concrete nouns, basic connectors
  - A2: 8-12 word sentences, past/future tenses, simple descriptions
  - B1: 12-15 word sentences, some subordinate clauses, abstract concepts with examples
  - B2: Complex sentences OK, conditional tenses, cultural references with context
  - C1/C2: Full linguistic range, idiomatic expressions, nuanced meanings
  
  Scoring:
  - 1: Completely wrong level (too simple/complex)
  - 2: Mostly wrong with significant issues
  - 3: Mostly appropriate with some issues
  - 4: Well-matched to level requirements
  - 5: Perfect level targeting
  
  Provide only a number from 1-5.`,
    evalModelName: "gpt-5-2025-08-07",
    temperature: 0,
    passingThreshold: 4,
  },

  {
    name: "tts_readiness_score",
    evalType: "ai",
    outputType: "integer",
    promptTemplate: `Rate 1-5: How well optimized is this script for text-to-speech synthesis?
  
  Episode to evaluate:
  {{outputs.episode_script}}
  
  Check for TTS issues:
  - Numbers written as digits (should be words like "twenty twenty-five")
  - Complex punctuation that confuses TTS (excessive commas, semicolons)
  - Difficult pronunciations without phonetic guides
  - Awkward sentence structures for speech
  - Missing natural pauses where needed
  - Abbreviations that won't read well aloud
  - Very long sentences that are hard to speak
  
  Scoring:
  - 1: Many TTS issues present; would sound unnatural
  - 2: Several issues; somewhat unnatural
  - 3: Some issues but mostly readable by TTS
  - 4: Well optimized with minor issues
  - 5: Perfect TTS optimization; would sound natural
  
  Provide only a number from 1-5.`,
    evalModelName: "gpt-5-2025-08-07",
    temperature: 0,
    passingThreshold: 4,
  },

  {
    name: "interest_integration_score",
    evalType: "ai",
    outputType: "integer",
    promptTemplate: `Rate 1-5: How well are the user's interests integrated without being the sole focus?
  
  User interests: {{inputs.interests}}
  Episode to evaluate:
  {{outputs.episode_script}}
  
  Good integration means:
  - Interests are used as a lens or connection point
  - Episode explores broader themes that relate to interests
  - Not just talking directly about the interest topic
  - Creates meaningful connections between interests and larger ideas
  
  Scoring:
  - 1: Ignores interests completely or only talks directly about interests
  - 2: Weak connection; too literal or too distant
  - 3: Some connection but inconsistent
  - 4: Good balance; interests as springboard for broader topics
  - 5: Perfect integration; interests woven naturally into larger themes
  
  Provide only a number from 1-5.`,
    evalModelName: "gpt-5-2025-08-07",
    temperature: 0,
    passingThreshold: 4,
  },
];

const toMetricCreateParams = (m) => {
  const isAI = m.evalType === "ai";
  const isInt = m.outputType === "integer" || m.outputType === "int";
  if (!isAI) {
    throw new Error(
      `Only ai evalType is supported in this script (got: ${m.evalType})`
    );
  }
  if (!(isInt || m.outputType === "boolean")) {
    throw new Error(
      `Unsupported outputType: ${m.outputType} (supported: integer|boolean)`
    );
  }

  const base = {
    evalType: "ai",
    name: m.name,
    promptTemplate: m.promptTemplate,
    description: m.description ?? null,
    guidelines: m.guidelines ?? null,
    evalModelName: m.evalModelName,
    temperature: typeof m.temperature === "number" ? m.temperature : 0,
  };

  if (isInt) {
    return {
      ...base,
      outputType: "int",
      passingThreshold:
        typeof m.passingThreshold === "number"
          ? Math.max(1, Math.min(5, Math.round(m.passingThreshold)))
          : 4,
    };
  }

  return {
    ...base,
    outputType: "boolean",
  };
};

async function createProjectMetrics() {
  const createdIds = [];
  for (const m of metrics) {
    const body = toMetricCreateParams(m);
    const metric = await scorecardClient.metrics.create(PROJECT_ID, body);
    createdIds.push(metric.id);
  }
  return createdIds;
}

// Main evaluation function
async function runPodcastEvaluation() {
  console.log("Starting podcast evaluation with Scorecard...");
  console.log(
    `Testing ${testCases.length} scenarios across ${metrics.length} metrics`
  );

  try {
    const metricIds = await createProjectMetrics();

    const run = await runAndEvaluate(
      scorecardClient,
      {
        projectId: PROJECT_ID,
        testcases: testCases.map((tc) => ({
          ...tc,
          expected: tc.expected ?? {},
        })),
        metricIds,
        system: runPodcastSystem,
      },
      { runInParallel: true }
    );

    console.log("✅ Evaluation run created!");
    console.log(`\n🌐 View detailed results at: ${run.url}`);

    return { url: run.url, runId: run.id };
  } catch (error) {
    console.error("❌ Evaluation failed:", error);
    throw error;
  }
}

// Run the evaluation
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPodcastEvaluation()
    .then(() => {
      console.log(
        "\n✨ Evaluation complete! Check the Scorecard dashboard for detailed analysis."
      );
      process.exit(0);
    })
    .catch((error) => {
      console.error("Evaluation failed:", error);
      process.exit(1);
    });
}

export { runPodcastEvaluation, testCases, metrics, runPodcastSystem };
