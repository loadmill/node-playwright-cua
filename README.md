# Computer-Using Agent (CUA) with Node.js, Playwright, and OpenAI

## Goal
Automate web interactions using Node.js, Playwright, and OpenAI's CUA API. The agent performs tasks like clicking, typing, scrolling, and navigation by analyzing screenshots and receiving AI-generated actions.

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
  Sets up the browser and command line interface. It manages the conversation history and loops through user commands and API responses.

- **actions.js**  
  Contains functions to execute actions (click, double-click, move, drag, scroll, type, keypress, wait, navigation) on the browser page. It also includes a function to take full-page screenshots.

- **openai.js**  
  Sends requests to the OpenAI CUA API with the conversation history and screenshots, and receives the next set of actions.

- **browser.js**  
  Launches the Playwright browser with specified settings, including window size and other options.

## Features
- Executes actions like clicking, double-clicking, moving the mouse, dragging, scrolling, typing, key presses, waiting, and navigation.
- Maintains conversation history to keep context between user commands and API responses.
- Provides a continuous loop for real-time interaction.
- Uses Playwright for browser automation and OpenAI's CUA API for decision making.
