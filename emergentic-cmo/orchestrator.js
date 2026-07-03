// Dynamic check and installation of packages
const requiredModules = ['@google/generative-ai', 'dotenv', 'playwright', 'playwright-extra', 'puppeteer-extra-plugin-stealth'];
let missing = [];
for (const pkg of requiredModules) {
  try {
    require.resolve(pkg);
  } catch (e) {
    missing.push(pkg);
  }
}
if (missing.length > 0) {
  console.error(`\n--- Auto Setup: Missing packages detected: ${missing.join(', ')} ---`);
  console.error('Installing dependencies dynamically...');
  const { execSync } = require('child_process');
  try {
    execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit', cwd: __dirname });
    console.error('✔ Dependencies installed successfully.\n');
  } catch (err) {
    console.error(`✘ Failed to install dependencies: ${err.message}`);
    process.exit(1);
  }
}

const fs = require('fs');
const path = require('path');
const https = require('https');
const { runScraper } = require('./sales_nav_adapter');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  companies: ['Pentagram', 'Order', 'Porto Rocha'], // Default search target
  roles: ['Event Director', 'Experiential Producer', 'Creative Director'],
  limit: 2,
  dryRun: true,
  headless: true,
  authPath: '',
  outDir: path.join(__dirname, 'Execution_Logs/Sales_Nav_Campaign_1'),
  profilePath: path.join(__dirname, 'Prompts/Guidelines/company_profile.md'),
  guidelinesPath: path.join(__dirname, 'Prompts/Guidelines/outreach_guidelines.md'),
  verbose: true
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--companies' && args[i + 1]) {
    options.companies = args[i + 1].split(',').map(c => c.trim());
    i++;
  } else if (args[i] === '--roles' && args[i + 1]) {
    options.roles = args[i + 1].split(',').map(r => r.trim());
    i++;
  } else if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--real' || args[i] === '--no-dry-run') {
    options.dryRun = false;
  } else if (args[i] === '--dry-run') {
    options.dryRun = true;
  } else if (args[i] === '--headless') {
    options.headless = true;
  } else if (args[i] === '--headed') {
    options.headless = false;
  } else if (args[i] === '--auth' && args[i + 1]) {
    options.authPath = args[i + 1];
    i++;
  } else if (args[i] === '--out-dir' && args[i + 1]) {
    options.outDir = args[i + 1];
    i++;
  } else if (args[i] === '--profile' && args[i + 1]) {
    options.profilePath = args[i + 1];
    i++;
  } else if (args[i] === '--guidelines' && args[i + 1]) {
    options.guidelinesPath = args[i + 1];
    i++;
  } else if (args[i] === '--verbose') {
    options.verbose = true;
  } else if (args[i] === '--silent') {
    options.verbose = false;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.error('Usage: node orchestrator.js [--companies "Xsolla,Ganni"] [--roles "CEO,Event Director"] [--limit 2] [--real] [--headed] [--auth "/path/to/auth.json"] [--out-dir "/path/to/campaign"] [--profile "/path/to/profile.md"] [--guidelines "/path/to/guidelines.md"] [--verbose] [--silent]');
    process.exit(0);
  }
}

function logProgress(msg) {
  if (options.verbose) {
    console.error(msg);
  }
}

// Stage 1: Load Context & Guidelines
function loadContext() {
  logProgress('--- Stage 1: Loading Context ---');
  if (!fs.existsSync(options.profilePath) || !fs.existsSync(options.guidelinesPath)) {
    throw new Error(`Required configuration files are missing:\n  - Profile: ${options.profilePath}\n  - Guidelines: ${options.guidelinesPath}`);
  }

  const profile = fs.readFileSync(options.profilePath, 'utf8');
  const guidelines = fs.readFileSync(options.guidelinesPath, 'utf8');

  logProgress('✔ Successfully loaded Company Profile and Outreach Guidelines.');
  return { profile, guidelines };
}

// Token and Cost tracking utilities
let totalInputTokens = 0;
let totalOutputTokens = 0;

