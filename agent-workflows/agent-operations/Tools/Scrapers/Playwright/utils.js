/**
 * Delays execution for a random duration between min and max milliseconds.
 * @param {number} min - Minimum delay in ms.
 * @param {number} max - Maximum delay in ms.
 * @returns {Promise<void>}
 */
const sleep = (min, max = min) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Types text into a selector with realistic random human delays.
 * @param {import('playwright').Page} page - Playwright page object.
 * @param {string} selector - CSS selector of the input field.
 * @param {string} text - The text to type.
 */
const humanType = async (page, selector, text) => {
  await page.focus(selector);
  for (const char of text) {
    await page.type(selector, char);
    // Random delay between 50ms and 150ms per character to simulate human typing
    await sleep(50, 150);
  }
};

/**
 * Simulates a smooth human-like scroll down a page.
 * @param {import('playwright').Page} page - Playwright page object.
 * @param {number} maxScrolls - Number of scroll steps.
 */
const humanScroll = async (page, maxScrolls = 5) => {
  for (let i = 0; i < maxScrolls; i++) {
    // Generate random scroll height and direction
    const scrollHeight = Math.floor(Math.random() * 300) + 150; // Scroll 150px to 450px
    await page.evaluate((y) => window.scrollBy(0, y), scrollHeight);
    
    // Random rest time after scrolling
    await sleep(800, 2000);
  }
};

/**
 * Safely clicks an element by hovering first to trigger any JS events.
 * @param {import('playwright').Page} page - Playwright page object.
 * @param {string} selector - CSS selector to click.
 */
const humanClick = async (page, selector) => {
  const element = page.locator(selector);
  await element.hover();
  await sleep(100, 300); // Brief pause after hovering
  await element.click();
};

module.exports = {
  sleep,
  humanType,
  humanScroll,
  humanClick,
};
