import minimist from "minimist";
import readline from "readline";
import { launchBrowser } from "./browser.js";
import { sendCUARequest } from "./openai.js";
import { handleModelAction, getScreenshot } from "./actions.js";

const args = minimist(process.argv.slice(2));
const startUrl = args.url || "https://loadmill-center-12baa23ad9e4.herokuapp.com/";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function promptUser() {
  return new Promise((resolve) => {
    rl.question("> ", (input) => resolve(input));
  });
}

async function runFullTurn(page, conversationHistory, userInput, previousResponseId) {
  // Add user input
  conversationHistory.push({ role: "user", content: userInput });

  // Send conversation to OpenAI
  let response = await sendCUARequest(null, previousResponseId, null, conversationHistory);
  previousResponseId = response.id;

  // Handle returned actions
  while (true) {
    const actions = (response.output || []).filter((item) => item.type === "computer_call");
    if (actions.length === 0) break;

    for (const computerCall of actions) {
      const { action, call_id, pending_safety_checks } = computerCall;

      await handleModelAction(page, action);

      const screenshotBuffer = await getScreenshot(page);
      const screenshotBase64 = screenshotBuffer.toString("base64");

      // Always acknowledge any safety checks (in production, you'd confirm with user)
      response = await sendCUARequest(
        screenshotBase64,
        previousResponseId,
        call_id,
        conversationHistory,
        pending_safety_checks || []
      );
      previousResponseId = response.id;

      if (response.output_text) {
        console.log(response.output_text);
      }
    }
  }

  // Save final response and print output
  conversationHistory.push({ role: "assistant", content: JSON.stringify(response) });

  return { conversationHistory, previousResponseId };
}

async function main() {
  const { browser, page } = await launchBrowser();
  await page.goto(startUrl);

  let conversationHistory = [];
  let previousResponseId = null;

  while (true) {
    const userInput = await promptUser();
    if (userInput.toLowerCase() === "exit") break;

    const result = await runFullTurn(page, conversationHistory, userInput, previousResponseId);
    conversationHistory = result.conversationHistory;
    previousResponseId = result.previousResponseId;
  }

  await browser.close();
  rl.close();
}

main();
