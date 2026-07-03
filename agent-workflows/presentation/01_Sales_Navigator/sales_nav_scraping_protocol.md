# Sales Navigator Extraction & Scrape Protocols

This document outlines the standard extraction procedures and DOM selector mappings for scraping LinkedIn Sales Navigator via Playwright.

---

## 🔍 DOM Selector Mappings (Split-Screen Drawer)

When a lead card is clicked on a Sales Navigator search result page, a right-hand detail drawer is opened. The following selectors extract information from this drawer:

*   **Lead Name:** `span[data-anonymize="person-name"]`
*   **Headline/Bio:** `span[data-anonymize="headline"]` or `.artdeco-entity-lockup__subtitle`
*   **Location:** `span[data-anonymize="location"]`
*   **Experience Block Titles:** `H2` tags inside the experience section (e.g., VP, Global Product)
*   **Experience Block Companies:** `[data-anonymize="company-name"]`
*   **Personal Blurb/About:** `[data-anonymize="person-blurb"]`
*   **Education Institutions:** `[data-anonymize="education-name"]`

---

## ⚙️ Navigation & Click Protocols

1.  **Open Details Peek Panel:**
    *   Click on the lead's name link inside the search results item card:
        `a[data-anonymize="person-name"], a.artdeco-entity-lockup__title`
    *   Wait for `3000ms - 5000ms` for the split-screen detail drawer to render.

2.  **Trigger Lazy Loading:**
    *   Evaluate scroll height in the drawer and perform a slow scroll down to trigger lazy loading of education and past positions.

3.  **Extract Company details (Optional Domain Scrape):**
    *   Click on the first `[data-anonymize="company-name"]` link in the drawer. This opens the Company peek panel.
    *   Extract the corporate website domain from the company info sheet.

---

## ✉️ Contact Information Waterfall Enrichment

Because primary emails and phone numbers are protected by LinkedIn's privacy layers (only visible for 1st-degree connections), direct scraping is supplemented by the following pipeline:

1.  **Extract Profile Metadata:** Scrape `Name`, `Current Company Name`, and `Current Title`.
2.  **Extract Corporate Website Domain:** Click to the company details pane to grab their official web domain.
3.  **Query Enrichment APIs:** Send `Name` + `Company Domain` to waterfall data enrichment APIs (e.g., Lusha, Apollo, Hunter) to retrieve verified corporate emails and phone numbers.
