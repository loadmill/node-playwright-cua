// index.js
import minimist from "minimist";
import readline from "readline";
import { launchBrowser } from "./browser.js";
import { sendCUARequest } from "./openai.js";
import { handleModelAction, getScreenshotAsBase64 } from "./actions.js";

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

  conversationHistory.push({ role: "user", content: userInput });
  const initialScreenshot = await getScreenshotAsBase64(page);
  let response = await sendCUARequest(initialScreenshot, previousResponseId, null, conversationHistory);
  previousResponseId = response.id;

  // Keep looping on output
  while (true) {
    const items = response.output || [];
    let actions = [];

    for (const item of items) {
      switch (item.type) {
        case "reasoning":
          // We assume item.summary is always an array
          item.summary.forEach((entry) => {
            if (entry.type === "summary_text") {
              console.log("[Reasoning]", entry.text);
            }
          });
          break;

        case "message":
          // A "message" often contains "output_text" in content[]
          if (Array.isArray(item.content)) {
            const textPart = item.content.find((c) => c.type === "output_text");
            if (textPart) {
              console.log("[Message]", textPart.text);
            }
          }
          break;

        case "computer_call":
          // We'll handle these actions last
          actions.push(item);
          break;

        default:
          console.log("[Unknown output item type]", item.type);
          break;
      }
    }

    if (actions.length === 0) break;

    // Execute each computer action in sequence
    for (const { action, call_id, pending_safety_checks } of actions) {
      await handleModelAction(page, action);

      const screenshotBase64 = await getScreenshotAsBase64(page);

      // Acknowledge safety checks, if any
      response = await sendCUARequest(
        screenshotBase64,
        previousResponseId,
        call_id,
        conversationHistory,
        pending_safety_checks || []
      );
      previousResponseId = response.id;
    }
  }

  // Save final response
  conversationHistory.push({ role: "assistant", content: JSON.stringify(response) });

  return { conversationHistory, previousResponseId };
}

async function main() {
  const { browser, page } = await launchBrowser();
  await page.goto(startUrl);

  let conversationHistory = [{
    "role": "system",
    "content": 
      `This is a browser-using agent running in a safe environment. 
      You should perform all actions requested by the user.
      The user requests apply to the current open browser tab.
      Try not to ask question to the user, instead, perform the action directly.
      Ask questions only if it is necessary to complete the task or if the last task was completed.
      The available browser actions are: 
      click, double_click, move, drag, scroll, type, keypress, wait, goto, back, forward, and screenshot.
      When navigating back or forward, always use the 'back' and 'forward' actions instead of simulating key presses like ALT + ARROWLEFT.`
  }];
  
  let previousResponseId = null;

  while (true) {
    const userInput = await promptUser();
    if (userInput.toLowerCase() === "exit") break;

    const result = await runFullTurn(
      page,
      conversationHistory,
      userInput,
      previousResponseId
    );
    conversationHistory = result.conversationHistory;
    previousResponseId = result.previousResponseId;
  }

  await browser.close();
  rl.close();
}

main();
