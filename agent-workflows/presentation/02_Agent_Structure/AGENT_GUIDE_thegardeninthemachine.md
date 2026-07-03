# Visual canvas workspace — `thegardeninthemachine`

This project used a **visual canvas workspace**: an infinite, zoomable spatial board where the
work was assembled and presented. Think of it as a large pinboard — reports, screenshots,
generated images and videos, scraped-data summaries, outreach drafts, code snippets, and live
web/embed previews are placed as "cards" on the canvas and grouped into labelled clusters that
tell the story of each workstream.

## What it was used for
- **Central presentation surface** for the engagement — the client-facing view of everything
  the agent team produced.
- **Spatial organization of deliverables** — related outputs (e.g. an Instagram analysis, its
  screen recordings, and the resulting content proposals) sit together in one labelled section
  rather than being scattered across folders.
- **A single, curated source of truth** — the board always reflected the latest reviewed
  outputs, arranged as a coherent narrative rather than a raw file dump.

## How the team fed into it
The individual agents (**Media-Scout**, **Sales-Navigator**, **Outreach-Automation-Engineer**,
**Business-Development-Coordinator**) did **not** edit the canvas directly. They wrote their
outputs — recordings, data, reports, drafts — into `Agent_Operations/Execution_Logs/`,
organized by type:

- Screen recordings (`.mp4`) → `Agent_Operations/Execution_Logs/Instagram_Videos/`
- Scraped data (`.json`) → `Agent_Operations/Execution_Logs/Instagram_Data/`
- Insights / target reports (`.md`) → `Agent_Operations/Execution_Logs/Instagram_Reports/`
- Campaign / outreach drafts (`.txt`/`.json`) → `Agent_Operations/Execution_Logs/Generated_Drafts/`

The **Manager** agent then reviewed those outputs and curated them onto the canvas: deciding
what to surface, writing section headers, and arranging clusters so the board reads clearly.

> The mechanics of the canvas tool itself — how it stores data and how edits are applied — are
> internal and out of scope here. Team agents only need to produce well-organized outputs in
> `Execution_Logs/` for the Manager to curate.
