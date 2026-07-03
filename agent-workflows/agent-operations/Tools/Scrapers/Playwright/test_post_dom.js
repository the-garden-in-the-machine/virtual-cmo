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
  await sleep(5000);
  
  // Let's print out all list items or text on the page to see where comments are
  const dump = await page.evaluate(() => {
    const res = [];
    
    // Check if there are any ul or li
    const uls = document.querySelectorAll('ul');
    res.push(`Found ${uls.length} uls`);
    
    const lis = document.querySelectorAll('li');
    res.push(`Found ${lis.length} lis`);
    
    // Dump text from list items
    lis.forEach((li, idx) => {
      res.push(`li[${idx}] text: ${li.textContent.trim().slice(0, 150)}`);
    });
    
    // Let's also look for elements with role="listitem" or other selectors
    const listItems = document.querySelectorAll('div[role="listitem"]');
    res.push(`Found ${listItems.length} divs with role=listitem`);
    listItems.forEach((li, idx) => {
      res.push(`listitem[${idx}] text: ${li.textContent.trim().slice(0, 150)}`);
    });

    // Let's find all span tags and print a few
    const spans = document.querySelectorAll('span');
    res.push(`Found ${spans.length} spans`);
    
    return res;
  });
  
  console.log(dump.slice(0, 40).join('\n'));
  await browser.close();
})();
