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
      output.push(`\n=== Link ${idx}: ${username} ===`);
      
      // Print tag and parents class
      let el = link;
      let path = '';
      for (let i = 0; i < 6; i++) {
        if (!el) break;
        const tagName = el.tagName.toLowerCase();
        const className = el.className ? `.${el.className.split(' ').join('.')}` : '';
        path = `${tagName}${className} > ${path}`;
        
        // Print the direct children of this level
        const children = Array.from(el.children).map(c => {
          const cTagName = c.tagName.toLowerCase();
          const cClassName = c.className ? `.${c.className.split(' ').join('.')}` : '';
          return `<${cTagName}${cClassName}>: "${c.textContent.trim().slice(0, 50)}"`;
        });
        
        output.push(`  Depth ${i}: ${tagName}${className}`);
        output.push(`    Children: ${JSON.stringify(children)}`);
        
        el = el.parentElement;
      }
      output.push(`  Full path: ${path}`);
    });
    
    return output;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