function trackCost(inputTokens, outputTokens) {
  totalInputTokens += inputTokens;
  totalOutputTokens += outputTokens;
  
  // Gemini 1.5/2.5 Flash Pricing constraints: $1.50/1M input, $9.00/1M output
  const inputCost = (inputTokens / 1000000) * 1.50;
  const outputCost = (outputTokens / 1000000) * 9.00;
  const sessionCost = inputCost + outputCost;

  const logPath = path.join(options.outDir, 'token_cost_log.json');
  const cumulativeInputCost = (totalInputTokens / 1000000) * 1.50;
  const cumulativeOutputCost = (totalOutputTokens / 1000000) * 9.00;
  
  const logData = {
    model: 'gemini-1.5-flash',
    session: {
      inputTokens,
      outputTokens,
      costUSD: parseFloat(sessionCost.toFixed(6))
    },
    cumulative: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      costUSD: parseFloat((cumulativeInputCost + cumulativeOutputCost).toFixed(6))
    },
    timestamp: new Date().toISOString()
  };

  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir, { recursive: true });
  }

  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
  logProgress(`✔ API cost logged: $${sessionCost.toFixed(6)} (Cumulative Session Cost: $${logData.cumulative.costUSD.toFixed(6)})`);
}

// Stage 2: Scan Contacts via Sales Navigator Adapter
async function scanContacts(company, dryRun) {
  logProgress(`\n--- Stage 2: Scanning Contacts for "${company}" (Sales Navigator) ---`);
  
  const scraperOptions = {
    company,
    roles: options.roles,
    limit: options.limit,
    dryRun,
    headless: options.headless,
    videoDir: path.join(options.outDir, 'videos'),
    screenshotDir: path.join(options.outDir, 'screenshots')
  };
  if (options.authPath) {
    scraperOptions.authPath = options.authPath;
  }

  const data = await runScraper(scraperOptions);
  return data;
}

