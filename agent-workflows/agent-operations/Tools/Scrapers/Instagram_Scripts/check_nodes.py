import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_data.json", "r") as f:
    wf = json.load(f)

nodes = wf.get("nodes", [])
print(f"Type of nodes: {type(nodes)}")
print(f"Length of nodes: {len(nodes)}")
if len(nodes) > 0:
    print("First node object keys and content:")
    first_node = nodes[0]
    print(type(first_node))
    print(first_node)

# Let's check other keys in the wf dictionary
print("\nKeys in wf dictionary:")
for k, v in wf.items():
    print(f"- {k}: {type(v)} (preview: {str(v)[:100]})")
