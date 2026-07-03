import os
import json
import datetime

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
files = [f for f in os.listdir(scratch_dir) if f.startswith("intercepted_") and f.endswith(".json")]

all_posts = {}

for fn in files:
    path = os.path.join(scratch_dir, fn)
    try:
        with open(path, "r", encoding="utf-8") as f:
            js = json.load(f)
        
        # Check if it has the timeline connection
        data = js.get("data", {})
        if not data:
            continue
            
        conn = data.get("xdt_api__v1__feed__user_timeline_graphql_connection")
        if not conn:
            continue
            
        edges = conn.get("edges", [])
        for edge in edges:
            node = edge.get("node", {})
            pk = node.get("pk")
            if pk:
                all_posts[pk] = node
    except Exception as e:
        pass

# Today is June 8, 2026
now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
one_month_ago = now - datetime.timedelta(days=31)
one_month_ago_ts = one_month_ago.timestamp()

# Filter and sort
sorted_posts = sorted(all_posts.values(), key=lambda x: x.get("taken_at", 0), reverse=True)

recent_posts = [p for p in sorted_posts if p.get("taken_at", 0) >= one_month_ago_ts]

print(f"Scraping results for the past month (since {one_month_ago.strftime('%Y-%m-%d')}):")
print(f"Total Posts: {len(recent_posts)}")

total_images = 0
total_videos = 0

for i, post in enumerate(recent_posts):
    taken_at = post.get("taken_at")
    dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
    code = post.get("code")
    media_type = post.get("media_type")
    
    images = 0
    videos = 0
    
    if media_type == 1:
        images = 1
    elif media_type == 2:
        videos = 1
    elif media_type == 8:
        for item in post.get("carousel_media", []):
            m_type = item.get("media_type")
            if m_type == 1:
                images += 1
            elif m_type == 2:
                videos += 1
                
    total_images += images
    total_videos += videos
    
    caption_text = post.get("caption", {}).get("text", "") if post.get("caption") else ""
    cap_preview = caption_text.replace("\n", " ")[:60]
    
    print(f"{i+1}. Code: {code} | Date: {dt.strftime('%Y-%m-%d %H:%M:%S')} | Images: {images} | Videos: {videos} | Preview: {cap_preview}")

print("\nSummary of media counts in the past month:")
print(f"- Unique Posts: {len(recent_posts)}")
print(f"- Total Images: {total_images}")
print(f"- Total Videos: {total_videos}")
