// openai.js
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendCUARequest(
  screenshotBase64,
  previousResponseId,
  callId,
  conversationHistory,
  acknowledgedSafetyChecks = []
) {
  // Clone the conversation history
  let input = conversationHistory.slice();

  if (callId && screenshotBase64) {
    const outputItem = {
      type: "computer_call_output",
      call_id: callId,
      output: {
        type: "computer_screenshot",
        image_url: `data:image/png;base64,${screenshotBase64}`,
      },
    };

    // If we have safety checks that need acknowledgement, attach them here
    if (acknowledgedSafetyChecks.length > 0) {
      outputItem.acknowledged_safety_checks = acknowledgedSafetyChecks;
    }

    input.push(outputItem);
  }

  const response = await openai.responses.create({
    model: "computer-use-preview",
    previous_response_id: previousResponseId || undefined,
    tools: [
      {
        type: "computer_use_preview",
        display_width: 1024,
        display_height: 768,
        environment: "browser",
      },
    ],
    input: input,
    reasoning: {
      generate_summary: "concise",
    },
    truncation: "auto",
  });

  return response;
}
