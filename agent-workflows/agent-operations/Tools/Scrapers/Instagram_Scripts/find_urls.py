import json
import re

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "r") as f:
    state = json.load(f)

# Find all strings that look like URLs or paths
urls = []
def find_strings_with_pattern(obj):
    results = []
    if isinstance(obj, str):
        if "/" in obj or "http" in obj or "api" in obj or "json" in obj:
            results.append(obj)
    elif isinstance(obj, dict):
        for k, v in obj.items():
            results.extend(find_strings_with_pattern(k))
            results.extend(find_strings_with_pattern(v))
    elif isinstance(obj, list):
        for item in obj:
            results.extend(find_strings_with_pattern(item))
    return results

all_strings = find_strings_with_pattern(state)
# Deduplicate
all_strings = list(set(all_strings))

print(f"Found {len(all_strings)} URL/path-like strings in the state. Printing some:")
for s in sorted(all_strings)[:50]:
    print(s)
