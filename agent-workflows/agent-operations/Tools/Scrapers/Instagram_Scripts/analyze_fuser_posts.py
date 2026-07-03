import json
import datetime

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/fuser_raw.json", "r") as f:
    data = json.load(f)

user = data.get("data", {}).get("user", {})
if not user:
    print("No user data found!")
    exit(1)

print("Username:", user.get("username"))
print("Full Name:", user.get("full_name"))
print("Followers:", user.get("edge_followed_by", {}).get("count"))
print("Total Posts (Media Count):", user.get("edge_owner_to_timeline_media", {}).get("count"))

timeline = user.get("edge_owner_to_timeline_media", {})
edges = timeline.get("edges", [])
print(f"Number of posts returned in this query: {len(edges)}")

# Today's date is 2026-06-08.
# Past month date is 2026-05-08.
now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
one_month_ago = now - datetime.timedelta(days=31)
one_month_ago_timestamp = one_month_ago.timestamp()

print(f"Analyzing posts since {one_month_ago.strftime('%Y-%m-%d')} (timestamp: {one_month_ago_timestamp})...")

posts_in_past_month = 0
older_posts = 0

for i, edge in enumerate(edges):
    node = edge.get("node", {})
    timestamp = node.get("taken_at_timestamp")
    post_date = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)
    caption_edges = node.get("edge_media_to_caption", {}).get("edges", [])
    caption = caption_edges[0].get("node", {}).get("text", "") if caption_edges else ""
    # Truncate caption for logging
    cap_preview = caption.replace("\n", " ")[:60]
    
    is_in_past_month = timestamp >= one_month_ago_timestamp
    if is_in_past_month:
        posts_in_past_month += 1
        print(f"[{i+1}] Date: {post_date.strftime('%Y-%m-%d %H:%M:%S')} (PAST MONTH) - Caption: {cap_preview}")
    else:
        older_posts += 1
        print(f"[{i+1}] Date: {post_date.strftime('%Y-%m-%d %H:%M:%S')} (OLDER) - Caption: {cap_preview}")

print(f"\nSummary of first page:")
print(f"- Posts in past month: {posts_in_past_month}")
print(f"- Older posts: {older_posts}")
print(f"- Has next page: {timeline.get('page_info', {}).get('has_next_page')}")
