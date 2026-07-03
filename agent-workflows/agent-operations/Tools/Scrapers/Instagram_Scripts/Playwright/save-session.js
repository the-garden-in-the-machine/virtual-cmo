const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const readline = require('readline');
const path = require('path');

// Apply stealth plugin
chromium.use(stealth());

// Path to save the session state
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
  console.log('Launching browser to capture LinkedIn session...');
  
  // Launch chromium in headed mode so you can see it and type your credentials
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      // Useful to prevent automated flags
      '--disable-blink-features=AutomationControlled',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('Navigating to LinkedIn login page...');
  await page.goto('https://www.linkedin.com/login');

  console.log('\n==================================================================');
  console.log('INSTRUCTIONS:');
  console.log('1. Log into your LinkedIn account in the opened browser window.');
  console.log('2. Complete any 2FA or CAPTCHA verification if prompted.');
  console.log('3. Ensure you are on the LinkedIn homepage feed or Sales Navigator.');
  console.log('4. Once logged in, come back here and press ENTER to save the session.');
  console.log('==================================================================\n');

  await askQuestion('Press [ENTER] to save the session and close the browser...');

  console.log('Saving storage state to:', authFilePath);
  // Captures cookies and localStorage
  await context.storageState({ path: authFilePath });
  
  console.log('Session saved successfully!');
  await browser.close();
})();
