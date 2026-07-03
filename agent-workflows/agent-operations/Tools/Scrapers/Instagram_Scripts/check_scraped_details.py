import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/scraped_details.json", "r") as f:
    data = json.load(f)

print(f"Total posts scraped: {len(data)}")
for i, post in enumerate(data):
    print(f"\n--- Post {i+1} ({post.get('code')}) ---")
    print(f"Author: {post.get('author')}")
    print(f"Caption: {post.get('caption')}")
    print(f"Comments Count: {len(post.get('comments', []))}")
    for c in post.get('comments', [])[:3]:
        print(f"  * {c.get('author')}: {c.get('text')}")
