const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

// Apply stealth plugin
chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');

// Parse command line arguments
// Syntax: node scrape-instagram.js --usernames user1,user2
const getArgs = () => {
  const args = {};
  process.argv.forEach((val, index) => {
    if (val === '--usernames' && process.argv[index + 1]) {
      args.usernames = process.argv[index + 1].split(',').map(u => u.trim());
    }
  });
  return args;
};

(async () => {
  const args = getArgs();
  
  if (!args.usernames || args.usernames.length === 0) {
    console.error('ERROR: No usernames specified. Usage: node scrape-instagram.js --usernames user1,user2');
    process.exit(1);
  }

  // Check if session file exists
  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: instagram-auth.json not found!');
    console.error('Please run "node save-instagram-session.js" first to manually log in and capture your session.');
    process.exit(1);
  }

  // Use stderr for info logs so stdout remains clean JSON
  console.error('Launching browser with saved Instagram session...');
  
  const browser = await chromium.launch({
    headless: true, // Headless is fine for API calls, but can be set to false for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  // Load context with saved storageState
  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  // Navigate to Instagram homepage context first
  console.error('Navigating to Instagram homepage to establish session context...');
  await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
  await sleep(2000, 4000);

  // Check if we are logged in. (If we see "login" in the URL or we redirect to login, it might have expired)
  if (page.url().includes('accounts/login')) {
    console.error('ERROR: Session expired. Instagram redirected to the login page.');
    console.error('Please re-run "node save-instagram-session.js" to log in again.');
    await browser.close();
    process.exit(1);
  }

  const results = [];

  for (const username of args.usernames) {
    console.error(`Fetching profile for: ${username}...`);

    try {
      // Execute the fetch request directly in the browser page context
      const profileData = await page.evaluate(async (user) => {
        try {
          const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${user}`, {
            headers: {
              'x-ig-app-id': '936619743392459',
              'sec-ch-ua-platform': '"macOS"',
              'x-requested-with': 'XMLHttpRequest'
            }
          });
          
          if (!response.ok) {
            return { error: true, status: response.status, statusText: response.statusText };
          }
          
          return await response.json();
        } catch (err) {
          return { error: true, message: err.message };
        }
      }, username);

      if (profileData.error) {
        console.error(`WARNING: Failed to fetch profile for ${username}:`, profileData.statusText || profileData.message);
        results.push({ username, error: true, message: profileData.statusText || profileData.message });
      } else if (profileData.data && profileData.data.user) {
        const user = profileData.data.user;
        // Flatten or map profile fields to match Google Sheets schema
        results.push({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          biography: user.biography,
          follower_count: user.edge_followed_by ? user.edge_followed_by.count : 0,
          following_count: user.edge_follow ? user.edge_follow.count : 0,
          media_count: user.edge_owner_to_timeline_media ? user.edge_owner_to_timeline_media.count : 0,
          is_verified: user.is_verified,
          is_private: user.is_private,
          is_business: user.is_business_account,
          profile_pic_url: user.profile_pic_url_hd || user.profile_pic_url,
          external_url: user.external_url,
          category: user.category_name,
          scraped: 'TRUE'
        });
        console.error(`Successfully fetched ${username}.`);
      } else {
        console.error(`WARNING: No data returned for ${username}.`);
        results.push({ username, error: true, message: 'No data returned' });
      }

    } catch (err) {
      console.error(`ERROR: Exception occurred while fetching ${username}:`, err.message);
      results.push({ username, error: true, message: err.message });
    }

    // Add a random delay between scrapes to simulate human pacing
    if (args.usernames.indexOf(username) < args.usernames.length - 1) {
      const delay = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds delay
      console.error(`Pacing... waiting ${delay / 1000}s before next request.`);
      await sleep(delay);
    }
  }

  // Close browser
  await browser.close();

  // Print final clean JSON to stdout for n8n capture
  console.log(JSON.stringify(results, null, 2));
})();