// Apollo Match API Enrichment (Corporate Email only)
async function enrichWithApollo(prospects, companySite) {
  // If dry run, fill with simulated mock emails
  if (options.dryRun) {
    for (const p of prospects) {
      if (!p.email || p.email === 'Unknown' || p.email.includes('@company.com')) {
        const namePart = p.name.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const domainPart = companySite ? companySite.replace(/https?:\/\/(?:www\.)?/, '').split('/')[0] : 'company.com';
        p.email = `${namePart}@${domainPart}`;
      }
    }
    return prospects;
  }

  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    logProgress('⚠ APOLLO_API_KEY not found in process.env. Skipping email enrichment.');
    for (const p of prospects) {
      p.email = 'Missing API Key';
    }
    return prospects;
  }

  logProgress(`\n--- Enriching ${prospects.length} prospects with Apollo.io MATCH API ---`);

  for (const prospect of prospects) {
    try {
      logProgress(`Querying Apollo.io for: ${prospect.name} (${prospect.title}) at ${prospect.company}`);
      const nameParts = prospect.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const payload = JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        organization_name: prospect.company,
        domain: companySite ? companySite.replace(/https?:\/\/(?:www\.)?/, '').split('/')[0] : undefined,
        title: prospect.title,
        reveal_personal_emails: true
      });

      const requestOptions = {
        hostname: 'api.apollo.io',
        port: 443,
        path: '/v1/people/match',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': apiKey,
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const resultText = await new Promise((resolve, reject) => {
        const req = https.request(requestOptions, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`Apollo API returned HTTP status ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (e) => {
          reject(e);
        });

        req.write(payload);
        req.end();
      });

      const result = JSON.parse(resultText);
      if (result && result.person && result.person.email) {
        prospect.email = result.person.email;
        logProgress(`✔ Email found: ${prospect.email}`);
        if (!companySite && result.person.organization && result.person.organization.primary_domain) {
          prospect.companySite = result.person.organization.primary_domain;
        }
      } else {
        logProgress(`⚠ No email found for ${prospect.name}`);
        prospect.email = 'Not Found';
      }

    } catch (err) {
      logProgress(`✘ Apollo match failed for ${prospect.name}: ${err.message}`);
      prospect.email = 'Enrichment Failed';
    }
  }

  return prospects;
}

// Stage 3: Batch LLM Processing to assess potential collaboration on AI conferences
async function evaluateProspectsBatch(profile, guidelines, prospects) {
  if (prospects.length === 0) return [];
  
  logProgress(`\n--- Stage 3: Batch Evaluating ${prospects.length} Prospects using Gemini API ---`);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logProgress('⚠ GEMINI_API_KEY not found in process.env. Simulating Gemini batch evaluation...');
    return prospects.map(p => {
      const mutuals = p.mutualConnections.join(' and ') || 'mutual industry contacts';
      const growthInfo = p.companyDetails?.departmentGrowth 
        ? Object.entries(p.companyDetails.departmentGrowth).map(([d, g]) => `${d} grew ${g}`).join(', ')
        : 'stable employee growth';
      return {
        ...p,
        relevanceScore: Math.floor(Math.random() * 20) + 75,
        collaborationNotes: `High affinity for virtual events simulation. Growth in ${growthInfo} matches creative automation tools. Tenure is ${p.tenure || 'Unknown'}.`,
        draftText: `Subject: Event simulation preparation for ${p.company}\n\nHi ${p.name.split(' ')[0]},\n\nI noticed we are both connected to ${mutuals} on LinkedIn. \n\nWe recently ran an AI Social Experiment for AI on the Lot 2026, simulating the entire conference in advance so attendees could pre-schedule introductions with their "sims". I saw you run events at ${p.company} (specifically noticing your team's growth trends) and wanted to see if your team has explored AI-driven networking pipelines.\n\nBest,\n[Your Name]`
      };
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const prompt = `
You are the Outreach strategy lead for Emergentic.
Our Company Profile:
${profile}

Our Outreach Guidelines:
${guidelines}

We want to pitch our "AI Event Simulation / AI Social Experiment" platform to event organizers, brands, and agencies (based on what we did for "AI on the Lot 2026"). The service allows attendees to submit their profile and pre-simulate the entire conference networking experience using AI agents.

Evaluate the following B2B prospects. For each prospect:
1. Provide a relevanceScore (0 to 100) based on their title and potential fit for organizing or sponsoring AI event simulations.
2. Write "collaborationNotes" detailing how they could collaborate on AI event simulation or creative automation pipelines. Incorporate the company's department headcount growth and industry details (e.g. if engineering or marketing is growing fast, reference that context).
3. Write a "customOutreachLetter" adhering strictly to the Outreach Guidelines: Quiet, editorial, low-hype tone, under 150 words. Mention event simulation and networking prep specifically. Tailor the pitch using the company's headcount growth and details.

Prospects List:
${JSON.stringify(prospects.map(p => ({
  name: p.name,
  title: p.title,
  company: p.company,
  mutualConnections: p.mutualConnections,
  tenure: p.tenure,
  email: p.email,
  companyDetails: p.companyDetails
})), null, 2)}

Return a JSON object matching this schema exactly:
{
  "assessments": [
    {
      "name": "Prospect Name",
      "relevanceScore": 85,
      "collaborationNotes": "Explain how their role/company matches the event simulation service and reference growth trends...",
      "customOutreachLetter": "Subject: ...\\n\\nHi [Name],\\n..."
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (response.usageMetadata) {
      trackCost(response.usageMetadata.promptTokenCount, response.usageMetadata.candidatesTokenCount);
    } else {
      trackCost(Math.floor(prompt.length / 4), Math.floor(text.length / 4));
    }

    const data = JSON.parse(text);
    
    return prospects.map(p => {
      const assessment = data.assessments.find(a => a.name === p.name) || {};
      return {
        ...p,
        relevanceScore: assessment.relevanceScore || 70,
        collaborationNotes: assessment.collaborationNotes || 'No notes generated.',
        draftText: assessment.customOutreachLetter || 'No letter generated.'
      };
    });

  } catch (err) {
    logProgress(`✘ LLM Batch call failed: ${err.message}. Bypassing with simulated assessments.`);
    return prospects.map(p => ({
      ...p,
      relevanceScore: 75,
      collaborationNotes: `Encountered error during API call: ${err.message}. Manual review required.`,
      draftText: `Subject: Event simulation prep for ${p.company}\n\nHi ${p.name.split(' ')[0]},\n\nI noticed we are both connected to industry leads on LinkedIn...\n\nBest,\n[Your Name]`
    }));
  }
}

// Stage 4: Export Prospects to Excel CSV
function exportToCSV(prospects) {
  logProgress('\n--- Stage 4: Exporting Prospects to Excel CSV ---');
  const csvPath = path.join(options.outDir, 'scraped_leads.csv');

  const headers = [
    'Name',
    'Title',
    'Company',
    'Email',
    'Time in Position',
    'Company Site',
    'Profile URL',
    'Mutual Connections',
    'Relevance Score',
    'AI Collaboration Notes',
    'Draft Letter'
  ];

  const escapeCSV = (str) => {
    if (!str) return '""';
    return `"${str.toString().replace(/"/g, '""')}"`;
  };

  const rows = prospects.map(p => [
    escapeCSV(p.name),
    escapeCSV(p.title),
    escapeCSV(p.company),
    escapeCSV(p.email || 'N/A'),
    escapeCSV(p.tenure || 'Unknown'),
    escapeCSV(p.companyDetails?.website || p.companySite || 'N/A'),
    escapeCSV(p.profileUrl),
    escapeCSV(p.mutualConnections.join('; ')),
    p.relevanceScore,
    escapeCSV(p.collaborationNotes),
    escapeCSV(p.draftText)
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir, { recursive: true });
  }
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  logProgress(`✔ Excel CSV spreadsheet generated at: ${csvPath}`);
}

