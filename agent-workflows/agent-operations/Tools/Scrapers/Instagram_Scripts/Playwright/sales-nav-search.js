const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep, humanType, humanScroll, humanClick } = require('./utils');

// Apply stealth plugin
chromium.use(stealth());

const authFilePath = path.join(__dirname, 'auth.json');

(async () => {
  // Check if session file exists
  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: auth.json not found!');
    console.error('Please run "node save-session.js" first to manually log in and capture your session.');
    process.exit(1);
  }

  console.log('Launching browser with saved session state...');
  const browser = await chromium.launch({
    headless: false, // Strongly recommended to run headed to mimic a real user and avoid instant bot detection
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  // Load the context with the saved storageState (cookies, localStorage, etc.)
  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('Navigating to Sales Navigator...');
  // Navigate directly to the Sales Navigator homepage
  await page.goto('https://www.linkedin.com/sales', { waitUntil: 'domcontentloaded' });
  
  // Random delay to simulate human page-load wait
  await sleep(3000, 5000);

  // Check if we got redirected to the login page (meaning session expired)
  const currentUrl = page.url();
  if (currentUrl.includes('linkedin.com/login') || currentUrl.includes('linkedin.com/uas/login')) {
    console.error('ERROR: Session has expired or is invalid. LinkedIn redirected to the login page.');
    console.error('Please re-run "node save-session.js" to capture a fresh session state.');
    await browser.close();
    process.exit(1);
  }

  console.log('Successfully loaded Sales Navigator! Current URL:', currentUrl);

  // Take a screenshot to verify load state
  await page.screenshot({ path: 'sales-nav-home.png' });
  console.log('Saved screenshot of Sales Navigator homepage to sales-nav-home.png');

  // Let's perform a demo search
  console.log('Looking for the global search input...');
  
  // Look for the Sales Navigator search input box. Common selectors include:
  // - '#global-typeahead-search-input'
  // - 'input[placeholder*="Search"]'
  const searchInputSelector = '#global-typeahead-search-input, input[placeholder*="Search"]';
  
  try {
    // Wait for the input field to appear
    await page.waitForSelector(searchInputSelector, { timeout: 10000 });
    
    console.log('Found search input. Simulating human click and typing...');
    await humanClick(page, searchInputSelector);
    await sleep(500, 1500);

    // Type the query: "Software Engineer"
    await humanType(page, searchInputSelector, 'Software Engineer');
    await sleep(800, 1500);

    // Press Enter to submit the search
    console.log('Submitting search query...');
    await page.keyboard.press('Enter');

    console.log('Waiting for search results page to load...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
      console.log('Navigation event did not trigger, checking current page state...');
    });

    await sleep(4000, 6000);

    console.log('Simulating human reading by scrolling down the results page...');
    await humanScroll(page, 4);

    // Take screenshot of search results
    await page.screenshot({ path: 'sales-nav-search-results.png' });
    console.log('Saved search results screenshot to sales-nav-search-results.png');

  } catch (error) {
    console.warn('Could not locate or interact with the search input box.', error.message);
    console.log('This is normal if LinkedIn has updated their DOM structure. Taking a diagnostic screenshot...');
    await page.screenshot({ path: 'diagnostics-error.png' });
  }

  console.log('Automation demo finished. Closing browser...');
  await browser.close();
})();
