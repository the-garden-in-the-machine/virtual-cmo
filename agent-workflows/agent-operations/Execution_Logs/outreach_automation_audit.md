# Outreach Pipeline Script Audit
**Executed By:** Outreach-Automation-Engineer
**Date:** June 9, 2026

---

## 1. Audit Findings

We conducted a detailed code review of `sales_nav_adapter.js` and `orchestrator.js` inside `Agent_Operations/Pipelines/Outreach/`. The following overlaps, redundancies, and bottlenecks were identified:

### A. Overlaps & Code Duplication
* **Mock Data Duplication:** Both scripts define the exact same `getMockData(company, roles)` function (lines 48–67 in `sales_nav_adapter.js` and a slightly modified/extended version implicit in how mock outputs are handled). We will consolidate this into `sales_nav_adapter.js` and export it, removing the duplicate code from the orchestrator.
* **CLI Parameter Re-parsing:** Both scripts separately parse command-line options. In the previous implementation, `orchestrator.js` parsed flags, reconstructed them into a command string, and spawned a child process that re-parsed those exact same flags in `sales_nav_adapter.js`.

### B. Execution Bottlenecks
* **Subprocess Spawning (`execSync`):** In `orchestrator.js`, the scraper adapter was executed as a child process via `child_process.execSync`. This creates significant execution overhead (spawning a new Node process, re-compiling modules, and parsing dependencies) for every company scanned. 
* *Solution:* Refactor `sales_nav_adapter.js` to export a clean asynchronous `runScraper` function, allowing `orchestrator.js` to import and call it directly in-process.

### C. Hermes Readiness (JSON I/O Boundary)
* **Stdout Pollution:** For an agent framework like Hermes or n8n to safely consume these scripts, `stdout` must be reserved strictly for valid JSON payloads. Any text-based logs must be redirected to `stderr` (`console.error`).
* Currently, some informational logs in both scripts print to `stdout` via `console.log`. We will migrate all progress/status logs to `console.error` (stderr).

---

## 2. Refactoring Actions

### `sales_nav_adapter.js`
1. **Module Exports:** Export `runScraper(options)` and `getMockData(company, roles)`.
2. **CLI Runner Check:** Wrap the execution logic inside `if (require.main === module)` so it runs as a CLI runner only when executed directly.
3. **Stderr Logging:** Redirect all runtime status logs to `console.error`.

### `orchestrator.js`
1. **Direct Module Import:** Remove child process calls (`execSync`) and require `sales_nav_adapter.js` directly to run searches in-memory.
2. **Duplicate Code Elimination:** Remove duplicate data structures and import mock generators from the adapter.
3. **JSON output:** Print only the final JSON summary report to `stdout`. All step status prints to `stderr`.
