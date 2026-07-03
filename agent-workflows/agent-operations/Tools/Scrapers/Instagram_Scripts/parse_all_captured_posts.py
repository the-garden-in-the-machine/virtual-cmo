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

print(f"Total unique posts loaded: {len(all_posts)}")

# Let's sort the posts by taken_at descending (latest first)
sorted_posts = sorted(all_posts.values(), key=lambda x: x.get("taken_at", 0), reverse=True)

now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
one_month_ago = now - datetime.timedelta(days=31)
one_month_ago_ts = one_month_ago.timestamp()

print(f"Current Date: {now.strftime('%Y-%m-%d')}")
print(f"Scrape boundary (1 month ago): {one_month_ago.strftime('%Y-%m-%d')}\n")

posts_in_past_month = 0
total_images = 0

for i, post in enumerate(sorted_posts):
    taken_at = post.get("taken_at")
    dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
    caption_text = post.get("caption", {}).get("text", "") if post.get("caption") else ""
    cap_preview = caption_text.replace("\n", " ")[:60]
    
    # Count images in this post
    media_type = post.get("media_type")
    # media_type 1: Single image, 2: Video, 8: Carousel (carousel_media)
    images_in_post = 0
    if media_type == 1:
        images_in_post = 1
    elif media_type == 8:
        # Check carousel_media items
        carousel = post.get("carousel_media", [])
        for item in carousel:
            # item.media_type 1 is image, 2 is video
            if item.get("media_type") == 1:
                images_in_post += 1
    
    total_images += images_in_post
    
    is_recent = taken_at >= one_month_ago_ts
    status = "PAST MONTH" if is_recent else "OLDER"
    if is_recent:
        posts_in_past_month += 1
        
    print(f"[{i+1}] Date: {dt.strftime('%Y-%m-%d %H:%M:%S')} | Code: {post.get('code')} | {status} | Images: {images_in_post} | Caption: {cap_preview}")

print(f"\n==========================================")
print(f"Total Unique Posts Scraped: {len(sorted_posts)}")
print(f"Posts in past month: {posts_in_past_month}")
print(f"Total Images across these posts: {total_images}")
