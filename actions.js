export async function handleModelAction(page, action) {
  try {
    switch (action.type) {
      case "click":
        console.log(`Clicking at (${action.x}, ${action.y})`);
        await page.mouse.click(action.x, action.y);
        break;
      case "scroll":
        console.log(`Scrolling by (${action.scrollX}, ${action.scrollY})`);
        await page.mouse.wheel(action.scrollX, action.scrollY);
        break;
      case "type":
        console.log(`Typing text: ${action.text}`);
        await page.keyboard.type(action.text);
        break;
      case "keypress":
        console.log(`Pressing key: ${action.keys}`);
        for (const key of action.keys) {
          // Convert "ENTER" (or any case variant) to the expected "Enter"
          const normalizedKey = key.toUpperCase() === "ENTER" ? "Enter" : key;
          await page.keyboard.press(normalizedKey);
        }
        break;
      case "wait":
        console.log("Waiting...");
        await page.waitForTimeout(2000);
        break;
      case "screenshot":
        console.log("Screenshot action received - no execution needed.");
        break;
      default:
        console.log("Unknown action:", action);
    }
  } catch (error) {
    console.error("Error executing action:", action, error);
  }
}

export async function getScreenshot(page) {
  return await page.screenshot({ fullPage: true });
}
