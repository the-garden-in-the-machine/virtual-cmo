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
      const parent4 = link.parentElement && 
                      link.parentElement.parentElement && 
                      link.parentElement.parentElement.parentElement && 
                      link.parentElement.parentElement.parentElement.parentElement;
      const parent5 = parent4 && parent4.parentElement;
      
      output.push(`\n=== Link ${idx}: ${username} ===`);
      if (parent4 && parent5) {
        const p4Text = parent4.textContent.replace(/\s+/g, ' ').trim();
        const p5Text = parent5.textContent.replace(/\s+/g, ' ').trim();
        const text = p5Text.replace(p4Text, '').trim();
        
        output.push(`  p4Text: "${p4Text}"`);
        output.push(`  p5Text: "${p5Text}"`);
        output.push(`  Subtracted Text: "${text}"`);
      } else {
        output.push('  No parent4 or parent5');
      }
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
