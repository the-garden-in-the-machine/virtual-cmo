# Detailed Company Report: 11 bit studios S.A.

This report provides an in-depth corporate, technical, and operational analysis of the Warsaw-based game developer and publisher, **11 bit studios S.A.** (WSE: 11B). It identifies organizational structures, game engine shifts, publishing pipelines, and maps specific operational bottlenecks to the Emergentic automation offerings.

---

## 1. Corporate History & Leadership Profile

*   **Establishment:** Founded in September 2010 by former core developers and managers from CD Projekt and Metropolis Software.
*   **Public Listing:** Listed on the Warsaw Stock Exchange since December 2015, currently tracking as an mWIG40 index member.
*   **Key Philosophy:** "Meaningful Entertainment" / "Games that Matter." The company prioritizes complex, emotionally engaging narrative experiences over generic arcade mechanics.

### Executive Leadership Structure:
*   **Przemysław Marszał (President of the Management Board / CEO):** Assumed the presidency in October 2020. Marszał directs the overall creative vision, studio expansion, and strategic corporate positioning.
*   **Grzegorz Miechowski (Chief Operating Officer / COO):** Co-founder and former CEO (until 2020). Miechowski transitioned to COO to focus on day-to-day operations, developer resource management, and execution logistics.
*   **Pawel Feldman (Chief Business Development Officer / CBDO):** Directs the company’s business development, global publishing acquisitions, game licensing, and B2B co-development partnerships.

---

## 2. Technical Stack & Engine Transition

In 2021, 11 bit studios executed a fundamental pivot in their technical strategy:

*   **Proprietary Legacy (Liquid Engine):** Historically, the studio built its landmark titles (*This War of Mine*, *Frostpunk*) using its in-house proprietary technology, the **Liquid Engine**.
*   **The Pivot to Unreal Engine:** The studio announced a multi-project licensing agreement with Epic Games to transition all future game development to **Unreal Engine 4 & 5**.
*   **Strategic Rationale:** 
    1.  **Production Scale:** The complexity of scaling up to AAA-level production values (e.g., *Frostpunk 2* and *The Alters*) exceeded the capabilities of a small, proprietary engine team.
    2.  **Workflow Standardization:** Standardizing on Unreal Engine allows the studio to recruit international developers who are already trained in the engine, eliminating onboarding lag.
    3.  **Cross-Platform Porting:** Out-of-the-box support for next-gen consoles (PS5, Xbox Series X/S) and PC delivery.

---

## 3. Dual-Model Operations: Internal Development vs. Publishing

11 bit studios operates a highly successful dual business model, which complicates their asset and marketing pipeline operations:

```
                      ┌───────────────────────┐
                      │  11 bit studios S.A.  │
                      └───────────┬───────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────┐                               ┌─────────────────┐
│  Proprietary    │                               │  11 bit XDEV    │
│  Development    │                               │  Publishing     │
└────────┬────────┘                               └────────┬────────┘
         │                                                 │
         ├─► Frostpunk 2                                   ├─► Children of Morta
         ├─► The Alters                                    ├─► Moonlighter
         └─► Witcher Co-prod.                              ├─► The Thaumaturge
                                                           └─► The Invincible
```

### A. Internal Game Development Studio
Focuses on high-budget, proprietary society survival and narrative games. They manage heavy asset compilation workflows (cinematics, character models, multi-hour audio streams for voiceovers).

### B. 11 bit publishing (External Publishing / XDEV)
Through their publishing wing, they partner with independent external studios (like Digital Sun or Starward Industries). 11 bit provides:
*   Project funding and milestones management.
*   Quality Assurance (QA) and playtesting infrastructure.
*   **Global Marketing & Localization:** This is their heaviest administrative and creative marketing pipeline. They manage the release calendar, localized social media, storefront assets (Steam, GOG, Epic Store), and trailer distribution for 5–10 active games at any given time.

---

## 4. Marketing Operations & Media Pipeline Bottlenecks

Because 11 bit studios operates as a multi-game publisher, their marketing team manages a high, ongoing volume of promotional content. This dual-model complexity leads to several manual processing bottlenecks:

### Bottleneck A: Multi-Language Trailer Subtitling & Localization
*   **The Problem:** Every major trailer release (e.g., *Frostpunk 2* gameplay trailers) must be localized into **12+ languages** (English, Polish, Chinese, German, Spanish, etc.) for global storefront distribution. 
*   **Manual Friction:** Editors manually import subtitle SRT files, adjust font styles, verify margins, and burn them into separate video files inside editing software (Adobe Premiere or DaVinci Resolve) for each language.
*   **Emergentic Automation Fit:** Custom ExtendScript templates in After Effects or headless FFmpeg scripts to auto-burn localized SRT subtitle layers programmatically in batch, outputting 12 finished localized trailer files instantly.

### Bottleneck B: Aspect Ratio Scaling for Social Channels
*   **The Problem:** Wide-aspect ratio gameplay capture (16:9) must be reformatted into vertical (9:16) gameplay reels for TikTok, YouTube Shorts, and Instagram.
*   **Manual Friction:** Design teams manually pan, scan, and crop clips, repositioning key UI elements (health bars, resource meters) so they remain visible in vertical frames.
*   **Emergentic Automation Fit:** Python-driven FFmpeg crop profiles that programmatically track coordinates or apply letterboxing, resizing widescreen game clips into vertical templates in bulk.

### Bottleneck C: Diarization & Transcription of Developer Logs
*   **The Problem:** Behind-the-scenes diaries, gameplay commentaries, and press transcripts feature multiple speakers (directors, designers, engineers) and require clean transcripts for marketing logs and press kits.
*   **Manual Friction:** Transcription services or manual sorting to assign text to specific speakers.
*   **Emergentic Automation Fit:** Utilizing the modular transcription CLI (`transcribe_cli.py`) with Whisper models and speaker diarization heuristics to automatically split and label audio files programmatically.

---

## 5. B2B Prospecting Verdict

*   **Priority Score:** **32.0 / 37.5** (High Priority)
*   **Strategic Approach:** Pitch **Operational Automation** (ExtendScript, Python, FFmpeg) directly to Pawel Feldman. Frame the partnership as a way to **relieve the publishing division's multi-title marketing localization bottlenecks**, rather than focusing on generative game design (which conflicts with their strict IP-protection culture).
