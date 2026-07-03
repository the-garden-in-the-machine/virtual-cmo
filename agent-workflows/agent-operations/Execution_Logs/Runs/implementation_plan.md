# Reorganizing Workspace Structure for Agent Operations

Describe a plan to restructure the Emergentic workspace to improve organization, separating operational concerns (profiles, prompts, custom tools, pipelines, diagnostics, and runs) into a clean, modular structure under a single directory `Agent_Operations/`, replacing the poorly organized `Run/` folder.

## User Review Required

> [!IMPORTANT]
> **Path Changes:** Moving directories will impact relative import paths in the Javascript/Node code scripts (such as `sales_nav_adapter.js` and `orchestrator.js`). These relative paths will be audited and updated to point to the new folder structure.

## Open Questions

> [!NOTE]
> 1. **Folder Name Preference:** I have proposed the name `Agent_Operations/` for the root folder of this group's efforts. Do you prefer another name (e.g., `Operations/`, `System_Registry/`, `Development/`)?
> 2. **Archival Strategy:** Should we move all files from `Run/Run 1` into this new structure immediately, or keep `Run/` as a read-only historical archive and start fresh under the new directory for subsequent runs? *(Recommended: Move and map all Run 1 files into the new structure to clean up the workspace immediately).*

## Proposed Changes

We will restructure the workspace by deprecating `Run/` and introducing a unified `Agent_Operations/` hierarchy.

```
Agent_Operations/
├── Agent_Profiles/       # Relocated from Run 1/Agent_Profile/
│   ├── Active/
│   └── Inactive/
├── Prompts/              # Enforcing prompt constraints, templates, and guidelines
│   ├── System_Prompts/
│   └── Guidelines/       # Relocated from LinkedIn_Outreach/config/
├── Tools/                # Relocated from Run 1/*/Playwright/ and Scripts/
│   ├── Scrapers/
│   └── Utilities/
├── Pipelines/            # Relocated from Run 1/*/src/ and Pipelines/
│   ├── Outreach/
│   └── Media/
├── Diagnostics/          # New folder tracking problems and documented solutions
│   └── Resolutions/
└── Execution_Logs/       # Relocated from Run 1/Run_Summaries/ and drafts/
    ├── Runs/
    └── Generated_Drafts/
```

### [Relocation Mapping]

#### [NEW] [Folder: Agent_Operations](file://Agent_Operations)
The new operations root folder.

#### [MODIFY] [LinkedIn Outreach Scripts](file://Agent_Operations/Pipelines/Outreach/orchestrator.js)
Relative paths inside script files will be updated to match the new modular structure (e.g., targeting the new configuration files under `Prompts/Guidelines/` and tools under `Tools/Scrapers/`).

#### [DELETE] [Folder: Run](file://Run)
Once files are relocated and verified, the `Run/` folder will be deleted to remove redundancy.

---

## Verification Plan

### Automated Verification
- Run dry-runs of the orchestrator scripts in their new paths:
  ```bash
  node Agent_Operations/Pipelines/Outreach/orchestrator.js --dry-run
  ```
- Verify all relative file paths resolve successfully without script errors.

### Manual Verification
- Review the restructured folders visually to ensure they match the proposed model.
- Confirm all agent files (`Manager.md`, `Media-Scout.md`, etc.) are correctly in their `Active/` and `Inactive/` folders.
