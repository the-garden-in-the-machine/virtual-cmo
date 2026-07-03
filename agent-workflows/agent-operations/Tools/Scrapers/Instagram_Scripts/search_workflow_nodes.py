import json
import re

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "r") as f:
    state = json.load(f)

keywords = ["googleSheetsOAuth2Api", "Limit", "Aggregate", "Call Apify Actor", "Append Full Profiles", "Mark Username as Scraped"]

def find_keywords(obj, path="root"):
    results = []
    if isinstance(obj, str):
        for kw in keywords:
            if kw.lower() in obj.lower():
                results.append((path, kw, obj[:200]))
    elif isinstance(obj, dict):
        for k, v in obj.items():
            for kw in keywords:
                if kw.lower() in str(k).lower():
                    results.append((path + "." + str(k), kw, str(v)[:200]))
            results.extend(find_keywords(v, path + "." + str(k)))
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            results.extend(find_keywords(item, path + f"[{i}]"))
    return results

matches = find_keywords(state)
print(f"Found {len(matches)} keyword matches in nuxt_resolved.json:")
for p, kw, preview in matches[:20]:
    print(f"- Path: {p}\n  Keyword: {kw}\n  Preview: {preview}\n")
