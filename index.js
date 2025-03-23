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
  return new Promise((resolve) => rl.question("> ", resolve));
}

async function runFullTurn(page, response) {
  
  let newResponseId = response.id;

  // The model can return multiple computer calls in one response
  while (true) {
    const items = response.output || [];
    const actions = items.filter((item) => item.type === "computer_call");

    // Print reasoning or assistant messages
    for (const item of items) {      
      if (item.type === "reasoning" && Array.isArray(item.summary)) {
        item.summary.forEach((entry) => {
          if (entry.type === "summary_text") {
            console.log("[Reasoning]", entry.text);
          }
        });
      } else if (item.type === "message" && Array.isArray(item.content)) {
        const textPart = item.content.find((c) => c.type === "output_text");
        if (textPart) {
          console.log("[Message]", textPart.text);
        }
      }
    }

    // If there are no more actions, we're done for this turn
    if (actions.length === 0) break;

    // Process each model action, then respond with a new screenshot
    for (const { action, call_id, pending_safety_checks } of actions) {
      await handleModelAction(page, action);
      const newScreenshot = await getScreenshotAsBase64(page);

      response = await sendCUARequest({
        messages: [],
        screenshotBase64: newScreenshot,
        previousResponseId: newResponseId,
        callId: call_id,
        pendingSafetyChecks: pending_safety_checks || [],
      });
      newResponseId = response.id;
    }
  }

  return newResponseId;
}

async function main() {
  const { browser, page } = await launchBrowser();
  await page.goto(startUrl);

  const initialSystemText = 
  `This is a browser-using agent operating in a controlled environment.  
  Perform the user’s requested actions within the current browser tab opened on the target platform.  
  Execute each action once unless instructed otherwise.
  Stop acting once the task appears complete—avoid unnecessary clicks.  
  Never ask for confirmation. If an action needs to be performed, execute it immediately. 
  Only stop for questions if you don't have enough information to complete the action.
  If unsure, take a screenshot once before proceeding.  
  Do not repeat actions that have no visible effect.  

  Available browser actions: 
  click, double_click, move, drag, scroll, type, keypress, wait, goto, back, forward, screenshot.
  If the user asks you to go back to the previous page, use a combination of ALT and ARROWLEFT keys.
  `;

  let previousResponseId;
  let messages = [{ role: "system", content: initialSystemText }];

  while (true) {
    const userInput = await promptUser();
    if (userInput.toLowerCase() === "exit") break;

    messages.push({ role: "user", content: userInput });

    const screenshotBase64 = await getScreenshotAsBase64(page);

    let response = await sendCUARequest({
      messages,
      screenshotBase64,
      previousResponseId
    });

    previousResponseId = await runFullTurn(page, response);
    messages = [];
  }

  await browser.close();
  rl.close();
}

main();
