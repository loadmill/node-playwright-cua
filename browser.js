import { chromium } from "playwright";

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: false,
    chromiumSandbox: true,
    env: {},
    args: ["--disable-extensions", "--disable-file-system"],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1024, height: 768 });

  return { browser, page };
}
