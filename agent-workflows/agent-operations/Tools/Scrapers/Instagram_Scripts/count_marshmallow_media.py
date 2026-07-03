import json
import datetime

filepath = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_raw.json"
scraped_codes = ["DZVaqzQDFww", "DZRaTk7k27T", "DZMhN-cOrcF", "DYT1czHE7wO", "DYO8bZzs_DG", "DYFRi7yAjx6"]

with open(filepath, "r") as f:
    data = json.load(f)

edges = data["data"]["xdt_api__v1__feed__user_timeline_graphql_connection"]["edges"]

post_data = {}
total_images = 0
total_videos = 0

for edge in edges:
    node = edge["node"]
    code = node["code"]
    if code in scraped_codes:
        media_type = node.get("media_type")
        taken_at = node.get("taken_at")
        dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
        
        images = 0
        videos = 0
        
        if media_type == 1:
            images = 1
        elif media_type == 2:
            videos = 1
        elif media_type == 8:
            carousel = node.get("carousel_media", [])
            if carousel:
                for item in carousel:
                    m_type = item.get("media_type")
                    if m_type == 1:
                        images += 1
                    elif m_type == 2:
                        videos += 1
            else:
                carousel_count = node.get("carousel_media_count", 0)
                images = carousel_count
                
        post_data[code] = {
            "date": dt.strftime('%Y-%m-%d'),
            "media_type": media_type,
            "images": images,
            "videos": videos
        }
        total_images += images
        total_videos += videos

print("Media Info for marshmallowlaserfeast:")
for code in scraped_codes:
    info = post_data.get(code)
    print(f"- Post: {code} | Date: {info['date']} | Type: {info['media_type']} | Images: {info['images']} | Videos: {info['videos']}")

print(f"\nSummary:")
print(f"Total Posts: {len(scraped_codes)}")
print(f"Total Images: {total_images}")
print(f"Total Videos: {total_videos}")

# Save this media info to marshmallow_media_info.json
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_media_info.json", "w") as f:
    json.dump(post_data, f, indent=2)
