const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { sleep, humanType, humanScroll, humanClick } = require('./Tools/Scrapers/Playwright/utils');

// Apply stealth plugin
chromium.use(stealth());

// Dry-run / mock data generation for safe local testing
const getMockData = (company, roles = []) => {
  const targetRoles = roles.length > 0 ? roles : ['Creative Director', 'Founder'];
  return {
    success: true,
    company: company || 'Cyberdyne Systems',
    timestamp: new Date().toISOString(),
    source: 'MOCK_DATA',
    companyDetails: {
      companyName: company || 'Cyberdyne Systems',
      companyId: '123456',
      totalEmployees: '520',
      medianTenure: '3.1',
      industry: 'Robotics & AI',
      location: 'Sunnyvale, California',
      website: 'https://cyberdyne.systems',
      departmentGrowth: {
        'Engineering': '12% (3m) | 45% (1y)',
        'Marketing': '-2% (3m) | 5% (1y)',
        'Business Development': '4% (3m) | 18% (1y)'
      }
    },
    prospects: [
      {
        name: 'Sarah Connor',
        title: targetRoles[0] || 'Creative Director',
        company: company || 'Cyberdyne Systems',
        profileUrl: 'https://www.linkedin.com/in/mock-sarah-connor',
        mutualConnections: ['John Doe', 'Marcus Wright'],
        relevanceScore: 92,
        tenure: '4 years 6 months',
        screenshot: `profile_${(company || 'Cyberdyne Systems').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_sarah_connor.png`
      },
      {
        name: 'Kyle Reese',
        title: targetRoles[1] || 'Head of Production',
        company: company || 'Cyberdyne Systems',
        profileUrl: 'https://www.linkedin.com/in/mock-kyle-reese',
        mutualConnections: ['John Doe'],
        relevanceScore: 85,
        tenure: '1 year 2 months',
        screenshot: `profile_${(company || 'Cyberdyne Systems').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_kyle_reese.png`
      }
    ]
  };
};

