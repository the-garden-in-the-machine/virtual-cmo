const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'auth.json');

(async () => {
  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: auth.json not found!');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log('Navigating to search page...');
    await page.goto('https://www.linkedin.com/sales/search/people', { waitUntil: 'domcontentloaded' });
    await sleep(5000, 8000);

    await page.screenshot({ path: 'debug_1_loaded.png' });
    console.log('Screenshot saved: debug_1_loaded.png');

    // 1. Dismiss coach-mark popover
    const dismissSelector = 'button[aria-label="Dismiss"], .artdeco-hoverable-content__close-btn, button:has-text("Dismiss"), button[class*="dismiss"]';
    const dismissBtn = page.locator(dismissSelector).first();
    if (await dismissBtn.count() > 0 && await dismissBtn.isVisible()) {
      console.log('Coach-mark visible. Dismissing...');
      await dismissBtn.click();
      await sleep(1500, 2500);
      await page.screenshot({ path: 'debug_2_dismissed.png' });
      console.log('Screenshot saved: debug_2_dismissed.png');
    } else {
      console.log('No coach-mark visible or matches found.');
    }

    // 2. Expand Current Company Filter
    const expandSelector = 'button:has-text("Current company"), [class*="trigger"]:has-text("Current company"), dt:has-text("Current company"), [class*="filter-name"]:has-text("Current company")';
    const expandTrigger = page.locator(expandSelector).first();
    
    if (await expandTrigger.count() > 0) {
      console.log('Found expand trigger. Clicking...');
      await expandTrigger.click();
      await sleep(2000, 3000);
      await page.screenshot({ path: 'debug_3_expanded.png' });
      console.log('Screenshot saved: debug_3_expanded.png');
    } else {
      console.log('ERROR: Expand trigger not found!');
    }

    // 3. Locate company input field
    const companyInputSelector = 'input[placeholder*="Add current companies"], input[placeholder*="current companies"]';
    const companyInput = page.locator(companyInputSelector).first();
    if (await companyInput.count() > 0 && await companyInput.isVisible()) {
      console.log('Input field is visible! Typing test: "Collins"');
      await companyInput.click();
      await sleep(500, 1000);
      for (const char of 'Collins') {
        await page.keyboard.type(char);
        await sleep(100, 250);
      }
      await sleep(3000, 5000);
      await page.screenshot({ path: 'debug_4_typed.png' });
      console.log('Screenshot saved: debug_4_typed.png');

      // Check for suggestions
      const optionSelector = '[role="option"], .search-filter-dropdown__option, li[class*="suggestion"]';
      const firstOption = page.locator(optionSelector).first();
      if (await firstOption.count() > 0) {
        console.log('Suggestions visible! First suggestion text:', await firstOption.innerText());
        await firstOption.click();
        await sleep(3000, 5000);
        await page.screenshot({ path: 'debug_5_selected.png' });
        console.log('Screenshot saved: debug_5_selected.png');
      } else {
        console.log('No suggestions found.');
      }
    } else {
      console.log('ERROR: Input field not visible!');
    }

  } catch (err) {
    console.error('ERROR during debug:', err.message);
  } finally {
    await browser.close();
  }
})();
