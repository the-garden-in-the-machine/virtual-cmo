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
  
  console.log('Opening post page...');
  await page.goto('https://www.instagram.com/p/DZN6nbkEq5g/', { waitUntil: 'networkidle' });
  await sleep(6000); // long sleep to ensure fully loaded
  
  const results = await page.evaluate(() => {
    const log = [];
    
    // Function to get full path of element
    function getPath(el) {
      let path = el.tagName.toLowerCase();
      let parent = el.parentElement;
      while (parent && parent.tagName.toLowerCase() !== 'body') {
        const id = parent.id ? '#' + parent.id : '';
        const classes = parent.className ? '.' + parent.className.trim().split(/\s+/).join('.') : '';
        path = parent.tagName.toLowerCase() + id + classes + ' > ' + path;
        parent = parent.parentElement;
      }
      return path;
    }

    // Find all elements containing text "interesting"
    const all = document.querySelectorAll('*');
    all.forEach(el => {
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
        const txt = el.textContent.trim();
        if (txt.includes('interesting') || txt.includes('CASE STUDY 011') || txt.includes('echo_is_not_here')) {
          log.push(`Match: "${txt}"`);
          log.push(`Tag: ${el.tagName}`);
          log.push(`Class: ${el.className}`);
          log.push(`Path: ${getPath(el)}`);
          log.push('-------------------------');
        }
      }
    });
    
    return log;
  });
  
  console.log(results.join('\n'));
  await browser.close();
})();
