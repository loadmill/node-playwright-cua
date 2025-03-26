import OpenAI from "openai";
import dotenv from "dotenv";
import { display_width, display_height } from "./browser.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendCUARequest({
  messages = [],
  screenshotBase64,
  previousResponseId,
  callId,
  pendingSafetyChecks = [],
}) {
  const input = [...messages];

  // If responding to a computer_call, attach a screenshot along with any safety checks
  if (callId && screenshotBase64) {
    const outputItem = {
      type: "computer_call_output",
      call_id: callId,
      output: {
        type: "computer_screenshot",
        image_url: `data:image/png;base64,${screenshotBase64}`,
      },
    };
    if (pendingSafetyChecks.length > 0) {
      outputItem.acknowledged_safety_checks = pendingSafetyChecks;
    }
    input.push(outputItem);
  }

  return openai.responses.create({
    model: "computer-use-preview",
    previous_response_id: previousResponseId || undefined,
    tools: [{
      type: "computer_use_preview",
      display_width,
      display_height,
      environment: "browser",
    }],
    input,
    store: true,
    reasoning: { generate_summary: "concise" },
    truncation: "auto",
  });
}
