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
  
  await page.goto('https://www.instagram.com/p/DZN6nbkEq5g/', { waitUntil: 'networkidle' });
  await sleep(6000);
  
  const results = await page.evaluate(() => {
    const output = [];
    
    // Let's find all user links
    const userLinks = document.querySelectorAll('a.notranslate');
    userLinks.forEach((link, i) => {
      output.push(`\n=== Link ${i}: ${link.textContent} ===`);
      // Let's print the HTML of the grandparent or great-grandparent
      const parent = link.closest('div'); // find closest div parent
      if (parent) {
        output.push(`Closest div text: ${parent.textContent.trim().slice(0, 150)}`);
        output.push(`Closest div HTML: ${parent.innerHTML.slice(0, 500)}`);
      }
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
