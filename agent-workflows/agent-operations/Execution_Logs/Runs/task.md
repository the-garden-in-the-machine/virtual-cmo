# Task Checklist: Hermes-Ready Refactoring & Operations

## 📂 Phase 1: Workspace Reorganization
- [x] Create `Agent_Operations/` directory hierarchy
- [x] Move agent profiles to `Agent_Operations/Agent_Profiles/`
- [x] Move guidelines to `Agent_Operations/Prompts/`
- [x] Relocate tools and scraper engines to `Agent_Operations/Tools/`
- [x] Relocate orchestrator/adapter scripts and pipeline definitions to `Agent_Operations/Pipelines/`
- [x] Update relative paths in all relocated script files
- [x] Verify execution by running dry-runs
- [x] Clean up redundant folders (delete old `Run/` directory)

## 🤖 Phase 2: System Alignment & Hermes Preparation (Agent-Led)
- [x] Create team guidelines for Hermes-ready architecture in [team_directives.md](file://Agent_Operations/Prompts/Guidelines/team_directives.md)
- [x] Outreach-Automation-Engineer: Audit and refactor outreach scripts (`sales_nav_adapter.js`, `orchestrator.js`)
- [x] Media-Scout: Audit and refactor media pipeline scripts (`pipeline.txt`, `style.txt`, `Transcription pipeline.txt`)
- [x] Document final CLI commands and schemas for Hermes integration