// Resolve numeric Company ID from search query
async function resolveCompanyId(page, companyName) {
  console.error(`Resolving Company ID for: "${companyName}"...`);
  const searchUrl = `https://www.linkedin.com/sales/search/company?keywords=${encodeURIComponent(companyName)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await sleep(5000, 8000);
  
  // Look for company link: a[href*="/sales/company/"]
  const companyLinkLocator = page.locator('a[href*="/sales/company/"]').first();
  if (await companyLinkLocator.count() > 0) {
    const href = await companyLinkLocator.getAttribute('href');
    if (href) {
      const match = href.match(/\/sales\/company\/(\d+)/);
      if (match && match[1]) {
        console.error(`✔ Resolved Company ID: ${match[1]} for "${companyName}"`);
        return match[1];
      }
    }
  }
  
  throw new Error(`Could not resolve Company ID for "${companyName}". Please check spelling or Sales Navigator access.`);
}

// Scrape company page metadata, details, and headcount growth rates
async function scrapeCompanyPage(page, companyId, options) {
  const companyUrl = `https://www.linkedin.com/sales/company/${companyId}`;
  console.error(`Navigating to Company Page: ${companyUrl}`);
  await page.goto(companyUrl, { waitUntil: 'domcontentloaded' });
  await sleep(6000, 9000); // wait for dynamic calculations to render

  // Auto scroll to trigger lazy loading of insights/sections
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight / 3);
    await new Promise(r => setTimeout(r, 1500));
    window.scrollTo(0, document.body.scrollHeight * 2 / 3);
    await new Promise(r => setTimeout(r, 1500));
    window.scrollTo(0, 0);
  });
  await sleep(2000, 4000);

  const pageText = await page.innerText('body');
  
  // Parse headcount growth metrics per department
  const departments = ['Engineering', 'Marketing', 'Business Development', 'Information Technology', 'Sales', 'Finance', 'Product Management', 'Operations'];
  const departmentGrowth = {};
  for (const dept of departments) {
    const idx = pageText.indexOf(dept);
    if (idx !== -1) {
      const sub = pageText.substring(idx, idx + 200);
      const percentages = sub.match(/[-+]?\d+%/g);
      if (percentages && percentages.length >= 2) {
        departmentGrowth[dept] = `${percentages[0]} (3m) | ${percentages[1]} (1y)`;
      } else if (percentages && percentages.length === 1) {
        departmentGrowth[dept] = `${percentages[0]} (growth)`;
      }
    }
  }

  // Parse general company metrics
  let totalEmployees = '';
  const empMatch = pageText.match(/(\d[\d,]*)\s+total\s+employees/i) || pageText.match(/(\d[\d,]*)\s+employees/i);
  if (empMatch) {
    totalEmployees = empMatch[1];
  }

  let medianTenure = '';
  const tenureMatch = pageText.match(/(\d+(?:\.\d+)?)\s+years?\s+median\s+tenure/i) || pageText.match(/median\s+tenure\s+(\d+(?:\.\d+)?)\s+years?/i);
  if (tenureMatch) {
    medianTenure = tenureMatch[1];
  }

  // Extract metadata fields from data-anonymize
  let companyName = '';
  const nameEl = page.locator('[data-anonymize="company-name"]').first();
  if (await nameEl.count() > 0) {
    companyName = (await nameEl.innerText()).trim();
  }

  let industry = '';
  const indEl = page.locator('[data-anonymize="industry"]').first();
  if (await indEl.count() > 0) {
    industry = (await indEl.innerText()).trim();
  }

  let location = '';
  const locEl = page.locator('[data-anonymize="location"]').first();
  if (await locEl.count() > 0) {
    location = (await locEl.innerText()).trim();
  }

  // Extract company website (external links)
  let website = '';
  const webLocator = page.locator('a[href*="http"]:not([href*="linkedin.com"]):not([href*="licdn.com"])').first();
  if (await webLocator.count() > 0) {
    website = await webLocator.getAttribute('href');
  }

  if (!website) {
    const textWebLocator = page.locator('a:has-text("website"), a:has-text("Website")').first();
    if (await textWebLocator.count() > 0) {
      website = await textWebLocator.getAttribute('href');
    }
  }

  console.error(`✔ Scraped general company details: ${companyName} (${totalEmployees} employees, website: ${website || 'N/A'})`);
  return {
    companyName,
    companyId,
    totalEmployees,
    medianTenure,
    industry,
    location,
    website,
    departmentGrowth
  };
}

