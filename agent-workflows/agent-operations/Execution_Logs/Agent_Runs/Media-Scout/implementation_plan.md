# Custom Instagram Scraping Agent using Playwright

We will implement a custom, self-hosted Instagram scraping agent using Playwright in the user's NodeJS environment (`Freelance/Emergentic/Playwright`). This agent will replace the third-party Apify dependency in the n8n workflow.

To bypass Instagram's strict login walls, we will use a session-saving architecture similar to the existing LinkedIn automation setup.

---

## User Review Required

> [!IMPORTANT]
> **Headed Browser Login Requirement:** You will need to run the `node save-instagram-session.js` script once manually. This opens a headed browser window where you must log into a dummy/throwaway Instagram account and solve any CAPTCHAs. This saves your authenticated session state to `instagram-auth.json`.
>
> **Residential Proxies Recommended:** For production use or scanning more than a few profiles a day, we highly recommend integrating a residential proxy provider (like Webshare, Bright Data, etc.) into the Playwright launch options to avoid IP bans.

---

## Proposed Changes

### Playwright Directory (`Playwright`)

#### [NEW] [save-instagram-session.js](file://Playwright/save-instagram-session.js)
A headed browser utility to let the user log into Instagram, complete 2FA/CAPTCHA, and save cookies and session storage state to `instagram-auth.json`.

#### [NEW] [scrape-instagram.js](file://Playwright/scrape-instagram.js)
A scraper script that:
* Loads the saved session state from `instagram-auth.json`.
* Launches a headless/headed browser with stealth plugins.
* Navigates to Instagram.
* Uses the browser context to call Instagram's internal web API (`/api/v1/users/web_profile_info/`) to fetch rich, structured profile JSON without fragile DOM scraping.
* Employs random human-like delays (`sleep`) from `utils.js` between requests.
* Outputs the scraped data as structured JSON.
* Supports receiving a list of usernames from command-line arguments or standard input.

---

## Verification Plan

### Manual Verification
1. **Save Session:** Run `node save-instagram-session.js` to log in and generate `instagram-auth.json`.
2. **Execute Scraper:** Run the scraper from terminal:
   ```bash
   node scrape-instagram.js --usernames instagram,google
   ```
3. **Check Output:** Ensure it successfully outputs the profile JSON for `instagram` and `google` without getting blocked by a login wall.
4. **Hook into n8n:** Integrate the local script execution into n8n using an **Execute Command** node (e.g. `node /path/to/scrape-instagram.js --usernames {{ $json.username.join(',') }}`) instead of the Apify HTTP Request node.
