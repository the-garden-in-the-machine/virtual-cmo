import json
import re

# Load raw html
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/.system_generated/steps/3/content.md", "r", encoding="utf-8") as f:
    html_content = f.read()

# Load resolved state
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "r") as f:
    state = json.load(f)

# Search for "GetUsernames" or "CallApifyActor" in the resolved state
def search_object(obj, path="root"):
    matches = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == "GetUsernames" or k == "CallApifyActor" or v == "GetUsernames" or v == "CallApifyActor":
                matches.append((path + "." + str(k), v))
            elif isinstance(v, (dict, list)):
                matches.extend(search_object(v, path + "." + str(k)))
            elif isinstance(v, str) and ("GetUsernames" in v or "CallApifyActor" in v):
                matches.append((path + "." + str(k), v[:200]))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if item == "GetUsernames" or item == "CallApifyActor":
                matches.append((path + f"[{i}]", item))
            elif isinstance(item, (dict, list)):
                matches.extend(search_object(item, path + f"[{i}]"))
            elif isinstance(item, str) and ("GetUsernames" in item or "CallApifyActor" in item):
                matches.append((path + f"[{i}]", item[:200]))
    return matches

print("Searching resolved Nuxt state...")
state_matches = search_object(state)
print(f"Found {len(state_matches)} matches in Nuxt state:")
for p, v in state_matches[:10]:
    print(f"- Path: {p}\n  Val: {v}\n")

# Let's search raw html for these strings and print the context (e.g. 500 characters around it)
print("\nSearching raw HTML for 'GetUsernames'...")
for m in re.finditer(r'GetUsernames|CallApifyActor', html_content):
    start = max(0, m.start() - 100)
    end = min(len(html_content), m.end() + 200)
    print(f"Match at index {m.start()}:")
    print(html_content[start:end])
    print("-" * 50)
