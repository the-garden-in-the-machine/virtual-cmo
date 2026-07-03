import json
import re

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_script_4.txt", "r", encoding="utf-8") as f:
    raw_data = f.read()

try:
    data = json.loads(raw_data)
except Exception as e:
    print(f"Failed to load JSON: {e}")
    # Sometimes it's wrapped in javascript, e.g. window.__NUXT__ = ...
    # Let's extract the array part if so
    match = re.search(r'\[.*\]', raw_data, re.DOTALL)
    if match:
        data = json.loads(match.group(0))
    else:
        raise e

print(f"Nuxt data is a list of length: {len(data)}")

# Let's look for any dictionary that has "nodes" and "connections"
# Nuxt 3 serializes objects by indexing them. It represents an array where elements refer to other indexes.
# Let's search for the string "nodes" or "connections" in the array elements to see which indices they are.
for idx, val in enumerate(data):
    if isinstance(val, str):
        if "nodes" == val or "connections" == val:
            print(f"String '{val}' found at index {idx}")
        if "Google Sheets" in val or "Apify" in val:
            # print first 100 chars
            print(f"Index {idx}: {val[:100]}")

# Let's search for a string that starts with '{' and contains '"nodes"'
for idx, val in enumerate(data):
    if isinstance(val, str) and val.strip().startswith('{') and '"nodes"' in val:
        print(f"JSON-like string at index {idx}:")
        print(val[:500])
        # Let's save this string as a workflow.json!
        try:
            parsed_wf = json.loads(val)
            with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow.json", "w") as wf_out:
                json.dump(parsed_wf, wf_out, indent=2)
            print("Successfully extracted and saved workflow.json!")
        except Exception as err:
            print(f"Failed parsing string as JSON: {err}")

# Also check if there is a dict that has 'code' key that is a JSON string
# Let's write a recursive resolver for Nuxt 3 transport format if we can't find it easily.
# Nuxt 3 uses a flat array where the first element is the root or references.
# Let's find any string that is valid JSON containing nodes and connections.
