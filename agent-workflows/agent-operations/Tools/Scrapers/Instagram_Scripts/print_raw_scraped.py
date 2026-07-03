import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/scraped_details.json", "r") as f:
    data = json.load(f)

for post in data:
    if post.get("code") == "DZN6nbkEq5g":
        print(json.dumps(post, indent=2))
