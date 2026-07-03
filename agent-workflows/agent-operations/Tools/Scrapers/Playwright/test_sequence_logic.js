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
      // Skip avatar links (links that contain img)
      if (link.querySelector('img')) {
        output.push(`\n=== Link ${idx} (Skipped avatar link) ===`);
        return;
      }
      
      const username = link.textContent.trim();
      output.push(`\n=== Link ${idx}: ${username} ===`);
      
      // Collect all ancestor texts
      const texts = [];
      let el = link;
      for (let i = 0; i < 9; i++) {
        if (!el) break;
        const txt = el.textContent.replace(/\s+/g, ' ').trim();
        if (txt && !texts.includes(txt)) {
          texts.push(txt);
        }
        el = el.parentElement;
      }
      
      output.push(`  Unique texts found: ${JSON.stringify(texts)}`);
      
      // Let's print out the subtraction if we have at least 3 unique levels
      if (texts.length >= 3) {
        const t0 = texts[0];
        const t1 = texts[1];
        const t2 = texts[2];
        const commentText = t2.replace(t1, '').trim();
        output.push(`  Extracted Comment (t2 - t1): "${commentText}"`);
      } else if (texts.length === 2) {
        const t0 = texts[0];
        const t1 = texts[1];
        const commentText = t1.replace(t0, '').trim();
        output.push(`  Extracted Comment (t1 - t0): "${commentText}"`);
      } else {
        output.push(`  Too few unique texts: ${texts.length}`);
      }
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