// Refactored async runScraper
async function runScraper(options = {}) {
  const mergedOptions = {
    company: '',
    roles: [],
    limit: 3,
    dryRun: false,
    headless: true,
    authPath: path.join(__dirname, 'Tools/Scrapers/Playwright/auth.json'),
    videoDir: path.join(__dirname, 'Execution_Logs/Sales_Nav_Campaign_1/videos'),
    screenshotDir: path.join(__dirname, 'Execution_Logs/Sales_Nav_Campaign_1/screenshots'),
    ...options
  };

  if (!mergedOptions.company) {
    return {
      success: false,
      error: 'Missing required option: company',
      timestamp: new Date().toISOString()
    };
  }

  // Handle dry run mode immediately
  if (mergedOptions.dryRun) {
    return getMockData(mergedOptions.company, mergedOptions.roles);
  }

  // Verify active session file exists for real run
  if (!fs.existsSync(mergedOptions.authPath)) {
    const errorMsg = `Authentication state file not found at ${mergedOptions.authPath}`;
    return {
      success: false,
      error: errorMsg,
      timestamp: new Date().toISOString()
    };
  }

  // Create directories for media logs
  if (!fs.existsSync(mergedOptions.videoDir)) {
    fs.mkdirSync(mergedOptions.videoDir, { recursive: true });
  }
  if (!fs.existsSync(mergedOptions.screenshotDir)) {
    fs.mkdirSync(mergedOptions.screenshotDir, { recursive: true });
  }

  console.error(`Launching browser for: ${mergedOptions.company}...`);
  const browser = await chromium.launch({
    headless: mergedOptions.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const startTime = Date.now();
  let prospects = [];

  try {
    const context = await browser.newContext({
      storageState: mergedOptions.authPath,
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      recordVideo: {
        dir: mergedOptions.videoDir,
        size: { width: 1280, height: 800 }
      }
    });

    const page = await context.newPage();

    // 1. Navigate to Sales Navigator global search page
    console.error('Navigating to LinkedIn Sales Navigator...');
    await page.goto('https://www.linkedin.com/sales', { waitUntil: 'domcontentloaded' });
    await sleep(4000, 7000); // Conservative load wait

    const currentUrl = page.url();
    if (currentUrl.includes('linkedin.com/login') || currentUrl.includes('linkedin.com/uas/login')) {
      throw new Error('LinkedIn session expired. Re-authenticate via save-session.js');
    }

    // 2. Resolve Company ID
    const companyId = await resolveCompanyId(page, mergedOptions.company);

    // 3. Scrape Company Page & Metrics
    const companyDetails = await scrapeCompanyPage(page, companyId, mergedOptions);

    // Take diagnostic screenshot of company page
    const companySanitized = mergedOptions.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await page.screenshot({ path: path.join(mergedOptions.screenshotDir, `company_${companySanitized}.png`) });

    // 4. Scrape key executives and click drawers to get tenure
    console.error('Extracting key executives (Buying Committee)...');
    
    // We try to find the "Buying committee" or "Key people" section. If not found, look for general elements.
    let section = page.locator('section:has-text("Key people"), section:has-text("Buying committee"), [class*="buying-committee"], [class*="key-people"]').first();
    let cards = [];
    if (await section.count() > 0) {
      console.error('Found Key People / Buying Committee section. Scraping cards...');
      cards = await section.locator('.artdeco-entity-lockup, [class*="member"], [class*="card"], li').all();
    } else {
      console.error('Key People section not found by name. Falling back to all artdeco-entity-lockups on page...');
      cards = await page.locator('.artdeco-entity-lockup, li.search-results__result-item, li[class*="result-item"]').all();
    }
    
    let scrapedProspects = [];
    for (const card of cards) {
      if (scrapedProspects.length >= mergedOptions.limit) break;
      
      const nameEl = card.locator('[data-anonymize="person-name"]').first();
      if (await nameEl.count() === 0) continue;
      
      const name = (await nameEl.innerText()).trim();
      if (!name || name.toLowerCase().includes('linkedin member')) continue;
      
      if (scrapedProspects.some(p => p.name === name)) continue;
      
      let title = '';
      const titleEls = await card.locator('[data-anonymize="job-title"], [data-anonymize="title"], .artdeco-entity-lockup__subtitle, [class*="subtitle"]').all();
      for (const el of titleEls) {
        const text = (await el.innerText()).trim();
        if (text && !text.toLowerCase().includes('inmail') && !text.toLowerCase().includes('responses') && !text.toLowerCase().includes('save lead') && text.toLowerCase() !== 'save') {
          title = text;
          break;
        }
      }
      
      let profileUrl = '';
      const urlEl = card.locator('a[href*="/sales/lead/"], a[data-anonymize="person-name"]').first();
      if (await urlEl.count() > 0) {
        const relHref = await urlEl.getAttribute('href');
        if (relHref) {
          profileUrl = relHref.startsWith('http') ? relHref : `https://www.linkedin.com${relHref}`;
        }
      }
      
      let mutualConnections = [];
      const metaEls = await card.locator('[class*="metadata"], [class*="mutual"]').all();
      for (const el of metaEls) {
        const txt = await el.innerText();
        const cleaned = txt.replace(/\s+/g, ' ').trim();
        if (cleaned.toLowerCase().includes('mutual') || cleaned.toLowerCase().includes('shared') || cleaned.toLowerCase().includes('connection')) {
          mutualConnections.push(cleaned);
        }
      }
      
      scrapedProspects.push({
        name,
        title,
        company: companyDetails.companyName || mergedOptions.company,
        profileUrl,
        mutualConnections,
        relevanceScore: 0,
        tenure: 'Unknown',
        screenshot: ''
      });
      
      console.error(`Found key executive: ${name} (${title})`);
    }

    console.error(`Opening drawers for ${scrapedProspects.length} key executives to extract tenure...`);
    for (const prospect of scrapedProspects) {
      try {
        console.error(`Opening detail drawer for: ${prospect.name}...`);
        
        // Find click target in the page (name link or card)
        const nameLink = page.locator('[data-anonymize="person-name"]').filter({ hasText: prospect.name }).first();
        if (await nameLink.count() > 0) {
          await nameLink.click();
        } else {
          console.error(`Could not locate name link for ${prospect.name}`);
          continue;
        }
        
        await sleep(4000, 6000); // wait for drawer to slide open
        
        // Take profile screenshot
        const nameSanitized = prospect.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const compSanitized = prospect.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const screenshotName = `profile_${compSanitized}_${nameSanitized}.png`;
        const screenshotPath = path.join(mergedOptions.screenshotDir, screenshotName);
        
        await page.screenshot({ path: screenshotPath });
        console.error(`Saved profile screenshot to: ${screenshotPath}`);
        prospect.screenshot = screenshotName;
        
        // Find the drawer/peek panel (broadened search across dialog, complementary, drawer, and panel roles/classes)
        const drawer = page.locator('[role="dialog"], [role="complementary"], [class*="drawer"], [class*="peek-panel"], [class*="panel"], [class*="peek"], .artdeco-modal, .artdeco-modal-overlay').first();
        if (await drawer.count() > 0) {
          // Scroll both the main drawer wrapper and any scrollable internal containers to ensure lazy-loaded items render
          await drawer.evaluate((drawerEl) => {
            drawerEl.scrollTop = 500;
            if (drawerEl.scrollBy) drawerEl.scrollBy(0, 500);
            
            const scrollables = drawerEl.querySelectorAll('div, section, ul, article');
            scrollables.forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.overflowY === 'auto' || style.overflowY === 'scroll' || el.scrollHeight > el.clientHeight) {
                el.scrollTop = 500;
                if (el.scrollBy) el.scrollBy(0, 500);
              }
            });
          });
          await sleep(2000, 3500);
          
          // Extract tenure duration using robust client-side DOM parsing
          const tenure = await drawer.evaluate((drawerEl) => {
            const elements = Array.from(drawerEl.querySelectorAll('span, p, div, li, dd, dt, h4, h5'));
            
            // Regular expression to match tenure patterns:
            // e.g. "3 yrs 10 mos", "1 yr 2 mos", "4 years", "6 months", "2 yrs", etc.
            const tenureRegex = /\b(\d+\s*yrs?\s*\d+\s*mos?|\d+\s*years?\s*\d+\s*months?|\d+\s*yrs?|\d+\s*mos?|\d+\s*years?|\d+\s*months?)\b/i;
            
            // First try: look for leaf elements containing a middle dot (LinkedIn separators)
            for (const el of elements) {
              const text = el.textContent ? el.textContent.trim() : '';
              if (text.length > 0 && text.length < 150) {
                if (text.includes('·')) {
                  const parts = text.split('·');
                  for (const part of parts) {
                    const trimmed = part.trim();
                    if (tenureRegex.test(trimmed) && (trimmed.includes('yr') || trimmed.includes('mo') || trimmed.includes('year') || trimmed.includes('month'))) {
                      return trimmed;
                    }
                  }
                }
              }
            }
            
            // Second try: check elements that match duration regex directly
            for (const el of elements) {
              const text = el.textContent ? el.textContent.trim() : '';
              if (text.length > 0 && text.length < 100) {
                if (tenureRegex.test(text) && (text.includes('yr') || text.includes('mo') || text.includes('year') || text.includes('month')) && !text.includes(' - ')) {
                  return text;
                }
              }
            }
            
            // Third try: search innerText globally for duration patterns
            const innerText = drawerEl.innerText || '';
            const match = innerText.match(/\b\d+\s*yrs?\s*\d+\s*mos?\b/i) || 
                          innerText.match(/\b\d+\s*years?\s*\d+\s*months?\b/i) ||
                          innerText.match(/\b\d+\s*yrs?\b/i) ||
                          innerText.match(/\b\d+\s*years?\b/i);
            if (match) {
              return match[0].trim();
            }
            
            return null;
          });

          if (tenure) {
            prospect.tenure = tenure;
            console.error(`✔ Extracted tenure duration: ${tenure}`);
          } else {
            console.error(`⚠ Could not extract tenure duration for ${prospect.name}`);
          }
          
          // Close the drawer
          const closeBtn = drawer.locator('button[aria-label*="Dismiss"], button[aria-label*="Close"], [class*="close-btn"]').first();
          if (await closeBtn.count() > 0) {
            await closeBtn.click();
          } else {
            await page.keyboard.press('Escape');
          }
          await sleep(1500, 2500); // Wait for drawer close animation
        } else {
          console.error(`Could not find open drawer for ${prospect.name}`);
        }
      } catch (drawerErr) {
        console.error(`Error processing drawer for ${prospect.name}: ${drawerErr.message}`);
      }
    }

    prospects = scrapedProspects;

    const elapsedMs = Date.now() - startTime;
    const videoPath = page.video() ? await page.video().path() : null;

    if (videoPath && fs.existsSync(videoPath)) {
      const finalVideoPathWebm = path.join(mergedOptions.videoDir, `${mergedOptions.company.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_run.webm`);
      const finalVideoPathMp4 = path.join(mergedOptions.videoDir, `${mergedOptions.company.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_run.mp4`);
      
      fs.copyFileSync(videoPath, finalVideoPathWebm);
      console.error(`Saved WebM screen recording to: ${finalVideoPathWebm}`);
      
      try {
        console.error(`Converting WebM to MP4 using ffmpeg...`);
        execSync(`ffmpeg -y -i "${finalVideoPathWebm}" -c:v libx264 -pix_fmt yuv420p "${finalVideoPathMp4}"`, { stdio: 'ignore' });
        console.error(`Successfully converted and saved MP4 to: ${finalVideoPathMp4}`);
        if (fs.existsSync(finalVideoPathWebm)) {
          fs.unlinkSync(finalVideoPathWebm);
        }
      } catch (convError) {
        console.error(`⚠ FFmpeg conversion to MP4 failed: ${convError.message}`);
      }
    }

    return {
      success: true,
      company: mergedOptions.company,
      timestamp: new Date().toISOString(),
      source: 'LINKEDIN_SALES_NAVIGATOR',
      timeElapsedSeconds: Math.floor(elapsedMs / 1000),
      companyDetails,
      prospects: prospects
    };

  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  } finally {
    await browser.close();
  }
}

