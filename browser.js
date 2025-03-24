import { chromium } from "playwright";

export const display_width = 800;
export const display_height = 600;

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: false,
    chromiumSandbox: true,
    env: { DISPLAY: ":0" },
    args: [`--window-size=${display_width},${display_height}`, "--disable-extensions", "--disable-file-system"],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: display_width, height: display_height });

  return { browser, page };
}
