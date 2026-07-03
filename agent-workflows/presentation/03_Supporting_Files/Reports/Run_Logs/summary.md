# Run 1 - Business Development Pipeline Setup

* **Executed By:** Outreach-Automation-Engineer (LinkedIn Sales Navigator Automation & Scraper Developer)
* **Date:** June 9, 2026
* **Status:** Initial Scaffolding & Dry-Run Verification Completed Successfully

---

## Objective
To establish a modular, automated client acquisition pipeline that reads context about Emergentic, resolves target companies in the LA area, scans for relevant prospects and mutual connections on LinkedIn Sales Navigator, and drafts highly personalized outreach letters matching our editorial style guide.

---

## Files Created & Organized

The following files have been initialized and verified inside this directory:

### 1. Configuration & Rules
* **`config/company_profile.md`**: Context documentation detailing Emergentic's services (AppleScript/ExtendScript, Playwright scrapers, agent integrations) and Ideal Customer Profiles (ICPs).
* **`config/outreach_guidelines.md`**: Writing constraints enforcing a quiet, editorial, low-hype tone with personalized call-to-actions.

### 2. Code & Adapters
* **`src/sales_nav_adapter.js`**: A modular, command-line wrapper around the sibling Playwright automation suite. It includes a `--dry-run` flag to output mock contacts and mutual connections safely.
* **`src/orchestrator.js`**: The pipeline runner coordinating stage execution, prompt payload assembly, drafting, and output organization.
* **`package.json`**: Package configuration tracking standard node dependencies (`playwright-extra` and stealth plugins).

### 3. Output
* **`drafts/`**: Output folder containing the generated outreach letters for target firms (e.g., Ganni, PRETTYBIRD, SmartLess).

---

## How to Test This Run
To execute the safe dry-run pipeline and verify output generation:

1. Open your terminal in this directory:
   ```bash
   cd "Run/Run 1"
   ```
2. Run the orchestrator:
   ```bash
   node src/orchestrator.js
   ```
3. Inspect the output drafts saved in [drafts/](file://Run/Run%201/drafts).

---

## Next Steps for Future Runs (Run 2)
* **Authenticate LinkedIn:** Execute `node save-session.js` in the sibling `Playwright/` folder to capture a fresh session in `auth.json`.
* **Enable Live Scrapes:** Remove the `dryRun = true` default fallback inside `orchestrator.js` to begin retrieving live LinkedIn prospects.
* **Gmail Integration:** Wire the Google Workspace / Gmail API into `orchestrator.js` to create drafts directly in your email client for review.
