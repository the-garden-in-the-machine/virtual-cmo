const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'auth.json');
const targetUrl = 'https://www.linkedin.com/sales/company/875431?_ntb=YS0WKR49RUG4UxBHomi7rw%3D%3D';

(async () => {
  console.log('===================================================');
  console.log('  Sales Navigator Company Page Inspector');
  console.log('===================================================');

  if (!fs.existsSync(authFilePath)) {
    console.error('Error: auth.json not found. Run save_session first.');
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ]
  });

  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log(`Navigating to target Company URL: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000); // wait for dynamic calculations to render

  // Auto scroll to trigger lazy loading of insights or sub-sections
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 2);
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 1000));
    window.scrollTo(0, 0);
  });

  const scanResults = await page.evaluate(() => {
    const data = {
      title: document.title,
      headings: [],
      metadataFields: [],
      textBlocks: []
    };

    // Get all headings
    document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      const txt = h.innerText ? h.innerText.trim() : '';
      if (txt) data.headings.push({ tag: h.tagName, text: h.innerText.trim().replace(/\s+/g, ' ') });
    });

    // Get data-anonymize fields
    document.querySelectorAll('[data-anonymize]').forEach(el => {
      const type = el.getAttribute('data-anonymize');
      const txt = el.innerText ? el.innerText.trim() : '';
      if (txt) data.metadataFields.push({ type, text: txt.replace(/\s+/g, ' ') });
    });

    // Extract all table data and key-value details cards
    document.querySelectorAll('dl, dt, dd, li[class*="metric"], div[class*="metric"], .company-details-panel, [class*="details"], [class*="insight"], [class*="growth"]').forEach(el => {
      const txt = el.innerText ? el.innerText.trim().replace(/\s+/g, ' ') : '';
      if (txt && txt.length > 5 && !data.textBlocks.includes(txt)) {
        data.textBlocks.push(txt);
      }
    });

    // Extract raw text from any tables or graphs
    document.querySelectorAll('table, .premium-insights-chart, [class*="chart"]').forEach(el => {
      const txt = el.innerText ? el.innerText.trim().replace(/\s+/g, ' ') : '';
      if (txt && !data.textBlocks.includes(txt)) {
        data.textBlocks.push(txt);
      }
    });

    return data;
  });

  const logDir = path.join(__dirname, 'Execution_Logs/Sales_Nav_Campaign_1');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const jsonPath = path.join(logDir, 'company_page_scan.json');
  fs.writeFileSync(jsonPath, JSON.stringify(scanResults, null, 2));
  console.log(`✔ Scan complete. Results saved to: ${jsonPath}`);

  const screenshotPath = path.join(logDir, 'inspected_company_page.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✔ Full-page screenshot saved to: ${screenshotPath}`);

  await browser.close();
})();