// Module exports
module.exports = {
  runScraper,
  getMockData
};

// Standalone CLI support
if (require.main === module) {
  const args = process.argv.slice(2);
  const cliOptions = {
    company: '',
    roles: [],
    limit: 3,
    dryRun: false,
    headless: true,
    authPath: path.join(__dirname, 'Tools/Scrapers/Playwright/auth.json')
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--company' && args[i + 1]) {
      cliOptions.company = args[i + 1];
      i++;
    } else if (args[i] === '--roles' && args[i + 1]) {
      cliOptions.roles = args[i + 1].split(',').map(r => r.trim());
      i++;
    } else if (args[i] === '--limit' && args[i + 1]) {
      cliOptions.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--dry-run') {
      cliOptions.dryRun = true;
    } else if (args[i] === '--headless') {
      cliOptions.headless = true;
    } else if (args[i] === '--headed') {
      cliOptions.headless = false;
    } else if (args[i] === '--auth' && args[i + 1]) {
      cliOptions.authPath = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.error('Usage: node sales_nav_adapter.js --company "Brand" --roles "Creative Director,CEO" [--limit 3] [--dry-run] [--headless|--headed] [--auth "/path/to/auth.json"]');
      process.exit(0);
    }
  }

  (async () => {
    const result = await runScraper(cliOptions);
    console.log(JSON.stringify(result, null, 2));
    if (!result.success) {
      process.exit(1);
    }
  })();
}
