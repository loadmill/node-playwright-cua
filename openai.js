import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendCUARequest(screenshotBase64, previousResponseId, callId, conversationHistory) {
  // Use the conversation history as the input.
  let input = conversationHistory.slice();

  if (callId && screenshotBase64) {
    input.push({
      type: "computer_call_output",
      call_id: callId,
      output: {
        type: "computer_screenshot",
        image_url: `data:image/png;base64,${screenshotBase64}`,
      },
    });
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

