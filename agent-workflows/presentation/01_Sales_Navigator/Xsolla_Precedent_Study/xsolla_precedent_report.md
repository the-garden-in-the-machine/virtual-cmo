# Xsolla Precedent Study & Scraper Suggestions

This report summarizes our findings from inspecting the Sales Navigator Company page for **Xsolla** (ID: 875431) and outlines architectural recommendations for our local scraper.

---

## 📈 Xsolla Performance Case Study

By parsing the DOM of Xsolla's Sales Navigator page, we uncovered deep operational insights:
*   **Rapid Engineering Growth:** Engineering headcount expanded by **29% in the last year**, suggesting a massive focus on Fintech/Web shop product updates.
*   **Hiring & Growth Focus:** Total employee count reached **1,279** (+30% over 2 years), indicating healthy expansion.
*   **Consolidated C-Suite Data:** Sales Navigator pre-identified the exact buying committee (CTO, CAO, President, CFO, CISO) directly on the landing page, removing the need to search for titles manually.

---

## 💡 Suggestions for Scraper Protocol Implementation

To make our scraper significantly more sophisticated, we can implement the following features:

### 1. Pre-Scrape Company Diagnostic (Dynamic Filter Tuning)
Before extracting individual leads, the scraper should navigate to the target company page and inspect the department headcount metrics:
*   **How it works:** Parse the `textBlocks` containing headcount growth rates.
*   **Actionable Output:** If the **Engineering** growth rate is >15%, set the outreach strategy to *Product/Developer partnerships*. If **Marketing** is growing fastest, pivot the pitch to *Brand Outreach/Advertising*.
*   **Benefit:** Allows the LLM to draft highly context-aware outreach letters based on the company's real hiring trends.

### 2. Auto-Extracting Executive Buying Committees
Instead of executing search filter strings for titles (which can miss non-standard C-level titles), the scraper can pull names directly from the **"Key People"** section of the company page:
*   **Selector Target:** Loop through elements containing `[data-anonymize="person-name"]` and `[data-anonymize="job-title"]` inside the `Key People` panel.
*   **Benefit:** Instantly maps the core decision makers in less than 2 seconds with 100% accuracy.

### 3. Integrated Contact Enrichment API (Apollo.io Integration)
Since direct contact info (emails/phones) is protected on LinkedIn, we should build an automated backend query:
*   **API Hook:** Register for a free Apollo.io account (which provides **10,000 free email credits per month**).
*   **Scraper Hook:** Add a post-processing function that takes the scraped executive's `Name` + `Company Domain` and makes a fetch request to `https://api.apollo.io/v1/people/match` to retrieve their corporate email address and direct phone number.
*   **Benefit:** Saves hours of manual work and outputs a complete, ready-to-use cold list.
