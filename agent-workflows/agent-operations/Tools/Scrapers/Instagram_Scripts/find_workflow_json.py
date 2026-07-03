import json
import re

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/.system_generated/steps/3/content.md", "r", encoding="utf-8") as f:
    html_content = f.read()

# Let's search for script tags or JSON-like blocks that contain "nodes" and "connections"
# and look like an n8n workflow.
# n8n workflows typically have a structure with "nodes": [...] and "connections": {...}

# First, look for any json in <script> tags. Nuxt pages often use <script id="__NUXT_DATA__" type="application/json"> or similar.
# Let's search for script tags.
script_blocks = re.findall(r'<script[^>]*>(.*?)</script>', html_content, re.DOTALL)
print(f"Found {len(script_blocks)} script blocks.")

for i, block in enumerate(script_blocks):
    if '"nodes"' in block or '"connections"' in block:
        print(f"Script block {i} matches 'nodes' or 'connections'. Length: {len(block)}")
        # Let's save a preview of it
        print("Preview:")
        print(block[:500])
        print("...")
        # Write the whole block to a file
        with open(f"~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_script_{i}.txt", "w", encoding="utf-8") as out:
            out.write(block)

# Sometimes the Nuxt payload or some custom inline JS has the JSON.
# Let's also do a regex search for something starting with {"nodes":
# or similar, or check all strings in the code.
# In Nuxt 3, it could be __NUXT_DATA__ which is a list of mixed values.
# Let's search for the exact title of the template or workflow properties.
