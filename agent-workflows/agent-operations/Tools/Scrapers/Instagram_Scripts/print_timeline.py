import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/fuser_raw.json", "r") as f:
    data = json.load(f)

timeline = data["data"]["user"]["edge_owner_to_timeline_media"]
print("Count:", timeline.get("count"))
print("Page Info:", timeline.get("page_info"))
print("Edges type:", type(timeline.get("edges")))
print("Edges length:", len(timeline.get("edges")))
if len(timeline.get("edges")) > 0:
    print("First edge:", str(timeline.get("edges")[0])[:500])
else:
    print("No edges in timeline! Let's check if there are other keys like edge_felix_video_timeline or edge_owner_to_timeline_media has empty edges because of login issues or Instagram obfuscation.")
