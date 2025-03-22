# Computer-Using Agent (CUA) with Node.js, Playwright, and OpenAI

## Goal
Automate web interactions using Node.js, Playwright, and OpenAI's CUA API. The agent performs tasks like clicking, typing, scrolling, and navigation by analyzing screenshots and receiving AI-generated actions.

https://github.com/user-attachments/assets/a0ea77d7-96e8-4bd1-b7ce-01646e4502b6

## How It Works
1. The agent launches a browser using Playwright.
2. It navigates to a given URL (a default is set in the code).
3. The agent waits for user input via the command line.
4. User commands are added to a conversation history.
5. The conversation history is sent to OpenAI using the CUA API.
6. If the API returns actions, the agent executes them (for example, clicking or typing).
7. After each action, it takes a screenshot and sends it back to OpenAI for further instructions.
8. The process repeats until the user types "exit".

## Run the Agent
1. Install the dependencies:
   ```sh
   npm install
   ```
2. Install the Playwright browser:
   ```sh
   npx playwright install chromium
   ```
3. Create a `.env` file with your OpenAI API key:
   ```sh
   echo "OPENAI_API_KEY=your-key" > .env
   ```
4. Start the agent (you can provide a URL using the `--url` option):
   ```sh
   node index.js
   ```

## Code Structure
- **index.js**  
  Handles the main loop, user prompts, and calls `runFullTurn`. It also deals with sending the conversation to the OpenAI CUA API and processing returned actions and safety checks.

- **actions.js**  
  Contains functions to execute actions (click, double-click, move, drag, scroll, type, keypress, wait, navigation) on the browser page.

- **openai.js**  
  Manages the calls to the OpenAI CUA API. Attaches screenshots and acknowledged safety checks.

- **browser.js**  
  Launches the Playwright browser with specified settings, including window size and other options.

## Handling Safety Checks
The OpenAI CUA API may return `pending_safety_checks` when it detects sensitive or potentially malicious instructions. When this happens, we need to acknowledge them in the next call to proceed.

- Each time the agent receives a `computer_call` with `pending_safety_checks`, these items must be included in the next request under `acknowledged_safety_checks`.
- Our code always responds positively to these checks, but in a real-world setting, you may prompt the user for confirmation or log them for review.

## Features
- Executes actions like clicking, double-clicking, dragging, scrolling, typing, key presses, waiting, and navigation.
- Maintains conversation history for context between user commands and API responses.
- Uses screenshots and the OpenAI CUA API for an iterative, real-time interaction loop.
- Automatically acknowledges safety checks for demonstration purposes (in practice, you can confirm them with the user).
