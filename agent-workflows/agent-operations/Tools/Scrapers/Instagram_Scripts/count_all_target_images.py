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

post_data = {}

for filename in os.listdir(scratch_dir):
    if filename.startswith("intercepted_") and filename.endswith(".json"):
        filepath = os.path.join(scratch_dir, filename)
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            
            def find_media_info(obj):
                if isinstance(obj, dict):
                    if "code" in obj and "taken_at" in obj:
                        code = obj["code"]
                        if code in scraped_codes:
                            # Extract media type and carousel media count
                            media_type = obj.get("media_type")
                            taken_at = obj.get("taken_at")
                            
                            images = 0
                            videos = 0
                            
                            if media_type == 1:
                                images = 1
                            elif media_type == 2:
                                videos = 1
                            elif media_type == 8:
                                carousel = obj.get("carousel_media", [])
                                if carousel:
                                    for item in carousel:
                                        m_type = item.get("media_type")
                                        if m_type == 1:
                                            images += 1
                                        elif m_type == 2:
                                            videos += 1
                                else:
                                    # Fallback if carousel_media is empty but carousel_media_count exists
                                    carousel_count = obj.get("carousel_media_count", 0)
                                    images = carousel_count # assume images if not specified
                            
                            post_data[code] = {
                                "date": datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc).strftime('%Y-%m-%d'),
                                "media_type": media_type,
                                "images": images,
                                "videos": videos
                            }
                    for k, v in obj.items():
                        find_media_info(v)
                elif isinstance(obj, list):
                    for item in obj:
                        find_media_info(item)
            
            find_media_info(data)
        except Exception as e:
            pass

print("Target Posts Media Count:")
total_images = 0
total_videos = 0
for code in scraped_codes:
    info = post_data.get(code)
    if info:
        print(f"- Post: {code} | Date: {info['date']} | Type: {info['media_type']} | Images: {info['images']} | Videos: {info['videos']}")
        total_images += info['images']
        total_videos += info['videos']
    else:
        print(f"- Post: {code} | Info NOT found")

print(f"\nSummary for all 12 posts:")
print(f"Total Posts: {len(scraped_codes)}")
print(f"Total Images: {total_images}")
print(f"Total Videos: {total_videos}")

# Save the details to target_media_info.json
with open(os.path.join(scratch_dir, "target_media_info.json"), "w") as f:
    json.dump(post_data, f, indent=2)
