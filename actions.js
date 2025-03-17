export async function handleModelAction(page, action) {
  try {
    switch (action.type) {
      case "click":
        console.log(`Clicking at (${action.x}, ${action.y})`);
        await page.mouse.click(action.x, action.y);
        break;
      case "double_click":
        console.log(`Double clicking at (${action.x}, ${action.y})`);
        await page.mouse.dblclick(action.x, action.y);
        break;
      case "move":
        console.log(`Moving mouse to (${action.x}, ${action.y})`);
        await page.mouse.move(action.x, action.y);
        break;
      case "drag":
        console.log("Dragging along path", action.path);
        if (Array.isArray(action.path) && action.path.length > 0) {
          const [firstPoint, ...restPoints] = action.path;
          await page.mouse.move(firstPoint.x, firstPoint.y);
          await page.mouse.down();
          for (const point of restPoints) {
            await page.mouse.move(point.x, point.y);
          }
          await page.mouse.up();
        } else {
          console.log("Drag action missing a valid path");
        }
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
        console.log("Waiting for browser...");
        await page.waitForTimeout(2000);
        break;
      case "goto":
        console.log(`Navigating to ${action.url}`);
        await page.goto(action.url);
        break;
      case "back":
        console.log("Navigating back");
        await page.goBack();
        break;
      case "forward":
        console.log("Navigating forward");
        await page.goForward();
        break;
      case "screenshot":
        console.log("Taking a screenshot");
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
