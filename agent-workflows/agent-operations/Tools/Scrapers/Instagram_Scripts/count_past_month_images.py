import json
import datetime

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/intercepted_1780985671112.json", "r") as f:
    js = json.load(f)

edges = js["data"]["xdt_api__v1__feed__user_timeline_graphql_connection"]["edges"]

now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
one_month_ago_ts = (now - datetime.timedelta(days=31)).timestamp()

posts_count = 0
total_images = 0
total_videos = 0

print("Detailed posts from past month:")
for i, edge in enumerate(edges):
    node = edge["node"]
    taken_at = node["taken_at"]
    if taken_at < one_month_ago_ts:
        continue
    
    posts_count += 1
    code = node["code"]
    media_type = node["media_type"]
    dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
    
    # Analyze media
    # media_type 1: image
    # media_type 2: video
    # media_type 8: carousel
    images = 0
    videos = 0
    
    if media_type == 1:
        images = 1
    elif media_type == 2:
        videos = 1
    elif media_type == 8:
        for item in node.get("carousel_media", []):
            m_type = item.get("media_type")
            if m_type == 1:
                images += 1
            elif m_type == 2:
                videos += 1
                
    total_images += images
    total_videos += videos
    
    print(f"- Post: {code} | Date: {dt.strftime('%Y-%m-%d')} | Type: {media_type} | Images: {images} | Videos: {videos}")

print("\nSummary for the Past Month:")
print(f"Total Posts: {posts_count}")
print(f"Total Images: {total_images}")
print(f"Total Videos: {total_videos}")
