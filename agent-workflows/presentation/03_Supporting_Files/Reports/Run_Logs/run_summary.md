# Run 1: Execution & Organization Summary

This folder coordinates and archives the automation scripts, scraped datasets, and output reports for **Run 1**. The execution environment has been structured into clean, isolated modules based on project workflows.

---

## Run 1 Agent Team

To coordinate the multiple workflows in Run 1, a team of specialized agents was deployed under a new profile convention:

* **Manager:** Orchestrates run objectives, summaries, checklists, and alignment.
* **Media-Scout:** Scrapes Instagram posts/comments and logs audience engagement metrics (formerly Instagram Scraper).
* **Sales-Navigator:** Conducts active lead generation, prioritizes prospects, and drafts copywriting campaigns.
* **Outreach-Automation-Engineer:** Sets up browser environments, fixes paths, and runs automated scrapers (formerly Lead-Navigator-1).
* **Business-Development-Coordinator:** Integrates outreach summaries, relocates files, and writes progress notes (formerly Lead-Navigator-2).
* **Code-Architect:** Writes and organizes clean React components, CSS, and modular JS databases (formerly Coder).
* **Codebase-Explorer:** Conducts read-only repository audits, log parsing, and documentation sweeps (formerly Researcher).

Detailed profiles for each active agent can be referenced in [Active](file://Run/Run%201/Agent_Profile/Active) and inactive profiles in [Inactive](file://Run/Run%201/Agent_Profile/Inactive).

---

## Folder Organization

We have restructured the root of `Run 1` into two primary directories, separating the LinkedIn outreach framework from the Instagram media/comment scanner:

### 1. [LinkedIn_Outreach](file://Run/Run%201/LinkedIn_Outreach)
This subfolder contains the new **Hermes Client Discovery & Outreach Pipeline** for finding enterprise leads on LinkedIn Sales Navigator.
* **`src/`**: Core scripts including `orchestrator.js` (manages the pipeline stages) and `sales_nav_adapter.js` (custom Playwright scraper script).
* **`config/`**: Configuration templates containing `company_profile.md` (details Emergentic's offerings) and `outreach_guidelines.md` (guidelines for writing cold outreach).
* **`drafts/`**: Destination folder where generated cold letters are saved.
* **`Playwright/`**: Standalone Playwright package containing visual session-capturing (`save-session.js`), navigation searches (`sales-nav-search.js`), and stealth human-like interaction utilities (`utils.js`).

### 2. [Instagram_Scraper](file://Run/Run%201/Instagram_Scraper)
This subfolder archives the previous runs that analyzed Instagram media, posts, and comments for target organizations.
* **`Scripts/`**: Python post-analysis scripts (e.g., `analyze_exact_past_month_media.py`, `generate_final_report.py`) and sub-folder `Playwright/` with JS scraper engines.
* **`Data/`**: Captured JSON datasets containing scraped details, comments, and media codes (e.g., `scraped_details_marshmallowlaserfeast.json`).
* **`Reports/`**: Markdown write-ups summarizing activity reports (e.g., `marshmallow_posts_month.md`).
* **`Screenshots/`**: Scraped post images archived directly from the target feeds.

---

## Agent Takeaways & Operational Notes

### A. Sandbox & Dependency Health
* Run `npm install` and `npx playwright install chromium` inside the [Playwright](file://Run/Run%201/LinkedIn_Outreach/Playwright) folder to make sure the environment is fully provisioned.
* Relative paths inside `LinkedIn_Outreach/src/sales_nav_adapter.js` have been updated to target `../Playwright/` to accommodate the subfolder migration.

### B. Stealth Execution Strategy
* Both Instagram and LinkedIn Sales Navigator scrapers employ `puppeteer-extra-plugin-stealth` combined with Playwright browser parameters (`--disable-blink-features=AutomationControlled`).
* Headed mode (`headless: false`) is intentionally utilized. This allows the user to visually inspect the automated browser steps and manually complete LinkedIn 2FA checkpoints.
