# Agent_Operations

This is the working directory of the Emergentic agent team — the operational source-of-truth for the business-development and lead-generation work. It contains the agent role definitions, the operating rules and guidelines they follow, the scraping tools they built, and every artifact they produced: run logs, research reports, campaign drafts, and the lead-scoring system.

A curated, presentation-ready subset of this material lives in the sibling `Presentation/` folder. This folder is the unfiltered version, including raw data and intermediate files.

---

## Directory guide

```
Agent_Operations/
├── Agent_Profiles/        ← Who the agents are (role definitions)
├── Prompts/Guidelines/    ← The rules they operate under
├── Tools/Scrapers/        ← The code they built (LinkedIn + Instagram)
├── protocols/             ← Scraping methodology + Xsolla proof-of-concept
├── ranking_system/        ← Lead prioritization & scoring engine
├── Execution_Logs/        ← Everything they produced (reports, drafts, data, logs)
├── pipeline_documentation.md  ← End-to-end pipeline architecture
└── Diagnostics/           ← (empty — reserved for issue resolutions)
```

---

## Agent_Profiles/

Role-definition documents that seed each AI agent's identity and responsibilities. The team operates on a hub-and-spoke model: the Manager receives requests, delegates to the right specialist, and compiles the results.

**Active/**

| Agent | Role |
|---|---|
| **Manager** | Orchestration and alignment lead. Coordinates the team and delegates all technical work to specialists — never executes code itself. |
| **Sales-Navigator** | Lead sourcing, prioritization/scoring, and editorial cold-outreach copywriting. Splits funnels: LinkedIn for business outreach, Instagram for artist storytelling. |
| **Outreach-Automation-Engineer** | Builds and maintains the Node/Playwright scraper code, environment setup, and the lead-scoring framework. |
| **Media-Scout** | Instagram research: scraping, comment/caption extraction, screenshot archival, and aesthetic/competitor analysis. |
| **Business-Development-Coordinator** | Cross-agent scheduling, documentation synthesis, workspace cleanup, and progress notes. |

**Inactive/** — archived roles from earlier phases: **Code-Architect** (React/CSS/JS component builder) and **Codebase-Explorer** (read-only research and repo audits).

---

## Prompts/Guidelines/

The standing instructions every agent works from:

- **`team_directives.md`** — the engineering doctrine. Every tool must be a clean command-line utility that takes flags and emits structured JSON (so tools can be chained by an orchestrator); no hard-coded prompts or company lists inside code; human-in-the-loop steps (login, 2FA) isolated into helper scripts that produce a reusable session file. Also defines the folder structure and the Manager's delegation protocol.
- **`company_profile.md`** — the business brief the AI reads before drafting: Emergentic builds creative-automation systems, custom media pipelines, and software-driven content production. Ideal customers are content-heavy, engineering-light creative and lifestyle brands in Los Angeles — design agencies (Collins, Pentagram, Order), fashion DTC (Reformation, Cuyana, Vuori), film/video houses (Smuggler, PRETTYBIRD), and podcast networks (Wondery, Crooked Media).
- **`outreach_guidelines.md`** — copywriting rules for cold letters: quiet, editorial, low-hype tone (no jargon, no exclamation marks), under 150 words, role-tailored angles (Creative Directors → aesthetic consistency; CEOs/Founders → scaling bottlenecks; Heads of Production → pipeline reliability), and a six-part letter structure ending in a low-friction call to action.

---

## pipeline_documentation.md

The architecture document for the **Company-First Lead Scraper & Enrichment Pipeline** — the system packaged separately as the runnable `emergentic-cmo` tool. Five stages, with flow diagrams:

1. **Initialization** — load API keys and the company profile / outreach guidelines.
2. **Playwright scrape** — log into Sales Navigator with a saved session, resolve each target company, capture headcount-growth trends and the "Key People" buying committee, record screenshots and video.
3. **Apollo.io enrichment** — match scraped names + company domains to verified corporate emails.
4. **Gemini drafting** — score each prospect and generate a personalized outreach letter in the house tone.
5. **Export** — master CSV, per-lead Markdown drafts, and a packager that builds the standalone distributable zip.

---

## Tools/Scrapers/

The code the team built. Two suites:

**`Playwright/`** — the LinkedIn Sales Navigator automation (Node.js, with stealth plugins and human-emulation timing):
- `save-session.js` — one-time manual login capture; writes the reusable session to `auth.json` so credentials are never typed into the tool.
- `sales-nav-search.js` — session-based Sales Navigator search with human-like typing/scrolling and screenshot capture.
- `inspect-company.js` / `inspect-layout.js` — developer diagnostics that map a company or lead page's structure (used to discover and refresh page selectors).
- `utils.js` — shared human-emulation helpers (randomized delays, natural typing, smooth scrolling, hover-before-click).
- `record_scrape.js`, `debug_filters.js` — recording and debugging utilities.

**`Instagram_Scripts/`** — the Instagram research toolkit: a nested `Playwright/` folder with the scraping engines (`scrape-instagram.js`, `save-instagram-session.js`, comment/screenshot capture, raw-data dumpers) plus ~35 Python analysis scripts that parse the scraped data into reports (posting-frequency analysis, date extraction, payload deserialization, report generators).

> ⚠️ **Security:** `Tools/Scrapers/Playwright/` contains `auth.json` and `instagram-auth.json` — saved login sessions with live cookies. Anyone with these files can act as the logged-in account. Treat this folder as confidential; delete or blank these files before sharing it anywhere.

---

## protocols/

- **`sales_nav_scraping_protocol.md`** — the page-level scraping playbook: exactly which on-page fields are read (name, headline, location, experience, company, education), the click-and-wait sequence for opening profile detail panels, and the **contact-enrichment waterfall** — since LinkedIn hides emails and phone numbers, scraped name + company domain is matched against enrichment APIs (Apollo, Lusha, Hunter) for verified contact info.
- **`xsolla_precedent_study/`** — the proof-of-concept that validated the method, run against Xsolla: full company metrics (1,279 employees, +29% engineering headcount growth, revenue band, median tenure), the mapped C-suite, and 8 enriched leads — 6 with verified corporate emails. Includes both CSV data and narrative reports.

---

## ranking_system/

The **lead prioritization engine** — a weighted scoring formula for deciding who to contact first:

```
Total = (Mutual Contacts × 3.0) + (Role Seniority × 2.0) + (AI/Tech Alignment × 1.5) + (Content-Scale Need × 1.0)
```

Warm paths (mutual connections) weigh most, followed by decision-making authority, openness to AI/automation, and the urgency of the prospect's content-production bottleneck. Scores range 3.5–37.5.

Contents: the methodology report (`prioritization_report.md`, also as HTML, with flowcharts), and two worked examples — **Pawel Feldman**, CBDO of 11 bit studios (scored 31.0, High Priority, with a generated bio PDF via `generate_bio_pdf.py`) and the **11 bit studios** company evaluation (32.0, Top-Tier, with mapped pain points like multi-language trailer subtitling and vertical social reformatting, plus a tailored pitch).

---

## Execution_Logs/

Everything the agents produced, organized by work stream:

**Sales Navigator campaign**
- `Sales_Nav_Campaign_1/` — the flagship campaign run: `scraped_leads.csv`, `run_log.json`, 29 outreach drafts in `drafts/`, a pipeline walkthrough (Markdown + PDF), and screenshots/videos of the scrape. *Note: this was a demonstration (dry) run — some drafts use placeholder personas ("Sarah Connor", "Kyle Reese") and `[Your Name]` sign-offs. They show format and tone, not sent mail.*
- `Generated_Drafts/` — earlier draft letters (Ganni, PRETTYBIRD, SmartLess).
- `outreach_automation_audit.md` — code review of the scraper/orchestrator with a refactor plan (clean module exports, JSON-pure stdout for orchestrator chaining).
- `Sales_Navigator_Automation_Architecture.md` — the definitive technical guide: why browser automation, the session-capture pattern, a feature-expansion playbook, **rate-limit guidance (≤ 50–100 profile views/day)**, and an AI cost analysis (batch scoring ≈ cents per run vs. ~$3/run for a continuous vision-model loop).
- `Outreach_Dashboard.html` — interactive campaign dashboard (open in a browser).

**Instagram research**
- `instagram_insights_report.md` — competitor content analysis of @fuserstudio vs. @marshmallowlaserfeast: posting cadence, content pillars, media mix, engagement triggers, and strategy recommendations.
- `Instagram_Reports/` — monthly post breakdowns and `related_creative_studios.md`, a benchmark list of 10 studios (teamLab, Moment Factory, Refik Anadol, UVA, ManvsMachine, and others) with B2B-synergy notes.
- `Instagram_Data/`, `Instagram_Screenshots/`, `Instagram_Videos/` — the raw scraped JSON, post captures, and scrape recordings behind those reports.
- `media_scout_audit.md` — documents four additional media-pipeline command-line tools built to the team directives: video download (yt-dlp/ffmpeg), Whisper transcription with speaker separation, frame extraction, and ComfyUI video generation.

**Run logs**
- `Runs/` — the Manager's master logs: run summaries, weekly progress notes, implementation plans, and meeting-note summaries.
- `Agent_Runs/` — per-agent task briefs, implementation plans, and walkthroughs for the Media-Scout, Outreach-Automation-Engineer, and Sales-Navigator work streams.
- `presentation_brief.md` — a guided tour of this whole tree, written for stakeholders.

---

## How this relates to the rest of the delivery

- **`../Presentation/`** — the same key material, renumbered and curated for client viewing, plus screen recordings of live runs and a polished Xsolla HTML report.
- **`emergentic-cmo/`** (delivered separately) — the packaged, runnable version of the pipeline documented here, with double-click setup and its own README.
