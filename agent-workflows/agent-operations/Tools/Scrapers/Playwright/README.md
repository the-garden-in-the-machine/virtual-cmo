# LinkedIn Sales Navigator Playwright Automation

This folder contains a Playwright-based automation suite for interacting with LinkedIn Sales Navigator. It uses stealth plugins and human-like interaction simulations (typing delays, mouse hovers, and natural scrolling) to avoid detection.

## Visual Monitoring & Headed Mode

Both automation scripts are configured with **`headless: false`** by default. This allows you to **visually monitor exactly what the automation is doing in real-time** as a browser window opens on your screen.

---

## 1. Setup Instructions

If you haven't already, install the dependencies and the Chromium browser binary:

```bash
# Install NPM dependencies
npm install

# Install Playwright browser binaries
npx playwright install chromium
```

---

## 2. Running the Scripts

### Step A: Capture Your Login Session (`save-session.js`)
LinkedIn has strict security protocols. Instead of typing your username and password programmatically (which triggers security blocks), this script launches a visual browser window where you can safely log in, complete 2FA (Two-Factor Authentication), or handle any CAPTCHAs manually.

1. Run the script:
   ```bash
   node save-session.js
   ```
2. A Chromium browser window will open.
3. Log in to your LinkedIn account.
4. Complete any verification prompts (e.g., email/SMS code).
5. Once you are successfully logged in and view your LinkedIn homepage, go back to your terminal window.
6. Press **`[ENTER]`** in your terminal to save your login session to `auth.json`. The browser window will close automatically.

> [!WARNING]
> Keep `auth.json` secure. It contains your active session cookies and local storage tokens. Do not commit it to public version control.

---

### Step B: Run the Search Automation (`sales-nav-search.js`)
Once `auth.json` is generated, you can run the automated search scraper.

1. Run the search script:
   ```bash
   node sales-nav-search.js
   ```
2. A visual Chromium browser window will open, restore your session from `auth.json`, and navigate directly to Sales Navigator.
3. It will:
   - Perform a search for `"Software Engineer"` using human-like typing delays (50ms - 150ms per character).
   - Submit the search and wait for results.
   - Perform smooth scrolling to simulate reading the page.
   - Take screenshots along the way (`sales-nav-home.png`, `sales-nav-search-results.png`).
4. Close the browser window once done.

---

## 3. Code Structure

- **`save-session.js`**: Launches a headed Chromium instance, waits for the user to log in, and saves the browser storage state (cookies, localStorage) to `auth.json`.
- **`sales-nav-search.js`**: Launches a headed Chromium instance, loads `auth.json` state, navigates to Sales Navigator, types a search query, scrolls, and takes screenshots.
- **`utils.js`**: Helper methods simulating human behaviors:
  - `sleep(min, max)`: Random delays.
  - `humanType(page, selector, text)`: Realistic typing speed.
  - `humanScroll(page, maxScrolls)`: Smooth mouse scrolling.
  - `humanClick(page, selector)`: Hover before clicking to trigger hover-based JS events.
