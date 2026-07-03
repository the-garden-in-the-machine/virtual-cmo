# Outreach Pipeline Refactoring (Hermes-Ready)

Refactor the outreach pipeline scripts in `Agent_Operations/Pipelines/Outreach/` to eliminate redundancies and make them fully "Hermes-ready". A script is Hermes-ready when it outputs strict JSON to stdout (so agent frameworks can parse it), writes logs/progress to stderr, and handles configuration and authentication non-interactively via arguments or environment parameters.

## User Review Required

> [!IMPORTANT]
> **Refactoring Strategy:** We will refactor `sales_nav_adapter.js` to export its core scraper functionality as a Node module while maintaining a CLI entrypoint via `if (require.main === module)`. This allows `orchestrator.js` to import it directly (eliminating the slow/fragile `execSync` subprocess invocation) while still permitting Hermes to run `sales_nav_adapter.js` as a standalone CLI tool.

## Open Questions

> [!NOTE]
> 1. **Auth File Fallback:** If `--auth` is not passed, should `sales_nav_adapter.js` look for a fallback environment variable (e.g. `PLAYWRIGHT_AUTH_PATH`) before defaulting to `../../Tools/Scrapers/Playwright/auth.json`?
> 2. **Logging Level:** Should we add a `--silent` flag to completely suppress stderr progress logging in both scripts?

---

## Proposed Changes

We will modify and create the following files under `Agent_Operations`:

### Pipelines & Scrapers

#### [MODIFY] [sales_nav_adapter.js](file://Agent_Operations/Pipelines/Outreach/sales_nav_adapter.js)
* Refactor argument parsing to output error JSON on stdout if required flags are missing.
* Redirect all informational console messages (such as browser launch and navigation events) to `console.error` (stderr).
* Export `runScraper` and `getMockData` functions to allow direct JS imports.
* Wrap CLI runner inside `if (require.main === module)` to preserve standalone CLI behavior.

#### [MODIFY] [orchestrator.js](file://Agent_Operations/Pipelines/Outreach/orchestrator.js)
* Refactor to directly import `runScraper` from `sales_nav_adapter.js` instead of invoking it via `execSync` child processes.
* Remove the duplicate `getMockData` definition, importing it directly from the adapter instead.
* Enforce clean stdout JSON output for the final run summary while sending step-by-step progress logging to stderr.

### Execution Logs

#### [NEW] [outreach_automation_audit.md](file://Agent_Operations/Execution_Logs/outreach_automation_audit.md)
* Document the full script audit findings (redundancies, overlap, and data bottlenecks).
* Map out the refactored code changes and improvements.
* Log progress notes for team transparency.

---

## Verification Plan

### Automated Tests
* Validate `sales_nav_adapter.js` CLI execution outputs clean JSON to stdout:
  ```bash
  node sales_nav_adapter.js --company "Ganni" --roles "Creative Director" --dry-run
  ```
* Validate `orchestrator.js` CLI execution outputs clean pipeline statistics JSON to stdout:
  ```bash
  node orchestrator.js --companies "Ganni" --roles "Creative Director" --dry-run
  ```
* Verify both files pass syntax checks and run cleanly without runtime exceptions.
