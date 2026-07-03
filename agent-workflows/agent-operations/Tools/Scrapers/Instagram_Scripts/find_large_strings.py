import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "r") as f:
    state = json.load(f)

large_strings = []

def find_large_strings(obj, path="root"):
    if isinstance(obj, str):
        if len(obj) > 100:
            large_strings.append((path, len(obj), obj[:300]))
    elif isinstance(obj, dict):
        for k, v in obj.items():
            find_large_strings(v, path + "." + str(k))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            find_large_strings(item, path + f"[{i}]")

find_large_strings(state)
# Sort by length descending
large_strings.sort(key=lambda x: x[1], reverse=True)

print(f"Found {len(large_strings)} strings > 100 chars:")
for path, length, preview in large_strings[:10]:
    print(f"Path: {path} (length: {length})")
    print(f"Preview: {preview}\n" + "="*50)
