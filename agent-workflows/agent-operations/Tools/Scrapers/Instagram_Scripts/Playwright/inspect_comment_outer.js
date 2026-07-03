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
    const userLinks = document.querySelectorAll('a.notranslate');
    
    userLinks.forEach((link, idx) => {
      const username = link.textContent.trim();
      if (username === 'echo_is_not_here') {
        output.push(`\n=== Link ${idx}: ${username} ===`);
        
        let el = link;
        for (let i = 0; i < 7; i++) {
          if (!el) break;
          output.push(`\n--- Depth ${i} (${el.tagName.toLowerCase()}, class="${el.className}") ---`);
          output.push(el.outerHTML.slice(0, 1000));
          el = el.parentElement;
        }
      }
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
