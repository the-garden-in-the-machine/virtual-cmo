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

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api') || url.includes('graphql')) {
      console.log('API Request:', url);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('graphql') || url.includes('feed/user') || url.includes('web_profile_info')) {
      console.log('Captured Response from:', url);
      try {
        const text = await response.text();
        fs.writeFileSync(`~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/intercepted_${Date.now()}.json`, text);
        console.log('Saved response body.');
      } catch (e) {
        console.log('Could not read response body:', e.message);
      }
    }
  });

  console.log('Navigating to profile...');
  await page.goto('https://www.instagram.com/fuserstudio/', { waitUntil: 'networkidle' });
  await sleep(3000, 5000);

  console.log('Scrolling down to trigger API requests...');
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await sleep(2000, 4000);
  }

  await browser.close();
})();
