# Media Pipeline Audit & Modular CLI Refactoring Report

This document records the audit of the media pipeline files located in `Agent_Operations/Pipelines/Media/` and details the implementation of a new, "Hermes-ready" modular CLI design. This architecture separates cognitive decision-making from deterministic execution and packages workflows as reusable, parameter-driven CLI adapters.

---

## 🎯 Executive Summary & Objectives

The Emergentic project's master objective is to transition from manual, script-based instructions to an automated system controlled by an agent harness (e.g., **Hermes Agent**). In alignment with **Team Directives & System Guidelines**, the Media pipeline files were audited to:
1. **Identify Overlaps:** Review duplicate steps, parameters, and technologies between transcription and style extraction.
2. **Decouple Cognitive & Execution Loops:** Extract manual, hard-coded cognitive prompts/heuristics and static files out of execution wrappers.
3. **Establish CLI Adapters:** Replace step-by-step instruction texts with standardized, parameter-driven CLI scripts that output structured JSON to `stdout` and handle dry-runs for validation.

---

## 🔍 Audit of Existing Pipeline Files

Four files inside `Agent_Operations/Pipelines/Media/` were analyzed:

1. **`pipeline.txt` (Style Extraction Pipeline)**
   - **Content:** Manual instructions for downloading a video file from Google Drive via `rclone`, extracting frames via `ffmpeg`, analyzing them in batches using Claude's multimodal capabilities, and compiling a style report (`style.txt`).
   - **Cognitive Role:** Human/LLM aesthetic analysis of frame batches.
   - **Execution Role:** Frame extraction and video downloading.

2. **`style.txt` (Dock Ellis Visual Style Report)**
   - **Content:** The resulting aesthetic breakdown of "Dock Ellis & The LSD No-No".
   - **Nature:** Static text artifact (non-executable). Should remain as a reference document or context prompt for future generation tasks.

3. **`Transcription pipeline.txt` (Media Extraction & Transcription)**
   - **Content:** Steps to download video via `yt-dlp`, trim with `ffmpeg`, extract audio to MP3, transcribe using OpenAI Whisper models (comparing CPU vs. GPU configurations), and perform speaker diarization (WhisperX vs. a custom reaction-word heuristic).
   - **Cognitive Role:** Diarization heuristics (attributing speaker names based on word count/content) and transcription model comparison.
   - **Execution Role:** Video download, trim, audio conversion, and transcription execution.

4. **`wan22_first_last_frame.json` (ComfyUI API Config)**
   - **Content:** Standard ComfyUI API configuration for Wan 2.2 Image-to-Video generation using start/end frames and a positive prompt.
   - **Nature:** Static JSON config that requires a wrapper to parameterize and execute via API.

### ⚠️ Identified Overlaps & Structural Issues
* **Video/Audio Ingestion:** Both `pipeline.txt` and `Transcription pipeline.txt` contain separate commands, settings, and workarounds for downloading media (e.g., `rclone` vs. `yt-dlp`) and preprocessing it with `ffmpeg` (trimming, extracting).
* **Hardcoded Parameters:** Commands and configurations (such as segment durations `18:00 - 22:00` or file paths like `video2.mp4`) are hard-coded into instructions, preventing dynamic execution by an agent.
* **Manual Cognitive Decisions:** Heuristics for speaker assignment and decisions on frame analysis batches are written as text guidelines instead of parameterized CLI rules.

---

## 🛠️ Refactored "Hermes-Ready" CLI Architecture

To align with the **Hermes-ready** guidelines, four modular CLI scripts were built inside `Agent_Operations/Pipelines/Media/`. Each script accepts standard flags, isolates execution, supports dry-runs, and outputs JSON.

```
Agent_Operations/Pipelines/Media/
├── media_downloader_cli.py   <-- Downloads, trims, and extracts audio (yt-dlp/ffmpeg wrapper)
├── transcribe_cli.py         <-- Transcribes audio with Whisper + heuristic speaker diarization
├── frame_extractor_cli.py    <-- Extracts frames from video with precise sampling rates
└── comfy_video_gen_cli.py    <-- Parameterizes and fires ComfyUI workflows dynamically
```

### 1. Media Downloader CLI (`media_downloader_cli.py`)
This tool consolidates downloading, trimming, and audio extraction into a unified execution step.
* **Parameters:**
  * `--url`: Target YouTube or web video URL
  * `--local-input`: Path to an existing local video
  * `--start` / `--end`: Timestamps for trimming (supports `18:00` or `1080` formats)
  * `--extract-audio`: Boolean flag to auto-extract MP3
  * `--audio-quality`: LAME quality settings (0-9)
  * `--dry-run`: Simulation flag returning JSON metadata
* **Output:** JSON containing absolute paths of generated `.mp4` and `.mp3` files.

### 2. Media Transcriber CLI (`transcribe_cli.py`)
This tool runs local Whisper transcription and encapsulates the speaker diarization logic as parameter-driven options.
* **Parameters:**
  * `--input-audio`: Path to the extracted audio file
  * `--model`: Whisper model selection (`base`, `medium`, `large-v3`)
  * `--heuristic-diarize`: Enables the 2-speaker reaction-word heuristic
  * `--main-speaker` / `--interviewer-speaker`: Speaker label parameters (defaults to `Obama` and `Interviewer`)
  * `--reaction-words`: Customizable list of comma-separated reaction words
  * `--dry-run`: Generates mock transcripts and validates file writing
