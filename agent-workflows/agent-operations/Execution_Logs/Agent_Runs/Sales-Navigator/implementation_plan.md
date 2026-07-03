# Organize Run 1 Files by Project

We will organize the contents of `Run/Run 1` by separating the files into two distinct, dedicated project folders: `LinkedIn_Outreach` and `Instagram_Scraper`. This prevents file clutter and makes the execution contexts clear. We will also add a `run_summary.md` document at the root of `Run 1` providing a full write-up, including our agent identity (**Antigravity**).

## Proposed Folder Layout

Inside `Run/Run 1/`:

- **`run_summary.md`** 👉 [NEW] Summary of the run, contents, and agent details.

### 1. `LinkedIn_Outreach/` (The new LinkedIn & Hermes tools)
- `src/` (Contains `orchestrator.js` and `sales_nav_adapter.js`)
- `config/` (Contains `company_profile.md` and `outreach_guidelines.md`)
- `drafts/` (Contains generated outreach letters)
- `Playwright/` (Contains session tools and search logic)
- `package.json` & `package-lock.json`
- `node_modules/`

### 2. `Instagram_Scraper/` (The previous media/comment scanner)
- `Scripts/` (Contains the Python scripts and sub-folder `Playwright/` with Instagram JS scripts)
- `Data/` (Contains scraped JSON outputs)
- `Reports/` (Contains generated markdown reports)
- `Screenshots/` (Contains scraped post images)

---

## Required Code Adjustments

Since `Playwright` and `src` will move into the subfolder `LinkedIn_Outreach`, the relative paths inside [sales_nav_adapter.js](file://Run/Run%201/src/sales_nav_adapter.js) need to be adjusted:

1. **Utils Import (Line 5)**:
   ```diff
   -const { sleep, humanType, humanScroll, humanClick } = require('../../Playwright/utils');
   +const { sleep, humanType, humanScroll, humanClick } = require('../Playwright/utils');
   ```

2. **Auth Path (Line 17)**:
   ```diff
   -  authPath: path.join(__dirname, '../../Playwright/auth.json')
   +  authPath: path.join(__dirname, '../Playwright/auth.json')
   ```

---

## Proposed Steps

### Step 1: Create Top-Level Directories
Create the following folders inside `Run/Run 1`:
- `LinkedIn_Outreach`
- `Instagram_Scraper`

### Step 2: Move LinkedIn / Hermes Files
Move these folders/files into `LinkedIn_Outreach/`:
- `src`
- `config`
- `drafts`
- `Playwright`
- `package.json`
- `package-lock.json`
- `node_modules`

### Step 3: Update sales_nav_adapter.js Paths
Update the relative paths in `LinkedIn_Outreach/src/sales_nav_adapter.js`.

### Step 4: Move Instagram Scraper Files
Move these folders into `Instagram_Scraper/`:
- `Scripts`
- `Data`
- `Reports`
- `Screenshots`

### Step 5: Write run_summary.md
Create a `run_summary.md` file at the root of `Run/Run 1` detailing:
- Scraped systems overview.
- **Agent Name**: Antigravity.
- Notes and takeaways from the runs.

### Step 6: Verification
Run a dry-run test of the relocated LinkedIn/Hermes orchestrator:
```bash
node "Run/Run 1/LinkedIn_Outreach/src/orchestrator.js"
```
Verify that the output drafts are correctly saved under `Run/Run 1/LinkedIn_Outreach/drafts/`.
