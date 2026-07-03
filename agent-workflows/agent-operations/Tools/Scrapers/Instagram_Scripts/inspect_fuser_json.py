import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/fuser_raw.json", "r") as f:
    data = json.load(f)

# Let's print the top level keys
print("Top keys:", list(data.keys()))
if "data" in data:
    print("data keys:", list(data["data"].keys()))
    if "user" in data["data"]:
        user = data["data"]["user"]
        print("user keys:", list(user.keys()))
        for k, v in user.items():
            if isinstance(v, dict):
                print(f"- {k}: dict, keys: {list(v.keys())}")
            elif isinstance(v, list):
                print(f"- {k}: list, len: {len(v)}")
            else:
                print(f"- {k}: {type(v)} (preview: {str(v)[:100]})")
