# Emergentic Sales Navigator Lead Generator

This package provides a completely self-contained LinkedIn Sales Navigator B2B scraping and outreach drafting pipeline. It runs locally on your machine, handles session captures safely, and processes leads in batches to generate tailored cold outreach.

---

## 📦 Package Contents
* `orchestrator.js` — The main campaign runner. Handles orchestration, package checking, LLM evaluations, and reporting.
* `sales_nav_adapter.js` — Browser automation script that searches LinkedIn and extracts profiles.
* `package.json` — Tracks NPM modules (Playwright, Stealth, Generative-AI).
* `Prompts/Guidelines/` — Input files providing the company profile context and cold letter rules.
* `Tools/Scrapers/Playwright/` — Basic browser simulation utilities and session tools.
* **Double-Click Shortcuts:**
  * `setup.bat` / `setup.sh` — Installs npm packages and browser engines.
  * `save_session.bat` / `save_session.sh` — Launches visual login to capture session.
  * `run_campaign.bat` / `run_campaign.sh` — Executes the campaign scraper.

---

## 🚀 Setup & Execution Instructions

> [!IMPORTANT]
> **CRITICAL SETUP RULE (CLOUD SYNC FAILURES):** 
> If you unzipped `emergentic.zip` inside a cloud-synchronized folder (like **Google Drive**, **OneDrive**, **Dropbox**, or **iCloud**), running setup will likely FAIL with `EPERM` or `EBADF` errors due to sync locking.
> 
> You **MUST** move the unzipped `emergentic` folder to a **local, unsynced folder** (such as your local Desktop `C:\Users\<Username>\Desktop\emergentic` or local Documents) before running setup.

### Option A: Double-Click Shortcuts (Easiest - Windows & Mac)

1. **Unzip** `emergentic.zip` to a folder on your computer.
2. **Setup:** Double-click **`setup.bat`** (Windows) or run **`./setup.sh`** (Mac) to install all packages and browser files automatically.
3. **Capture Session:** Double-click **`save_session.bat`** (Windows) or run **`./save_session.sh`** (Mac). 
   * A visual Chromium browser window will open.
   * **Manually log in** to your LinkedIn account, completing any 2FA code verification.
   * Once logged in, go back to your terminal window and press **`[ENTER]`** to save your login session to a local cookie file (`auth.json`).
4. **Run Campaign:** Double-click **`run_campaign.bat`** (Windows) or run **`./run_campaign.sh`** (Mac) to start the scraping run.

---

### Option B: Manual Terminal Execution (Advanced)

If you prefer to run commands manually in your terminal (PowerShell / Command Prompt / Terminal):

1. **Navigate to the Project Directory (DO NOT SKIP):**
   ```bash
   cd /path/to/emergentic
   ```
2. **Install dependencies and browser binaries:**
   ```bash
   npm install
   npx playwright install chromium
   ```
3. **Save your session state:**
   ```bash
   node Tools/Scrapers/Playwright/save-session.js
   ```
   *(Log in manually in the opened browser window, then press `[ENTER]` in the terminal to save).*
4. **Run the prospecting orchestrator:**
   * **Dry-Run (Safe Mock Test):**
     ```bash
     node orchestrator.js --limit 2 --dry-run
     ```
   * **Real Run (Headed Scrape):**
     ```bash
     node orchestrator.js --limit 8 --real --headed
     ```

---

## ⚙️ Key Features
* **Auto Setup & Key Prompts:** If your `GEMINI_API_KEY` is not found, the terminal will prompt you to input one at start and automatically save it to a local `.env` file for future runs.
* **Stealth Controls:** Built-in human emulation timing delays (50ms - 150ms per keypress, smooth scrolling, and hover clicks) mimic standard user behavior to prevent bot detection.
* **Outputs:** Exported spreadsheets are written to `Execution_Logs/Sales_Nav_Campaign_1/scraped_leads.csv` and campaign draft letters are saved to `Execution_Logs/Sales_Nav_Campaign_1/drafts/`.
