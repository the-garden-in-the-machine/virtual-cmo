const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { sleep } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');
const visitedCodesPath = '~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/visited_codes.json';

const getArgs = () => {
  const args = {
    username: 'fuserstudio',
    visited: '~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/visited_codes.json'
  };
  process.argv.forEach((val, index) => {
    if (val === '--username' && process.argv[index + 1]) {
      args.username = process.argv[index + 1].trim();
    }
    if (val === '--visited' && process.argv[index + 1]) {
      args.visited = process.argv[index + 1].trim();
    }
  });
  return args;
};

(async () => {
  const args = getArgs();
  const targetUsername = args.username;
  const visitedCodesPath = args.visited;

  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: instagram-auth.json not found!');
    process.exit(1);
  }

  if (!fs.existsSync(visitedCodesPath)) {
    console.error(`ERROR: Visited codes file not found at: ${visitedCodesPath}`);
    process.exit(1);
  }

  const codes = JSON.parse(fs.readFileSync(visitedCodesPath, 'utf8'));
  console.log(`Loaded ${codes.length} post codes to scrape for @${targetUsername}...`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 1000 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const detailedResults = [];

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const url = `https://www.instagram.com/p/${code}/`;
    console.log(`[${i+1}/${codes.length}] Navigating to: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(5000, 7000);

      // Save a screenshot in the scratch folder
      const screenshotName = `post_${code}.png`;
      const screenshotPath = path.join('~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch', screenshotName);
      await page.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot to: ${screenshotPath}`);

      // Extract caption and comments using normalized whitespace subtraction
      const postDetails = await page.evaluate((targetUser) => {
        let captionText = '';
        let authorName = targetUser;
        const comments = [];

        const userLinks = document.querySelectorAll('a.notranslate');
        userLinks.forEach((link) => {
          if (link.querySelector('img')) return;

          const username = link.textContent.trim();
          let cleanUsername = username;
          if (cleanUsername.endsWith('Verified')) {
            cleanUsername = cleanUsername.slice(0, -8);
          }

          // Collect unique text content of ancestors
          const texts = [];
          let el = link;
          for (let i = 0; i < 9; i++) {
            if (!el) break;
            const txt = el.textContent.replace(/\s+/g, ' ').trim();
            if (txt && !texts.includes(txt)) {
              texts.push(txt);
            }
            el = el.parentElement;
          }

          let extractedText = '';
          if (texts.length >= 3) {
            extractedText = texts[2].replace(texts[1], '').trim();
          } else if (texts.length === 2) {
            extractedText = texts[1].replace(texts[0], '').trim();
          }

          if (!extractedText || extractedText === 'Verified') {
            return;
          }

          if (cleanUsername === targetUser) {
            if (extractedText.length > captionText.length) {
              captionText = extractedText;
              authorName = cleanUsername;
            }
          } else {
            const isDup = comments.some(c => c.author === cleanUsername && c.text === extractedText);
            if (!isDup) {
              comments.push({ author: cleanUsername, text: extractedText });
            }
          }
        });

        return {
          caption: captionText,
          author: authorName,
          comments
        };
      }, targetUsername);

      console.log(`Extracted caption (len: ${postDetails.caption.length}) and ${postDetails.comments.length} comments.`);

      detailedResults.push({
        code,
        url,
        caption: postDetails.caption || '',
        author: postDetails.author || targetUsername,
        comments: postDetails.comments,
        screenshot: `~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/${screenshotName}`
      });

    } catch (err) {
      console.error(`ERROR scraping post ${code}:`, err.message);
      detailedResults.push({
        code,
        url,
        error: true,
        message: err.message
      });
    }

    // Delay between page opens
    if (i < codes.length - 1) {
      const delay = Math.floor(Math.random() * 3000) + 4000; // 4 to 7 seconds delay
      console.log(`Pacing... waiting ${delay/1000}s`);
      await sleep(delay);
    }
  }

  // Save detailed results to a JSON file
  const outPath = `~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/scraped_details_${targetUsername}.json`;
  fs.writeFileSync(outPath, JSON.stringify(detailedResults, null, 2));
  console.log(`Successfully saved scraped details to scraped_details_${targetUsername}.json!`);

  await browser.close();
})();