// Stage 5: Save Individual Markdown Drafts
function saveIndividualDrafts(prospects) {
  logProgress('\n--- Stage 5: Saving Individual Markdown Drafts ---');
  const draftsDir = path.join(options.outDir, 'drafts');
  if (!fs.existsSync(draftsDir)) {
    fs.mkdirSync(draftsDir, { recursive: true });
  }

  for (const p of prospects) {
    const sanitizedCompany = p.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedName = p.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const draftFileName = `${sanitizedCompany}_${sanitizedName}.md`;
    const draftFilePath = path.join(draftsDir, draftFileName);

    const fileContent = `
# OUTREACH DRAFT DETAILS
- **Target Recipient:** ${p.name} (${p.title})
- **Email:** ${p.email || 'N/A'}
- **Time in Position (Tenure):** ${p.tenure || 'Unknown'}
- **Company:** ${p.company}
- **Company Site:** ${p.companyDetails?.website || p.companySite || 'N/A'}
- **Profile URL:** ${p.profileUrl}
- **Mutual Connections:** ${p.mutualConnections.join(', ') || 'None'}
- **AI Relevance Score:** ${p.relevanceScore}/100

## COMPANY GROWTH METRICS:
${p.companyDetails?.departmentGrowth ? Object.entries(p.companyDetails.departmentGrowth).map(([dept, growth]) => `- **${dept}:** ${growth}`).join('\n') : 'No growth metrics available.'}

## COLLABORATION NOTES:
${p.collaborationNotes}

---

## GENERATED COLD LETTER:
\`\`\`text
${p.draftText}
\`\`\`
    `.trim();

    fs.writeFileSync(draftFilePath, fileContent, 'utf8');
  }
  logProgress(`✔ Saved ${prospects.length} individual drafts under: ${draftsDir}/`);
}

