import minimist from "minimist";
import { launchBrowser } from "./browser.js";
import { sendCUARequest } from "./openai.js";
import { handleModelAction, getScreenshot } from "./actions.js";
import readline from "readline";

// Parse command line arguments
const args = minimist(process.argv.slice(2));
const startUrl = args.url || "https://loadmill-center-12baa23ad9e4.herokuapp.com/";

// Set up readline for user input.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  return new Promise((resolve) => {
    rl.question("> ", (input) => {
      resolve(input);
    });
  });
}

async function main() {
  const { browser, page } = await launchBrowser();
  await page.goto(startUrl);

  let conversationHistory = [];
  let previousResponseId = null;
  let response;

  while (true) {
    // Get a command from the user.
    const userInput = await promptUser();
    if (userInput.toLowerCase() === "exit") break;

    // Add the user message to the conversation history.
    conversationHistory.push({
      role: "user",
      content: userInput,
    });

    // Make the first API call using the conversation history.
    response = await sendCUARequest(null, previousResponseId, null, conversationHistory);
    previousResponseId = response.id;

    // Process all actions returned by the API.
    while (true) {
      const actions = response.output.filter((item) => item.type === "computer_call");

      // If there are no more actions, assume the task is complete.
      if (actions.length === 0) {
        // Optionally, store the assistant's final message.
        conversationHistory.push({
          role: "assistant",
          content: JSON.stringify(response),
        });
        break;
      }

      for (const computerCall of actions) {
        const action = computerCall.action;
        const callId = computerCall.call_id;

        // Execute the action using Playwright.
        await handleModelAction(page, action);

        // Capture the updated page state.
        const screenshotBuffer = await getScreenshot(page);
        const screenshotBase64 = screenshotBuffer.toString("base64");

        // Send the screenshot along with the call ID.
        response = await sendCUARequest(screenshotBase64, previousResponseId, callId, conversationHistory);
        previousResponseId = response.id;
      }

      // Wait a bit before checking for new actions.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  await browser.close();
  rl.close();
}

main();
