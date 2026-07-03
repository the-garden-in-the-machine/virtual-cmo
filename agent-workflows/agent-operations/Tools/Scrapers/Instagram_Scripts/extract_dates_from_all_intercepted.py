import json
import os
import datetime

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
scraped_codes = [
  "DZN6nbkEq5g",
  "DZJWLBnxjFX",
  "DY0I_NqPYtj",
  "DZGeBjcAQPV",
  "DY2xlOzHbhJ",
  "DYnYr-KyFZ1",
  "DYpFAwzkfXC",
  "DYh6hcipZCf",
  "DYfStMpuEMu",
  "DYfh4VRHbNS",
  "DYkcjIwEWO8",
  "DYQacz9PwzL"
]

code_dates = {}

for filename in os.listdir(scratch_dir):
    if filename.startswith("intercepted_") and filename.endswith(".json"):
        filepath = os.path.join(scratch_dir, filename)
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            
            # Helper to search for code & taken_at recursively in json
            def find_media_info(obj):
                if isinstance(obj, dict):
                    if "code" in obj and "taken_at" in obj:
                        code = obj["code"]
                        taken_at = obj["taken_at"]
                        if code in scraped_codes:
                            code_dates[code] = taken_at
                    for k, v in obj.items():
                        find_media_info(v)
                elif isinstance(obj, list):
                    for item in obj:
                        find_media_info(item)
            
            find_media_info(data)
        except Exception as e:
            pass

print("Extracted Dates for target posts:")
for code in scraped_codes:
    ts = code_dates.get(code)
    if ts:
        dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc)
        print(f"Code: {code} | Date: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')} | Timestamp: {ts}")
else:
    # Also save the mapping to a json file
    with open(os.path.join(scratch_dir, "post_dates.json"), "w") as f:
        json.dump(code_dates, f, indent=2)
