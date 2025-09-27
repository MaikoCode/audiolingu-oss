import "dotenv/config";
import path from "node:path";
import fs from "node:fs";
import Scorecard from "scorecard-ai";
import OpenAI from "openai";
import { runAndEvaluate } from "scorecard-ai";

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

const scorecard = new Scorecard({
  apiKey: SCORECARD_API_KEY,
  projectId: PROJECT_ID,
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
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY_FOR_SCORECARD,
});

async function runSystem(systemInput) {
  const recipient = systemInput.recipient ?? "";
  const response = await openai.responses.create({
    model: "gpt-5",
    instructions:
      `You are a tone translator. Convert the user's message to the tone: ${systemInput.tone}. ` +
      (systemInput.recipient
        ? `Address the recipient: ${systemInput.recipient}`
        : ""),
    input: systemInput.original,
  });
  return {
    rewritten: response.output_text,
  };
}

const testcases = [
  {
    // `inputs` gets passed to the system as an object.
    inputs: {
      original: "We need your feedback on the new designs ASAP.",
      tone: "polite",
    },
    // `expected` is the ideal output of the system used by the LLM-as-a-judge to evaluate the system.
    expected: {
      idealRewritten:
        "Hi! your feedback is crucial to the success of the new designs. Please share your thoughts as soon as possible.",
    },
  },
  {
    inputs: {
      original:
        "I'll be late to the office because my cat is sleeping on my keyboard.",
      tone: "funny",
    },
    expected: {
      idealRewritten:
        "Hey team! My cat's napping on my keyboard and I'm just waiting for her to give me permission to leave. I'll be a bit late!",
    },
  },
];

const toneAccuracyMetric = await scorecard.metrics.create(PROJECT_ID, {
  name: "Tone accuracy",
  evalType: "ai",
  outputType: "int",
  promptTemplate:
    "You are a tone evaluator. Grade the response on how well it matches the intended tone {{inputs.tone}} and the tone of the ideal response. Use a score of 1 if the tones are very different and 5 if they are the exact same.\n\nResponse: {{outputs.rewritten}}\n\nIdeal response: {{expected.idealRewritten}}\n\n{{ gradingInstructionsAndExamples }}",
});

const recipientAddressMetric = await scorecard.metrics.create(PROJECT_ID, {
  name: "Recipient address",
  evalType: "ai",
  outputType: "boolean",
  promptTemplate:
    "Does the response refer to the correct recipient: {{inputs.recipient}}? Response: {{outputs.rewritten}}\n\n{{ gradingInstructionsAndExamples }}",
});

const run = await runAndEvaluate(scorecard, {
  projectId: PROJECT_ID,
  testcases: testcases,
  metricIds: [toneAccuracyMetric.id, recipientAddressMetric.id],
  system: runSystem,
});
console.log(`Go to ${run.url} to view your scored results.`);
