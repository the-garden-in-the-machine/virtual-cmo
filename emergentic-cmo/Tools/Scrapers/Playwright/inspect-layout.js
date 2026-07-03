const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'auth.json');

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

(async () => {
  console.log('===================================================');
  console.log('  Sales Navigator Lead Page Layout Inspector');
  console.log('===================================================');

  let storageState = undefined;
  if (fs.existsSync(authFilePath)) {
    console.log('Found existing auth session. Using stored credentials...');
    storageState = authFilePath;
  } else {
    console.log('No auth session found. You will need to log in manually first.');
  }

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ]
  });

  const context = await browser.newContext({
    storageState: storageState,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('\nNavigating to LinkedIn Sales Navigator...');
  await page.goto('https://www.linkedin.com/sales', { waitUntil: 'domcontentloaded' });

  console.log('\n==================================================================');
  console.log('INSTRUCTIONS:');
  console.log('1. Log into your Sales Navigator account if prompted.');
  console.log('2. Navigate to ANY individual Lead Profile page.');
  console.log('   (URL should look like: https://www.linkedin.com/sales/lead/...)');
  console.log('3. Once you are on the target Lead page, return here and press ENTER.');
  console.log('==================================================================\n');

  await askQuestion('Press [ENTER] to start scanning the Lead Page layout...');

  const currentUrl = page.url();
  console.log(`\nInitiating scan on page: ${currentUrl}`);

  // Auto-scroll the page to trigger lazy loading of background/experience panels
  console.log('Scrolling down to trigger experience loading...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 50);
    });
  });
  await page.waitForTimeout(2000);

  // Analyze the DOM
  const scanResults = await page.evaluate(() => {
    const report = {
      title: document.title,
      headings: [],
      buttons: [],
      links: [],
      experienceSections: [],
      textSections: []
    };

    // 1. Scan Headings
    document.querySelectorAll('h1, h2, h3, h4').forEach(el => {
      const text = el.innerText ? el.innerText.trim().replace(/\s+/g, ' ') : '';
      if (text) {
        report.headings.push({
          tag: el.tagName,
          text: text,
          id: el.id,
          class: el.className
        });
      }
    });

    // 2. Scan Interactable Buttons (including Contact Info, Message, Save, More)
    document.querySelectorAll('button').forEach(el => {
      const text = el.innerText ? el.innerText.trim().replace(/\s+/g, ' ') : '';
      const ariaLabel = el.getAttribute('aria-label') || '';
      const id = el.id || '';
      const className = el.className || '';
      const testId = el.getAttribute('data-test-id') || el.getAttribute('data-control-name') || '';

      if (text || ariaLabel || id || testId) {
        report.buttons.push({
          text,
          ariaLabel,
          id,
          class: className,
          controlName: testId
        });
      }
    });

    // 3. Scan Links with potentially useful control names
    document.querySelectorAll('a').forEach(el => {
      const text = el.innerText ? el.innerText.trim().replace(/\s+/g, ' ') : '';
      const href = el.getAttribute('href') || '';
      const controlName = el.getAttribute('data-control-name') || el.getAttribute('data-test-id') || '';
      const ariaLabel = el.getAttribute('aria-label') || '';

      if (text || href || controlName) {
        report.links.push({
          text,
          href,
          controlName,
          ariaLabel,
          class: el.className
        });
      }
    });

    // 4. Scan Experience List Items
    document.querySelectorAll('#experience-section li, [class*="experience"] li, [class*="position"] li').forEach(el => {
      const text = el.innerText ? el.innerText.trim().replace(/\n+/g, ' | ').replace(/\s+/g, ' ') : '';
      if (text) {
        report.experienceSections.push(text);
      }
    });

    // 5. Scan key text metadata blocks (anonymized data attributes)
    document.querySelectorAll('[data-anonymize]').forEach(el => {
      const type = el.getAttribute('data-anonymize');
      const text = el.innerText ? el.innerText.trim() : '';
      if (text) {
        report.textSections.push({ type, text });
      }
    });

    return report;
  });

  // Print summary to console
  console.log('\n--- SCAN RESULTS SUMMARY ---');
  console.log(`Lead Title/Header: ${scanResults.title}`);
  console.log(`Found ${scanResults.headings.length} headings.`);
  console.log(`Found ${scanResults.buttons.length} buttons.`);
  console.log(`Found ${scanResults.links.length} links.`);
  console.log(`Found ${scanResults.experienceSections.length} experience/position records.`);
  console.log(`Found ${scanResults.textSections.length} data-anonymize fields.`);

  // Write detailed report to a log file inside the execution logs directory
  const logDir = path.join(__dirname, 'Execution_Logs/Sales_Nav_Campaign_1');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const reportPath = path.join(logDir, 'lead_page_ui_layout_scan.json');
  fs.writeFileSync(reportPath, JSON.stringify(scanResults, null, 2));
  console.log(`\n✔ Full interactable UI map written to: ${reportPath}`);

  // Take screenshot of scanned page
  const screenshotPath = path.join(logDir, 'inspected_lead_page.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✔ Full-page screenshot saved to: ${screenshotPath}`);

  await askQuestion('\nReview complete. Press [ENTER] to close browser and exit...');
  await browser.close();
})();
