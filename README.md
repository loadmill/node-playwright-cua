# Computer-Using Agent (CUA) with Node.js, Playwright, and OpenAI

## Goal

Automate web interactions with a browser using Node.js, Playwright, and OpenAI's CUA API. This agent can click, type, scroll, and navigate by analyzing screenshots and receiving AI-generated actions.

https://github.com/user-attachments/assets/a0ea77d7-96e8-4bd1-b7ce-01646e4502b6

## How It Works
1. The agent launches a browser using Playwright.
2. It navigates to a provided URL.
3. The user types commands in the terminal.
4. The user input, along with a screenshot, is sent to OpenAI computer-use model.
5. The conversation context is managed by OpenAI automatically.
6. If the API returns actions (for example, click or type), the agent performs them.
7. After each action, the agent takes another screenshot and sends it back to the API for additional steps.
8. The loop continues until the user types **exit**.

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
4. Start the agent (use `--url` to override the default):
   ```sh
   node index.js
   ```

## Code Structure
- **index.js**  
  - Handles user input in a loop.  
  - Sends the user's request and a screenshot to the API with `previousResponseId` to maintain context on the server.  
  - Processes any returned actions until there are none left.  

- **actions.js**  
  - Contains functions to execute actions (click, double-click, move, drag, scroll, type, keypress, wait, navigation) on the browser page.

- **openai.js**  
  - Builds the request to the CUA API with messages, screenshots, and safety checks.

- **browser.js**  
  - Using Playwright to launch a Chromium browser with specified settings, including window size and other options.

## Handling Safety Checks
The CUA API sometimes returns `pending_safety_checks` for instructions that might be sensitive or potentially harmful. When this occurs, you must include them in the next request under `acknowledged_safety_checks` to proceed. The current code automatically acknowledges these checks, but a real production system might pause or log them for review.

## Features
- Performs clicks, double-clicks, typing, scrolling, drag-and-drop, and other browser actions.
- Uses OpenAI to plan actions and maintain conversation context on the server.
- Sends screenshots for iterative, real-time feedback from the model.
- Acknowledges safety checks in each step (user override is possible in real usage).
- Only minimal conversation data is sent per turn, with `previousResponseId` linking requests.