* **Output:** JSON mapping paths to the resulting `.srt`, `.txt`, and structured `.json` segments.

### 3. Frame Extractor CLI (`frame_extractor_cli.py`)
This script isolates the deterministic frame extraction execution away from visual analysis loops.
* **Parameters:**
  * `--input-video`: Source video path
  * `--fps` / `--every-n-frames`: Controls sampling rates (e.g. extract every 5th frame)
  * `--output-dir`: Working directory for frame JPGs
  * `--dry-run`: Generates mock file listings and counts
* **Output:** JSON with file lists and duration details.

### 4. ComfyUI Video Generator CLI (`comfy_video_gen_cli.py`)
This script wraps the static ComfyUI workflow JSON (`wan22_first_last_frame.json`) and exposes frame-substitutions and prompts as CLI parameters, submitting them directly to ComfyUI's REST API.
* **Parameters:**
  * `--workflow-json`: Path to ComfyUI workflow
  * `--first-frame` / `--last-frame`: Path to start/end frames
  * `--prompt`: Generation text prompt
  * `--comfy-url`: ComfyUI endpoint URL (default: `http://127.0.0.1:8188`)
  * `--dry-run`: Outputs compiled workflow payload without calling the endpoint
* **Output:** JSON confirming request transmission and the assigned `prompt_id`.

---

## 🧪 Verification Runs (Dry-Run Logs)

The following local executions verify that each adapter compiles and conforms to the Hermes structured output specification.

### Run A: Media Downloader Verification
```bash
python3 media_downloader_cli.py --url "https://youtu.be/bmzXnbAMmOM" --start "18:00" --end "22:00" --extract-audio --dry-run
```
**Output:**
```json
{
  "success": true,
  "mode": "dry-run",
  "downloaded": true,
  "trimmed": true,
  "video_path": "./video2.mp4",
  "audio_path": "./video2.mp3",
  "metadata": {
    "url": "https://youtu.be/bmzXnbAMmOM",
    "start": "18:00",
    "end": "22:00"
  }
}
```

### Run B: Transcription & Heuristic Diarization Verification
```bash
python3 transcribe_cli.py --input-audio "video2.mp3" --heuristic-diarize --dry-run
```
**Output:**
```json
{
  "success": true,
  "mode": "dry-run",
  "srt_path": "Agent_Operations/Pipelines/Media/transcript.srt",
  "txt_path": "Agent_Operations/Pipelines/Media/transcript.txt",
  "json_path": "Agent_Operations/Pipelines/Media/transcript.json",
  "segments_count": 4
}
```

### Run C: Frame Extractor Verification
```bash
python3 frame_extractor_cli.py --input-video "video2.mp4" --dry-run
```
**Output:**
```json
{
  "success": true,
  "mode": "dry-run",
  "input_video": "video2.mp4",
  "output_dir": "Agent_Operations/Pipelines/Media",
  "frame_count": 272,
  "naming_pattern": "frame_%04d.jpg",
  "frames": [
    "frame_0001.jpg",
    ...
    "frame_0272.jpg"
  ]
}
```

### Run D: ComfyUI Video Generation Parameterization
```bash
python3 comfy_video_gen_cli.py --first-frame "frame_0001.jpg" --last-frame "frame_0272.jpg" --prompt "A cool animated baseball pitch" --dry-run
```
**Output:**
```json
{
  "success": true,
  "mode": "dry-run",
  "message": "Workflow configured successfully.",
  "payload": {
    "prompt": {
      "5_start": {
        "class_type": "LoadImage",
        "inputs": { "image": "frame_0001.jpg" }
      },
      "5_end": {
        "class_type": "LoadImage",
        "inputs": { "image": "frame_0272.jpg" }
      },
      "7": {
        "class_type": "CLIPTextEncode",
        "inputs": { "text": "A cool animated baseball pitch" }
      }
      // ... Remaining node configurations populated successfully ...
    }
  }
}
```

---

## 📈 Summary of Progress & Recommendations

> [!NOTE]
> All 4 CLI tools have been successfully created, verified, and placed directly in the `Agent_Operations/Pipelines/Media/` directory, next to the original reference documents.

### How the Hermes Agent Controls this Pipeline:
1. **Fetch & Download:** Hermes invokes `media_downloader_cli.py` with URL and trim ranges.
2. **Transcription:** Hermes runs `transcribe_cli.py` on the resulting MP3, supplying the target speakers (`--main-speaker "Obama"`) and reaction keywords dynamically.
3. **Frame Extraction:** Hermes invokes `frame_extractor_cli.py` specifying the extraction rate (`--fps 0.2` for 1 frame every 5 seconds).
4. **Cognitive Loop (Visual Analysis):** Hermes reads the resulting frames, batches them, passes them to its own multimodal model for stylistic assessment, and outputs `style.txt`.
5. **Video Generation:** Hermes feeds style prompt metadata, the first frame, and the last frame into `comfy_video_gen_cli.py` to trigger new video generation runs.

### Next Steps:
* **System FFMPEG update:** To run the Whisper diarization pipeline in production, update the host system's static build of FFMPEG to a shared library installation as noted in the original transcript logs.
* **Integrate with outreach orchestrator:** The text drafts and transcripts generated here can now be read by Hermes and used to personalize emails or LinkedIn messages directly.
