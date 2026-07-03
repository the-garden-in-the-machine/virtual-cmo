# Walkthrough: Custom Instagram Scraper Integration

We have created a local, self-hosted Instagram profile scraper agent using Playwright, replacing the need for Apify.

---

## 🛠 What Was Built

1. **`save-instagram-session.js`**:
   * Opens Instagram in headed mode to let you log in and capture your session.
   * Saves cookies and storage state to `instagram-auth.json` to bypass guest login walls.
2. **`scrape-instagram.js`**:
   * Launches Playwright with your saved session credentials.
   * Leverages Instagram's internal web API endpoint (`/api/v1/users/web_profile_info/`) directly from the page context.
   * Employs random human-like pacing delays (5 to 10 seconds) between requests to protect your account.
   * Outputs a clean JSON array of scraped results to `stdout` (for n8n to ingest).
3. **`instagram-auth.json`**:
   * Your current active Instagram session token/cookie storage.

---

## 📊 Verification Results

We successfully verified the scraper by running:
```bash
node scrape-instagram.js --usernames instagram
```

**Stdout Result:**
```json
[
  {
    "id": "25025320",
    "username": "instagram",
    "full_name": "Instagram",
    "biography": "Discover what's new on Instagram 🔎✨",
    "follower_count": 685895814,
    "following_count": 217,
    "media_count": 8476,
    "is_verified": true,
    "is_private": false,
    "is_business": false,
    "profile_pic_url": "https://scontent-...",
    "external_url": "http://help.instagram.com/",
    "category": null,
    "scraped": "TRUE"
  }
]
```

---

## 🔁 How to Integrate with your n8n Workflow

Follow these steps in your n8n workspace to transition away from Apify:

### Step 1: Replace the Apify HTTP Request Node
1. Delete the **`call apify actor`** node.
2. In its place, add an **`Execute Command`** node.

### Step 2: Configure the Execute Command Node
1. Double-click the **Execute Command** node.
2. Set the **Command** field to (using n8n expressions):
   ```bash
   node "Playwright/scrape-instagram.js" --usernames "{{ $json.username.join(',') }}"
   ```

### Step 3: Parse the Output JSON in n8n
The **Execute Command** node returns an object like this:
```json
{
  "stdout": "[\n  {\n    \"id\": \"25025320\", ...\n  }\n]",
  "stderr": "Launching browser...",
  "exitCode": 0
}
```

To parse `stdout` into structured n8n items (so that the downstream **`Append Full Profiles`** and **`Mark Username as Scraped`** nodes continue working seamlessly):

1. Directly after the **Execute Command** node, add a **`Code`** node.
2. Set the code type to **Run Once for All Items** (Javascript).
3. Paste the following snippet:
   ```javascript
   const rawStdout = $input.first().json.stdout;
   try {
     return JSON.parse(rawStdout);
   } catch (error) {
     return [{ error: true, message: "Failed to parse scraper output", details: error.message }];
   }
   ```
4. Connect the output of this Code node to your downstream **`Append full profiles on sheet`** and **`mark user name as scraped`** nodes.

---

## 📅 Profile Analysis: @fuserstudio (May 8, 2026 - June 8, 2026)

We successfully mapped and documented the posts from **fuserstudio** over the past month.

### Key Metrics:
- **Total Posts:** 12
- **Total Images:** 23
- **Total Videos:** 14
- **Total Clean Comments Extracted:** 17

### Documented File:
The detailed analysis with dates, captions, comments, and links to captured screenshots is saved in:
👉 [fuser_posts_month.md](file://~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/fuser_posts_month.md)

Screenshots have been saved locally in the artifacts directory (`~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/post_{code}.png`) and are embedded in the markdown document.

---

## 📅 Profile Analysis: @marshmallowlaserfeast (May 8, 2026 - June 8, 2026)

We successfully mapped and documented the posts from **marshmallowlaserfeast** over the past month.

### Key Metrics:
- **Total Posts:** 6
- **Total Images:** 18
- **Total Videos:** 4
- **Total Clean Comments Extracted:** 36

### Documented File:
The detailed analysis with dates, captions, comments, and links to captured screenshots is saved in:
👉 [marshmallow_posts_month.md](file://~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/marshmallow_posts_month.md)

Screenshots have been saved locally in the artifacts directory (`~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/post_{code}.png`) and are embedded in the markdown document.

---

## 📅 Media Pipeline Audit & CLI Refactoring

We successfully audited the media pipeline files in [Media/](file://Agent_Operations/Pipelines/Media) and refactored them into four modular, "Hermes-ready" CLI scripts. A detailed report of the audit and verification results is saved in:
👉 [media_scout_audit.md](file://Agent_Operations/Execution_Logs/media_scout_audit.md)

### Refactored CLI Scripts:
* [media_downloader_cli.py](file://Agent_Operations/Pipelines/Media/media_downloader_cli.py) — Downloads, trims, and extracts audio.
* [transcribe_cli.py](file://Agent_Operations/Pipelines/Media/transcribe_cli.py) — Whisper transcription with reaction-word diarization heuristics.
* [frame_extractor_cli.py](file://Agent_Operations/Pipelines/Media/frame_extractor_cli.py) — Deterministic video frame extractor.
* [comfy_video_gen_cli.py](file://Agent_Operations/Pipelines/Media/comfy_video_gen_cli.py) — Parameterizes and executes ComfyUI Image-to-Video API generation.

### Dry-Run Verification:
* **Media Downloader:** Verified (Outputs mock downloaded/trimmed paths).
* **Transcription & Diarization:** Verified (Outputs mock SRT/TXT/JSON segments).
* **Frame Extractor:** Verified (Outputs mock extracted frame paths).
* **ComfyUI Video Generator:** Verified (Successfully compiles the Wan 2.2 Image-to-Video JSON API payload).



