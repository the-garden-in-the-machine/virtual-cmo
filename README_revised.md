# Emergentic — Lead Generation Pipeline & Agent Workflows

**Delivery package overview and user guide**

This delivery consists of two folders that work together:

| Folder | What it is |
|---|---|
| **`emergentic-cmo/`** | The **runnable tool** — a self-contained LinkedIn Sales Navigator scraping + outreach-drafting pipeline you can set up and run on your own machine. |
| **`agent-workflows/`** | The **documentation & evidence package** — the multi-agent system that built the pipeline, its architecture docs, the lead-scoring methodology, and all generated outputs (reports, drafts, screenshots, screen recordings). |

**If you just want to see what was built:** open `agent-workflows/Presentation/` and browse folders `01` → `02` → `03`.
**If you want to run a campaign yourself:** follow the instructions for `emergentic-cmo/` below.

---

## Part 1 — `emergentic-cmo/` (the runnable pipeline)

### What it does

An end-to-end B2B prospecting pipeline that runs locally on your machine:

1. **Scrapes LinkedIn Sales Navigator** for each target company — headcount and department growth trends, industry, location, website, and the "Key People" buying committee (name, title, tenure, mutual connections).
2. **Enriches leads with verified emails** via the Apollo.io API (LinkedIn hides contact info, so name + company domain is matched against Apollo's database).
3. **Scores and drafts outreach with AI** — Google Gemini evaluates each prospect against your company profile and writes a personalized cold letter following the outreach guidelines (quiet, editorial tone, under 150 words).
4. **Exports everything** — a master spreadsheet, one Markdown draft letter per lead, plus screenshots and a video recording of the scrape.

### Folder contents

```
emergentic-cmo/
├── setup.sh / setup.bat            ← Step 1: install dependencies (double-click)
├── save_session.sh / save_session.bat  ← Step 2: log in to LinkedIn once (double-click)
├── run_campaign.sh / run_campaign.bat  ← Step 3: run the campaign (double-click)
├── orchestrator.js                 ← Main campaign runner (scrape → enrich → draft → export)
├── sales_nav_adapter.js            ← The browser-automation scraper itself
├── package.json                    ← Node.js dependencies
├── Prompts/Guidelines/
│   ├── company_profile.md          ← Who Emergentic is; the AI reads this before drafting
│   └── outreach_guidelines.md      ← Tone & structure rules for the cold letters
├── Tools/Scrapers/Playwright/
│   ├── save-session.js             ← Captures your LinkedIn login session
│   ├── auth.json                   ← Your saved session (empty until you run step 2 — see Security)
│   ├── inspect-layout.js           ← Developer diagnostic: maps a lead page's structure
│   ├── inspect-company.js          ← Developer diagnostic: maps a company page's structure
│   └── utils.js                    ← Human-like typing/scrolling/clicking helpers (anti-bot-detection)
└── Run 1/
    ├── sales_nav_scraping_protocol.md  ← The engineering playbook the scraper implements
    └── xsolla_precedent_study/         ← Worked example: a full run against Xsolla
        (company metrics CSV, 8 enriched C-suite leads with verified emails, reports)
```

### Prerequisites

- **Node.js v18 or newer** — download from [nodejs.org](https://nodejs.org) if you don't have it.
- **A LinkedIn account with Sales Navigator access.**
- **Two API keys (optional but recommended):**
  - `GEMINI_API_KEY` — free from [Google AI Studio](https://aistudio.google.com/apikey); powers the prospect scoring and letter drafting. **Without it, letters are simulated placeholders, not real AI output.**
  - `APOLLO_API_KEY` — from [Apollo.io](https://apollo.io) (free tier includes generous monthly credits); powers email enrichment. Without it, emails are left blank.
  - The tool prompts you for both keys on first real run and saves them to a local `.env` file so you only enter them once.
- **`ffmpeg`** (optional) — only needed to convert run recordings from WebM to MP4; the tool works fine without it.

> ⚠️ **Do not run from a cloud-synced folder** (Google Drive, OneDrive, Dropbox, iCloud). Sync locking causes setup to fail with `EPERM`/`EBADF` errors. Move the folder to a plain local location first, e.g. your local Desktop or Documents.

### How to use it (3 steps)

**Step 1 — Setup (once).** Double-click `setup.bat` (Windows) or run `./setup.sh` in Terminal (Mac). This installs the Node packages and the Chromium browser engine.

**Step 2 — Save your LinkedIn session (once, and again whenever it expires).** Double-click `save_session.bat` / run `./save_session.sh`. A browser window opens at LinkedIn's login page:
1. Log in manually, completing any 2FA verification.
2. Once you're on your feed or Sales Navigator, return to the terminal window and press **ENTER**.
3. Your session is saved locally to `Tools/Scrapers/Playwright/auth.json` — the scraper reuses it so you never type your password into the tool.

**Step 3 — Run a campaign.** Double-click `run_campaign.bat` / run `./run_campaign.sh`. This launches a **visible** browser (so you can watch it work) and processes up to 8 leads across the default target companies. On first run it will ask for your Gemini and Apollo keys.

### Running with your own targets (Terminal)

The double-click launcher uses built-in defaults (companies: Pentagram, Order, Porto Rocha; roles: Event Director, Experiential Producer, Creative Director). To target different companies or roles, run the orchestrator directly:

```bash
cd /path/to/emergentic-cmo

# Safe test first — uses mock data, touches nothing real:
node orchestrator.js --limit 2 --dry-run

# Real run with custom targets:
node orchestrator.js --companies "Xsolla,Reformation" --roles "CEO,Creative Director" --limit 8 --real --headed
```

Useful flags: `--companies "A,B"` · `--roles "X,Y"` · `--limit N` (leads per run) · `--dry-run` / `--real` · `--headed` (visible browser) / `--headless` · `--help` for the full list.

**Recommended habit:** always do a `--dry-run` first to confirm everything is wired up, then run `--real --headed` and keep an eye on the browser.

### Where the results go

Everything lands in `Execution_Logs/Sales_Nav_Campaign_1/` (created automatically on first run):

- **`scraped_leads.csv`** — the master spreadsheet: Name, Title, Company, Email, Time in Position, Profile URL, Mutual Connections, AI Relevance Score, notes, and the draft letter.
- **`drafts/<company>_<name>.md`** — one ready-to-review outreach letter per lead. **Always review and personalize before sending** — these are drafts, not auto-sent messages (the pipeline never sends anything on your behalf).
- **`screenshots/`** and **`videos/`** — visual record of each scrape.
- **`run_log.json`** and **`token_cost_log.json`** — run details and approximate AI cost tracking (a typical batch run costs on the order of cents).

### Customizing the pitch

- Edit **`Prompts/Guidelines/company_profile.md`** to change how the AI describes your business and who your ideal customers are.
- Edit **`Prompts/Guidelines/outreach_guidelines.md`** to change the tone, structure, and rules of the letters.
- Both files are read fresh at the start of every run — no code changes needed. (The core drafting prompt itself lives in `orchestrator.js` if deeper changes are ever needed.)

### Security notes — please read

- **`Tools/Scrapers/Playwright/auth.json` becomes your live LinkedIn credential** after Step 2. Anyone with that file can act as you on LinkedIn. Never email it, commit it to git, or put it in shared/synced folders. (It ships empty; it's already covered by `.gitignore`.) Delete it to "log out" the tool.
- **`.env`** holds your API keys in plain text, in the project folder. Same rules apply.
- **LinkedIn rate limits:** automated scraping is against LinkedIn's terms of service and aggressive use risks account restriction. Stay conservative — the architecture docs recommend **≤ 50–100 profile views per day** and running in headed mode so a human is watching. The built-in human-emulation delays help, but volume discipline is your main protection.
- If a run fails with *"LinkedIn session expired"*, just repeat Step 2 to capture a fresh session.

---

## Part 2 — `agent-workflows/` (documentation & evidence)

This folder documents the **multi-agent system** used to build and operate the pipeline, plus everything it produced. It is mostly documentation, agent instructions, and generated outputs — the runnable product is `emergentic-cmo/`.

It has two top-level directories containing largely the same material, organized two ways:

- **`Presentation/`** — curated and numbered for reading. **Start here.**
- **`Agent_Operations/`** — the working source-of-truth tree the agents actually operated in, including raw run logs and intermediate data.

### `Presentation/01_Sales_Navigator/` — the lead-gen system, end to end

- **`pipeline_documentation.md`** — the full 5-stage pipeline flow (setup → scrape → Apollo enrichment → Gemini drafting → export), with diagrams.
- **`Sales_Navigator_Automation_Architecture.md`** — the definitive technical guide: why browser automation (LinkedIn has no official API for this), how the stealth/session approach works, rate-limit guidance, a feature-expansion playbook, and a cost analysis of AI usage patterns.
- **`sales_nav_scraping_protocol.md`** — the page-level playbook: exactly which on-page elements are read and in what order, plus the "enrichment waterfall" (scrape name + company → resolve domain → match against Apollo/Lusha/Hunter for verified emails).
- **`Ranking_System/`** — the **lead prioritization engine**. Each lead is scored: `Total = (Mutual Contacts × 3.0) + (Role Seniority × 2.0) + (AI/Tech Alignment × 1.5) + (Content-Scale Need × 1.0)`. Includes the methodology report, flowcharts, and two worked examples: **Pawel Feldman** (CBDO, 11 bit studios — scored 31.0, High Priority, with a generated bio PDF) and the **11 bit studios** company evaluation (32.0, Top-Tier, with mapped pain points and a tailored pitch).
- **`Xsolla_Precedent_Study/`** — the proof-of-concept run: full company metrics for Xsolla (1,279 employees, +29% engineering growth) and 8 C-suite leads, 6 with verified corporate emails. Also see the polished **`Xsolla Sales Navigator Report-2.html`** — open it in a browser.
- **`Campaign_1_Drafts/`** — 29 example outreach letters from Campaign 1, plus `pipeline_walkthrough.md`. *Note: this campaign was a demonstration (dry) run — some drafts use placeholder personas ("Sarah Connor", "Kyle Reese") and `[Your Name]` sign-offs. They show the format and tone, not final sent mail.*
- **`Guidelines/`** — the same company profile and outreach rules the runnable tool uses.

### `Presentation/02_Agent_Structure/` — the agent team

The pipeline was built and operated by a team of five specialized AI agents, each defined by a profile document:

| Agent | Role |
|---|---|
| **Manager** | Orchestrates everything; delegates tasks to specialists and compiles results. The only agent allowed to write to the shared visual workspace. |
| **Sales-Navigator** | Lead sourcing, prioritization/scoring, and the editorial outreach copywriting. |
| **Outreach-Automation-Engineer** | Built and maintains the Node/Playwright scraper code. |
| **Media-Scout** | Instagram research — scraping, screenshots, competitor content analysis. |
| **Business-Development-Coordinator** | Cross-agent scheduling, documentation, and workspace upkeep. |

Two archived profiles (Code-Architect, Codebase-Explorer) sit in `Inactive/`. Supporting docs:

- **`team_directives.md`** — the operating rules: every tool must be a clean command-line utility that outputs structured JSON (so the agent framework, "Hermes," can chain them), no hard-coded targets in code, and human-in-the-loop steps (login/2FA) isolated into helper scripts.
- **`AGENT_GUIDE_thegardeninthemachine.md`** — the manual for the shared **Loci canvas** (a Google-Drive-backed visual whiteboard the team uses as its collective workspace), including data-safety rules.
- **`Agent_Runs/`** — per-agent task briefs, implementation plans, and walkthroughs for three major work streams.

### `Presentation/03_Supporting_Files/` — the evidence

- **`Recordings/`** — 8 screen recordings (.mp4) of live scraper runs against Collins, Google, PRETTYBIRD, Reformation, Wondery, Xsolla, plus two Instagram scraping sessions. Watch these to see the tools in action.
- **`Reports/`** — including **`instagram_insights_report.md`**, a competitor content analysis of @fuserstudio vs. @marshmallowlaserfeast (posting cadence, content pillars, engagement triggers, strategy recommendations), the **`media_scout_audit.md`** (documents four additional media-pipeline command-line tools: video download, Whisper transcription, frame extraction, ComfyUI video generation), **`presentation_brief.md`** (a guided tour of the whole package), and two interactive HTML dashboards (`Outreach_Dashboard.html`, `Instagram_Scrape_Presentation.html` — open in a browser).
- **`Screenshots/`** — Instagram posts and Sales Navigator captures from the runs.

### `Agent_Operations/` — the working tree

Same guides, profiles, protocols, and ranking system as above, plus the raw material: `Execution_Logs/` (run logs, raw Instagram JSON data, generated drafts, campaign artifacts) and `Tools/Scrapers/` (the scraper source files, including ~35 Python scripts used for Instagram data analysis). Useful when you want the unfiltered detail behind anything in `Presentation/`.

> ⚠️ **Security:** `Agent_Operations/Tools/Scrapers/Playwright/` contains **`auth.json` and `instagram-auth.json` with live session cookies** from the development runs. Treat this folder as confidential — don't publish or share it without removing those files.

---

## How the two folders relate

`agent-workflows/` is the **workshop** — the agent team, its methods, research, and everything produced along the way. `emergentic-cmo/` is the **product** that came out of it: the pipeline packaged so it can be handed over, set up in three double-clicks, and run on new target companies. To go deeper on *how* anything in the product works, the corresponding documentation lives in `agent-workflows/Presentation/01_Sales_Navigator/`.

## Quick reference

| I want to… | Do this |
|---|---|
| See the results and reports | Browse `agent-workflows/Presentation/`, open the HTML reports/dashboards in a browser |
| Watch the tools working | Play the videos in `Presentation/03_Supporting_Files/Recordings/` |
| Understand the lead scoring | Read `Presentation/01_Sales_Navigator/Ranking_System/prioritization_report.md` |
| Run a campaign myself | `emergentic-cmo/` → setup → save session → run campaign (Part 1 above) |
| Change who the letters target / how they sound | Edit the two files in `emergentic-cmo/Prompts/Guidelines/` |
| Get real AI-written letters and verified emails | Add your `GEMINI_API_KEY` and `APOLLO_API_KEY` when prompted |
