const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');

(async () => {
  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: instagram-auth.json not found!');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
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

  let capturedJson = null;

  // Listen to response events
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('graphql') || url.includes('query') || url.includes('web_profile_info') || url.includes('feed')) {
      try {
        const text = await response.text();
        if (text.includes('marshmallowlaserfeast') && 
            (text.includes('edge_owner_to_timeline_media') || text.includes('user_timeline_graphql_connection'))) {
          console.error(`Found timeline data in response: ${url} (${text.length} bytes)`);
          capturedJson = JSON.parse(text);
        }
      } catch (err) {
        // ignore read/parse errors for non-JSON responses
      }
    }
  });

  console.error('Navigating to marshmallowlaserfeast profile page...');
  await page.goto('https://www.instagram.com/marshmallowlaserfeast/', { waitUntil: 'networkidle' });
  await sleep(6000, 9000);

  // Scroll down slightly to trigger lazy-loaded requests if any
  console.error('Scrolling down slightly...');
  await page.evaluate(() => window.scrollBy(0, 500));
  await sleep(3000, 5000);

  // Take a screenshot for diagnostics
  await page.screenshot({ path: '~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_profile.png' });
  console.error('Diagnostic screenshot saved.');

  await browser.close();

  if (capturedJson) {
    fs.writeFileSync('~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_raw.json', JSON.stringify(capturedJson, null, 2));
    console.log('Successfully captured raw profile JSON!');
  } else {
    console.error('Failed to intercept profile timeline response.');
  }
})();
