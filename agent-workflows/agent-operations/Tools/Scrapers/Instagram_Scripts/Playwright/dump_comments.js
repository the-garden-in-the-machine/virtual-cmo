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
    // Find all links containing usernames
    const userLinks = document.querySelectorAll('a.notranslate');
    output.push(`Found ${userLinks.length} user links`);
    
    userLinks.forEach((link, i) => {
      const username = link.textContent.trim();
      
      // Let's look at the parent hierarchies
      let parent = link.parentElement;
      let depth = 0;
      output.push(`\n--- Link ${i}: ${username} ---`);
      while (parent && depth < 6) {
        const pClass = parent.className ? parent.className.slice(0, 50) : '';
        output.push(`  Parent ${depth}: <${parent.tagName.toLowerCase()}> class="${pClass}"`);
        // If it's a div containing the comment, print its full text
        const text = parent.textContent.trim();
        output.push(`    Text (len ${text.length}): ${text.replace(/\n/g, ' ').slice(0, 200)}`);
        parent = parent.parentElement;
        depth++;
      }
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
