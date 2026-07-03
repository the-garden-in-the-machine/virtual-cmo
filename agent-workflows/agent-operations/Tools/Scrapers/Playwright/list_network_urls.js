const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: authFilePath });
  const page = await context.newPage();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('graphql')) {
      console.log(`URL: ${url}`);
      try {
        const text = await response.text();
        console.log(`  Size: ${text.length} bytes`);
        if (text.includes('marshmallowlaserfeast') || text.includes('edge_owner_to_timeline_media')) {
          console.log(`  -> CONTAINS TARGET CONTENT!`);
        }
      } catch (err) {
        console.log(`  Failed to read text: ${err.message}`);
      }
    }
  });

  await page.goto('https://www.instagram.com/marshmallowlaserfeast/', { waitUntil: 'networkidle' });
  await sleep(5000);
  await browser.close();
})();