function promptForKey() {
  if (!process.stdin.isTTY) {
    return Promise.resolve('');
  }
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question('\n[Setup] GEMINI_API_KEY is not set. Please paste your API key (or press enter to skip): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function promptForApolloKey() {
  if (!process.stdin.isTTY) {
    return Promise.resolve('');
  }
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question('\n[Setup] APOLLO_API_KEY is not set. Please paste your Apollo API key (or press enter to skip/simulate): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Main Execution
(async () => {
  logProgress('==============================================');
  logProgress('   CLIENT SEARCH HERMES - PIPELINE RUNNER     ');
  logProgress('==============================================\n');

  // If running a real run and keys are missing, prompt user
  if (!process.env.GEMINI_API_KEY && !options.dryRun) {
    const key = await promptForKey();
    if (key) {
      process.env.GEMINI_API_KEY = key;
      const envPath = path.join(__dirname, '.env');
      fs.writeFileSync(envPath, `\nGEMINI_API_KEY=${key}\n`, { flag: 'a', encoding: 'utf8' });
      logProgress(`✔ Gemini API key saved to: ${envPath}`);
    } else {
      logProgress('⚠ No key provided. Bypassing with simulated assessments.');
    }
  }

  if (!process.env.APOLLO_API_KEY && !options.dryRun) {
    const key = await promptForApolloKey();
    if (key) {
      process.env.APOLLO_API_KEY = key;
      const envPath = path.join(__dirname, '.env');
      fs.writeFileSync(envPath, `\nAPOLLO_API_KEY=${key}\n`, { flag: 'a', encoding: 'utf8' });
      logProgress(`✔ Apollo API key saved to: ${envPath}`);
    } else {
      logProgress('⚠ No Apollo key provided. Skipping real enrichment.');
    }
  }

  const startTime = Date.now();
  let totalProspectsCount = 0;
  let allProspects = [];

  try {
    const { profile, guidelines } = loadContext();
    
    const runResult = {
      success: true,
      timestamp: new Date().toISOString(),
      dryRun: options.dryRun,
      companiesProcessed: [],
      errors: []
    };

    for (const companyName of options.companies) {
      const scanRes = await scanContacts(companyName, options.dryRun);
      
      if (!scanRes.success) {
        runResult.errors.push({ company: companyName, error: scanRes.error });
        continue;
      }

      const prospects = scanRes.prospects;
      const companyDetails = scanRes.companyDetails || {};

      // Enrich with Apollo API using the company website domain
      await enrichWithApollo(prospects, companyDetails.website);

      // Attach company details to each prospect so the LLM gets context
      for (const p of prospects) {
        p.companyDetails = companyDetails;
      }

      totalProspectsCount += prospects.length;
      allProspects.push(...prospects);

      runResult.companiesProcessed.push({
        company: companyName,
        prospectsScraped: prospects.length,
        timeElapsedSeconds: scanRes.timeElapsedSeconds || 0
      });
    }

    // Step 3: Run AI batch processing on all collected prospects
    const evaluatedProspects = await evaluateProspectsBatch(profile, guidelines, allProspects);

    // Step 4: Export results to CSV
    exportToCSV(evaluatedProspects);

    // Step 5: Save individual drafts
    saveIndividualDrafts(evaluatedProspects);

    // Write campaign run log
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const runLogPath = path.join(options.outDir, 'run_log.json');
    const runLogData = {
      success: true,
      timestamp: new Date().toISOString(),
      dryRun: options.dryRun,
      totalTimeElapsedSeconds: elapsedSeconds,
      totalProspectsCollected: totalProspectsCount,
      companies: options.companies,
      errors: runResult.errors
    };
    fs.writeFileSync(runLogPath, JSON.stringify(runLogData, null, 2), 'utf8');

    logProgress('\n==============================================');
    logProgress('   PIPELINE COMPLETED SUCCESSFULLY            ');
    logProgress('==============================================');

    console.log(JSON.stringify(runLogData, null, 2));

  } catch (error) {
    logProgress(`\n✘ Pipeline run aborted due to error: ${error.message}`);
    
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const runLogPath = path.join(options.outDir, 'run_log.json');
    fs.writeFileSync(runLogPath, JSON.stringify({
      success: false,
      error: error.message,
      totalTimeElapsedSeconds: elapsedSeconds,
      timestamp: new Date().toISOString()
    }, null, 2), 'utf8');

    process.exit(1);
  }
})();
