import { chromium } from "playwright";

export async function launchBrowser() {
  const width = 1024;
  const height = 768;

  const browser = await chromium.launch({
    headless: false,
    chromiumSandbox: true,
    env: { DISPLAY: ":0" },
    args: [`--window-size=${width},${height}`, "--disable-extensions", "--disable-file-system"],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width, height });

  return { browser, page };
}
