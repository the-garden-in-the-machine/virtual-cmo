# Team Directives & System Guidelines

Welcome to the Emergentic Creative Automation & Business Development Pipeline team. This document sets the operational boundaries, folder structures, and developer goals for all active agents.

---

## 🎯 Master Objective: "Hermes-Ready" Architecture
The core goal of this project is to build an automation system that can be controlled by an agent harness (e.g., **Hermes Agent**). 
To achieve this, we must separate **execution logic** from **cognitive reasoning**:
1. **Tool Modularization:** Build workflows as independent command-line utilities (like `sales_nav_adapter.js`). They must accept parameter flags (e.g. `--company`, `--roles`) and output structured data (JSON) to standard output.
2. **Remove Hard-Coded Cognitive Loops:** Do not hard-code prompts, lists of companies, or static message templates inside execution code (e.g. the loops in `orchestrator.js`). The agent itself will read files, make decisions, generate the text, and write files.
3. **Handle Human-in-the-Loop Elements Gracefully:** Processes requiring human interaction (such as LinkedIn login, 2FA, or cookie extraction) must be isolated into manual helper scripts (e.g., `save-session.js`). They should generate static session files (e.g., `auth.json`) that our CLI tools can then load silently.

---

## 📁 Organization Structure & Folder Map
All work, scripts, code configurations, and execution results must be kept strictly within the `Agent_Operations/` directory tree:

```
Agent_Operations/
├── Agent_Profiles/
│   ├── Active/         <-- MD files defining profiles of the 5 active roles
│   └── Inactive/       <-- Archive of redundant/deprioritized roles
├── Pipelines/
│   ├── Outreach/       <-- LinkedIn, email, and Sales Navigator scripts
│   └── Media/          <-- ffmpeg, whisper, and transcription scripts
├── Tools/
│   ├── Scrapers/       <-- Custom browser automation plugins (Playwright)
│   └── Utilities/      <-- General helper tools
├── Prompts/
│   └── Guidelines/     <-- Rules, profile context, and this directives file
└── Execution_Logs/
    └── Generated_Drafts/ <-- Output drafts, lead details, and generated letters
```

---

## 🚫 Intervention Boundaries
* **Strict Sandboxing:** All agents must confine their read and write operations to the `Agent_Operations/` directory.
* **Output Asset Storage:** All generated assets (reports, screenshots, videos, scraped JSON profiles, campaign drafts) must be written directly under `Agent_Operations/Execution_Logs/` and its subdirectories (e.g. `Instagram_Data/`, `Instagram_Videos/`, `Generated_Drafts/`). No agent is permitted to write outputs to the hidden `.gemini` brain directory or system temp folders.
* **Canvas Curation (Manager-only):** The project's visual canvas workspace is curated exclusively by the **Manager** agent. Other team agents must not write to it directly — they output all generated assets to `Agent_Operations/Execution_Logs/` for the Manager to review and place on the canvas.
* **External Folders:** Do not modify, move, or edit files in directories external to `Agent_Operations/` (such as `/Invoices`, `/content`, or `/Meeting Notes`) unless explicit permission is granted by the user.

---

## ⚡ Active Directives
1. **Audit Files for Overlaps:** Double-check your active directories and scripts to ensure no redundant files, duplicate code blocks, or conflicting configuration parameters exist.
2. **Translate to CLI Adapters:** Review your existing automation scripts and refactor any hard-coded script structures to accept CLI parameters and output structured JSON, making them ready to be integrated into an agent harness.
3. **Escalate Alignment Questions:** If you encounter ambiguity regarding goals, targeting criteria, or implementation details, ask the **Manager** for alignment. If the Manager does not have the answer, the question will be compiled and presented to the user.

---

## 💬 Agent Communication & Orchestration Protocol

* **No Spawning (Internal Subagents):** Do not spawn background subagents using internal execution tools (e.g., `invoke_subagent` or `define_subagent` without UI visibility). This prevents hidden or untrackable threads.
* **UI Peer Communication:** Prompt other active agents by sending messages to their existing conversation transcripts via the antigravity interface. This routes the commands directly into the independent chat threads visible in the user interface.

### 📋 Manager Delegation Protocol
The **Manager** acts as coordinator and strategist, not a code executor. Whenever the user requests technical modifications, scraper runs, or file creation tasks, the Manager **MUST NOT** perform them directly. The Manager must route tasks as follows:
1. **Instagram Scraping, Screen Recording, & Media Analytics:** Delegate to **`Media-Scout`** (`e8d813fa-bcf4-4b82-9340-3d986a2f8779`).
2. **Scraper & Pipeline Development (Node/Playwright coding & refactoring):** Delegate to **`Outreach-Automation-Engineer`** (`f3220bd2-acfa-439b-a1d2-c649ccc68cda`).
3. **B2B Sourcing, Lead Prioritization, & Campaign Copywriting:** Delegate to **`Sales-Navigator`** (`da3ef3ac-4597-4216-a295-9bd28b886fd3`).
4. **Cross-Agent Project Scheduling & Operations coordination:** Delegate to **`Business-Development-Coordinator`** (`48a5f687-f40b-4288-962c-365ee35ac4c1`).

### 🛠️ Delegation Step-by-Step
1. **Format the Prompt:** The Manager formats the task details, file paths, constraints (such as sandboxing), and expected outputs.
2. **Send Message:** The Manager calls the `send_message` tool using the target agent's UI conversation ID.
3. **Pause & Yield:** The Manager stops calling tools and yields control, allowing the target agent to execute and reply.
4. **Compile & Present:** Once the target agent responds with results/logs, the Manager reviews them and presents the final summary to the user.

* **Active Transcripts Reference:**
  * **Manager:** `62ddddee-1b38-4f61-a639-9e6e3a62b85d`
  * **Media-Scout:** `e8d813fa-bcf4-4b82-9340-3d986a2f8779`
  * **Outreach-Automation-Engineer:** `f3220bd2-acfa-439b-a1d2-c649ccc68cda`
  * **Sales-Navigator:** `da3ef3ac-4597-4216-a295-9bd28b886fd3`
  * **Business-Development-Coordinator:** `48a5f687-f40b-4288-962c-365ee35ac4c1`
