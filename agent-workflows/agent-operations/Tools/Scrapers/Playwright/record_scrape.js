const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { sleep } = require('./utils');

chromium.use(stealth());

const authFilePath = path.join(__dirname, 'instagram-auth.json');
const targetVideoDir = path.join(__dirname, 'videos');

const getArgs = () => {
  const args = {};
  process.argv.forEach((val, index) => {
    if (val === '--usernames' && process.argv[index + 1]) {
      args.usernames = process.argv[index + 1].split(',').map(u => u.trim());
    }
    if (val === '--output' && process.argv[index + 1]) {
      args.output = process.argv[index + 1].trim();
    }
  });
  return args;
};

(async () => {
  const args = getArgs();
  
  if (!args.usernames || args.usernames.length === 0) {
    console.error('ERROR: No usernames specified. Usage: node record_scrape.js --usernames user1,user2 [--output /path/to/video.webm]');
    process.exit(1);
  }

  // Set default output destination if not specified
  const artifactDestPath = args.output || path.join(__dirname, '../../../Execution_Logs/Instagram_Videos/media_scout_related_scrape.mp4');

  if (!fs.existsSync(authFilePath)) {
    console.error('ERROR: instagram-auth.json not found!');
    process.exit(1);
  }

  // Ensure videos directory exists
  if (!fs.existsSync(targetVideoDir)) {
    fs.mkdirSync(targetVideoDir, { recursive: true });
  }

  console.log(`Launching browser to perform and record profile scrapes for: ${args.usernames.join(', ')}...`);
  const browser = await chromium.launch({
    headless: true, // Headless allows recording inside sandbox environment reliably
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    storageState: authFilePath,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    recordVideo: {
      dir: targetVideoDir,
      size: { width: 1280, height: 800 }
    }
  });

  const page = await context.newPage();

  try {
    for (const username of args.usernames) {
      console.log(`Navigating to @${username} profile page...`);
      await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle' });
      await sleep(4000, 6000);

      console.log(`Scrolling down to load recent feed posts for @${username}...`);
      for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 400));
        await sleep(1500, 2500);
      }
      await sleep(2000, 3000);

      // Scroll back up to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await sleep(2000);
    }

    console.log('Scraping and recording completed successfully!');

  } catch (err) {
    console.error('ERROR during scrape execution:', err.message);
  } finally {
    // Closing context saves the video
    await context.close();
    
    // Get video file path
    const videoFile = page.video();
    if (videoFile) {
      const videoPath = await videoFile.path();
      console.log('Playwright video saved temporarily to:', videoPath);
      
      // Ensure target directory for artifact exists
      const destDir = path.dirname(artifactDestPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Check if we need to convert WebM to MP4
      const isMp4 = artifactDestPath.toLowerCase().endsWith('.mp4');
      
      if (isMp4) {
        console.log(`Converting recorded WebM video to MP4 via ffmpeg: ${artifactDestPath}...`);
        try {
          execSync(`ffmpeg -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${artifactDestPath}"`, { stdio: 'ignore' });
          console.log('Successfully converted and saved video to:', artifactDestPath);
        } catch (convErr) {
          console.error('ffmpeg conversion failed, copying raw webm instead:', convErr.message);
          const fallbackPath = artifactDestPath.replace(/\.mp4$/i, '.webm');
          fs.copyFileSync(videoPath, fallbackPath);
        }
      } else {
        // Copy directly
        try {
          fs.copyFileSync(videoPath, artifactDestPath);
          console.log('Successfully copied recorded video to:', artifactDestPath);
        } catch (copyErr) {
          console.error('Failed to copy video to destination path:', copyErr.message);
        }
      }
    } else {
      console.warn('WARNING: No video was recorded by Playwright.');
    }
    
    await browser.close();
  }
})();
