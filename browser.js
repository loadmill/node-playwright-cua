import { chromium } from "playwright";

export const browserWidth = 1024;
export const browserheight = 768;

export async function launchBrowser() {

  const browser = await chromium.launch({
    headless: false,
    chromiumSandbox: true,
    env: { DISPLAY: ":0" },
    args: [`--window-size=${browserWidth},${browserheight}`, "--disable-extensions", "--disable-file-system"],
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: browserWidth, height: browserheight });

  return { browser, page };
}
