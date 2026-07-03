# 🚀 Emergentic Lead Generation & Email Enrichment Pipeline Documentation

This document explains the end-to-end technical architecture, step-by-step process flow, and operational structure of the **Company-First Lead Scraper & Apollo.io API Enrichment Pipeline**.

---

## 📐 Pipeline Architecture Flowchart

The following diagram illustrates the complete sequential execution of the pipeline, from setup to final output:

```mermaid
graph TD
    %% Define Styles
    classDef startEnd fill:#1A1F2C,stroke:#00E5FF,stroke-width:2px,color:#fff;
    classDef process fill:#1F2937,stroke:#9CA3AF,stroke-width:1px,color:#fff;
    classDef apiCall fill:#0D47A1,stroke:#1565C0,stroke-width:1px,color:#fff;
    classDef dataStore fill:#2E7D32,stroke:#388E3C,stroke-width:1px,color:#fff;

    Start([1. Execution Start]) --> Config[2. Load Environment & Config<br>Validate API Keys & Guidelines]
    Config --> ScraperInit[3. Initialize Playwright Browser<br>Load auth.json Session State]
    
    %% Playwright Scrape Sub-pipeline
    subgraph Playwright Scraper (sales_nav_adapter.js)
        ScraperInit --> CompanyLookup[4. Search Target Company<br>Resolve Company ID]
        CompanyLookup --> HeadcountMetrics[5. Scrape Company Page<br>Extract Headcount Growth trends]
        HeadcountMetrics --> MapCommittee[6. Map C-suite Executives<br>Key People Section]
        MapCommittee --> DrawerTenure[7. Click Executive Cards<br>Extract Position Tenure]
        DrawerTenure --> MediaLogs[8. Save Profile Screenshots<br>Convert Screen Recording to MP4]
    end

    %% Apollo Enrichment
    MediaLogs --> ApolloEnrich[9. Apollo.io Match API Enrichment]
    subgraph Apollo API (v1/people/match)
        ApolloEnrich --> SplitNames[10. Split Full Name<br>first_name & last_name]
        SplitNames --> HeaderAuth[11. Header Authentication<br>X-Api-Key Header]
        HeaderAuth --> FetchMatch[12. Fetch Corporate Email<br>Personal Email Fallback]
    end

    %% Gemini Generation
    FetchMatch --> GeminiBatch[13. Gemini Batch LLM Processing]
    subgraph Gemini API (1.5 / 2.5 Flash)
        GeminiBatch --> ContextPitch[14. Inject Growth Context<br>Hiring Trends & Tenure]
        ContextPitch --> OutreachDrafts[15. Generate Quiet Outreach<br>Strict Brand Guidelines]
    end

    %% Outputs
    OutreachDrafts --> CSVExport[(16. Export CSV Leads Spreadsheet)]
    OutreachDrafts --> MDExport[(17. Export Markdown Email Drafts)]
    CSVExport & MDExport --> End([18. Pipeline Complete])

    %% Assign classes
    class Start,End startEnd;
    class Config,ScraperInit,CompanyLookup,HeadcountMetrics,MapCommittee,DrawerTenure,MediaLogs,SplitNames process;
    class ApolloEnrich,HeaderAuth,FetchMatch,GeminiBatch,ContextPitch,OutreachDrafts apiCall;
    class CSVExport,MDExport dataStore;
```

---

## 🛠 Detailed Process Breakdown

### Stage 1: Initialization & Context Loading
* **Environment Configuration**: The orchestrator loads `.env` settings, validating the `GEMINI_API_KEY` and `APOLLO_API_KEY`. If keys are missing in a live run, it interactive-prompts the user via CLI and saves them.
* **Guideline Parsing**: Loads target company profiles and outreach guidelines to instruct the AI writer on branding tone, parameters, and style constraints.

### Stage 2: Company-First Browser Scraping (`sales_nav_adapter.js`)
* **LinkedIn Login Session**: Bypasses bot detection by loading a pre-captured cookie session file (`auth.json`), avoiding interactive 2FA checks.
* **Company Diagnostics**:
  * Resolves raw company names to their unique Sales Navigator ID (e.g., `875431` for *Xsolla*).
  * Extracts department headcount metrics (Engineering, Marketing, Sales, IT) over 3-month and 1-year windows to identify growth spikes.
* **Executive Buying Committee Mapping**:
  * Extracts details of key leaders directly from the company page's **"Key People"** panel.
  * Emulates human clicks on each person's card to open details drawers, capturing their **Time in Current Position** (tenure) while saving logs of screenshots and WebM video recordings.

### Stage 3: Apollo Match API Enrichment (`enrichWithApollo`)
* **Endpoint Query**: Sends a `POST` query to `https://api.apollo.io/v1/people/match`.
* **Header Authorization**: Standardizes request security by sending credentials under `'X-Api-Key': apiKey` header.
* **Payload Structure**: Optimizes match accuracy by splitting names into `first_name` and `last_name` properties, matching on Company Name, Website Domain, and Job Title.
* **Contact Resolution**: Resolves corporate emails. Incorporates the `reveal_personal_emails: true` parameter as a fallback option when business mail matches are restricted.

### Stage 4: Batch LLM Processing (`evaluateProspectsBatch`)
* **Enriched Context Ingestion**: Combines the prospect's profile (name, title, tenure) with the company's department growth trends (e.g., *Engineering grew by 29% in 12 months*).
* **AI Pitch Generation**: The Gemini model parses this context to write a highly tailored, quiet, and hyper-personalized cold outreach draft.
* **Style Guidelines**: Avoids aggressive, high-hype language (e.g., *"unlocked"*, *"revolutionize"*) and instead focuses on low-friction, natural conversation.

### Stage 5: Exports & Standalone Packaging
* **CSV Logging**: Writes structured prospects to `scraped_leads.csv` with columns: `Name`, `Title`, `Company`, `Domain`, `Email`, `Time in Position`, and `Company Site`.
* **Individual Markdown Drafts**: Creates distinct outreach markdown files containing context headers and raw email text.
* **Zip Archiver**: Runs a packaging routine (`package_prospector.py`) that bundle-rebuilds a clean standalone folder and generates `emergentic.zip` directly on your Desktop, ensuring path localizations are set up correctly.
