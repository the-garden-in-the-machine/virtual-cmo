# Xsolla Precedent Study & Executive Email Enrichment Report

This report consolidates the Sales Navigator company performance study, the C-suite buying committee mapping, and the live contact enrichment results using the Apollo.io API.

---

## 📈 Xsolla Performance Case Study

By analyzing the DOM of Xsolla's Sales Navigator page (ID: 875431), we extracted critical organizational and growth metrics:

* **Hiring & Headcount Growth**: Xsolla has reached **1,279 employees** (a healthy +30% growth over 2 years).
* **Engineering Expansion**: Engineering headcount grew by **29% in the last year** (and 5% in the last 3 months), suggesting a strong investment in product features, Fintech platforms, and web shop updates.
* **Stable Executive Tenure**: The median employee tenure is **2.3 years**, reflecting a stable operational foundation.

### Department Headcount Growth Summary
* **Engineering**: +5% (3m) | +29% (1y)
* **Marketing**: +1% (3m) | +22% (1y)
* **Business Development**: +3% (3m) | +9% (1y)
* **Information Technology**: +3% (3m) | +8% (1y)

---

## 👥 Enriched C-Suite Lead Directory

We executed the Apollo.io Match API to enrich the contact records of the 8 mapped key executives. We successfully retrieved verified corporate emails for **6 out of the 8** decision-makers:

| Name | Title | Company | Domain | Email Address | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chris Hewish** | President | Xsolla | xsolla.com | [c.hewish@xsolla.com](mailto:c.hewish@xsolla.com) | Verified |
| **Moin Moinuddin** | Chief Technology Officer | Xsolla | xsolla.com | [m.moinuddin@xsolla.com](mailto:m.moinuddin@xsolla.com) | Verified |
| **Berkley Egenes** | Chief Marketing & Growth Officer | Xsolla | xsolla.com | [b.egenes@xsolla.com](mailto:b.egenes@xsolla.com) | Verified |
| **Anton Zelenin** | Chief Product Officer: Fintech | Xsolla | xsolla.com | [a.zelenin@xsolla.com](mailto:a.zelenin@xsolla.com) | Verified |
| **Cathleen Nilson** | Chief Financial Officer (EVP) | Xsolla | xsolla.com | [c_nilson@xsolla.com](mailto:c_nilson@xsolla.com) | Verified |
| **Peter Oehlert** | Chief Information Security Officer | Xsolla | xsolla.com | [p.oehlert@xsolla.com](mailto:p.oehlert@xsolla.com) | Verified |
| **Shurick Agapitov** | Founder and CEO | Xsolla | xsolla.com | *Not Found* | Restricted / Unavailable |
| **Carla Bedrosian** | CAO & Chief Legal Officer | Xsolla | xsolla.com | *Not Found* | Unavailable |

> [!NOTE]
> *Shurick Agapitov* (Founder) has a restricted profile in Apollo. His public bio notes: *"Please email me your ideas directly chairman@x.la"*, which can serve as a direct manual alternative.

---

## 💡 Suggestions for Scraper Protocol Implementation

To scale these manual insights across the automated prospecting campaign, we recommend integrating three features into the scraper pipeline:

### 1. Pre-Scrape Company Diagnostics
Before pulling individual leads, the orchestrator should navigate to target company pages and inspect the department headcount metrics. 
* **Dynamic Pitch Tuning**: If Engineering is growing >15%, the generated outreach should pivot to product/technical collaboration. If Marketing is leading, pivot the copy to branding/advertising opportunities.

### 2. Auto-Extracting Executive Buying Committees
Instead of running complex lead searches (which are prone to missing non-standard titles), the scraper should parse names directly from the **"Key People"** panel of the Sales Navigator company profile page. This maps the core decision makers in under 2 seconds.

### 3. Integrated Contact Enrichment
Using the verified `'X-Api-Key'` request header format we implemented, the scraper should batch-query `https://api.apollo.io/v1/people/match` post-scrape to resolve emails, bypass manual searches, and output a complete campaign-ready spreadsheet.
