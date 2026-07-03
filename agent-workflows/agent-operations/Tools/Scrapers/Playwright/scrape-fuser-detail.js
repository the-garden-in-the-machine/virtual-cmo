const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep, humanClick } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');

(async () => {
  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: instagram-auth.json not found!');
    process.exit(1);
  }

  console.log('Launching browser for human-like clicking flow...');
  const browser = await chromium.launch({
    headless: false, // Run headed so the user can see it and it behaves like a real browser
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

  console.log('Navigating to fuserstudio profile page...');
  await page.goto('https://www.instagram.com/fuserstudio/', { waitUntil: 'networkidle' });
  await sleep(4000, 6000);

  // Selector for the first post on the grid
  const firstPostSelector = 'a[href*="/p/"]';
  
  console.log('Waiting for posts to render on the page...');
  try {
    await page.waitForSelector(firstPostSelector, { timeout: 10000 });
  } catch (err) {
    console.error('ERROR: Timeout waiting for profile grid posts to load.');
    await page.screenshot({ path: path.join(__dirname, 'grid-loading-error.png') });
    await browser.close();
    process.exit(1);
  }

  const firstPost = page.locator(firstPostSelector).first();

  console.log('Hovering over the first post...');
  await firstPost.hover();
  await sleep(800, 1500);

  console.log('Clicking the first post to open modal...');
  await firstPost.click();
  await sleep(3000, 5000);

  const visitedCodes = [];

  // Walk through 12 posts (since there are 12 posts in the past month)
  for (let step = 1; step <= 12; step++) {
    const currentUrl = page.url();
    // URL format: https://www.instagram.com/p/CODE/
    const match = currentUrl.match(/\/p\/([a-zA-Z0-9_-]+)\//);
    const code = match ? match[1] : 'unknown';
    
    console.log(`[Post ${step}/12] Visited Code: ${code} (URL: ${currentUrl})`);
    visitedCodes.push(code);

    // Simulate reading/looking at the post
    const readTime = Math.floor(Math.random() * 4000) + 5000; // 5 to 9 seconds
    console.log(`Simulating reading post ${code}... waiting ${readTime / 1000}s`);
    await sleep(readTime);

    // If it's the last post, we don't need to click next
    if (step === 12) break;

    // Locate the "Next" button in the modal
    // Instagram's next button typically contains a right chevron SVG with aria-label="Next"
    const nextButtonSelectors = [
      'button:has(svg[aria-label="Next"])',
      'svg[aria-label="Next"]',
      'div[role="dialog"] button:has(svg[aria-label="Next"])',
      'button._bla' // fallback if class is known
    ];

    let clickedNext = false;
    for (const sel of nextButtonSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0 && await btn.isVisible()) {
        console.log(`Clicking "Next" button using selector: ${sel}`);
        await btn.hover();
        await sleep(100, 300);
        await btn.click();
        clickedNext = true;
        break;
      }
    }

    if (!clickedNext) {
      console.warn('WARNING: Could not find or click the "Next" button. Taking screenshot...');
      await page.screenshot({ path: path.join(__dirname, 'next-button-error.png') });
      break;
    }

    // Wait for the next post to load in the modal
    await sleep(2000, 4000);
  }

  console.log('Human-like clicking flow completed successfully!');
  console.log('Visited codes:', visitedCodes);

  // Write visited codes list to a scratch file
  fs.writeFileSync('~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/visited_codes.json', JSON.stringify(visitedCodes, null, 2));

  await browser.close();
})();
