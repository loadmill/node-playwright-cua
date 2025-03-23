# Computer-Using Agent (CUA) with Node.js, Playwright, and OpenAI

## Goal
Automate web interactions with a browser using Node.js, Playwright, and OpenAI's CUA API. The agent can click, type, scroll, and navigate by analyzing screenshots and receiving AI-generated actions.

https://github.com/user-attachments/assets/7d8b8e19-edf4-4a58-a4ad-00988bb2be07

## How It Works
1. The agent launches a browser using Playwright.  
2. It navigates to a provided URL.  
3. The user enters commands in the terminal.  
4. The user input, along with a screenshot, is sent to the OpenAI computer-use model.  
5. OpenAI manages the conversation context automatically.  
6. If the API returns actions (for example, click or type), the agent performs them.  
7. After each action, the agent takes another screenshot and sends it to OpenAI for further steps.  
8. The loop continues until the user types **exit**.

## Run the Agent
1. Install dependencies:
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
4. Start the agent (use the `--url` option to set a different start page):
   ```sh
   node index.js
   ```

## Code Structure
- **index.js**  
  - Manages user input and the main loop  
  - Sends the user's commands and a screenshot to the API with `previousResponseId` to maintain context on the OpenAI server.  
  - Processes any returned actions until there are none left.  

- **actions.js**  
  - Contains functions to execute actions on the browser page, including clicking, dragging, scrolling, typing, and more  

- **openai.js**  
  - Builds requests to the CUA API with messages, screenshots, and safety checks  

- **browser.js**  
  - Uses Playwright to launch Chromium with a fixed window size and other settings  

## Handling Safety Checks
The CUA API may return `pending_safety_checks` for sensitive or potentially harmful requests. To proceed, you must include them as `acknowledged_safety_checks` in your next request. The current code acknowledges them automatically, but a real production system would likely pause or log them for confirmation.

## Features
- Performs actions in the browser (click, double-click, scroll, drag-and-drop, typing, etc.).  
- Uses OpenAI to plan actions and maintain conversation context on the server side.  
- Sends iterative screenshots for real-time guidance from the model.  
- Acknowledges safety checks automatically for demonstration purposes.  
- Uses `previousResponseId` to keep messages minimal while linking conversation turns.
