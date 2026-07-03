import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_data.json", "r") as f:
    wf = json.load(f)

print("Workflow Name:", wf.get("name"))
print("Workflow Description:", wf.get("description"))

nodes = wf.get("nodes", [])
print(f"Number of nodes: {len(nodes)}")

for i, node in enumerate(nodes):
    print(f"\n--- Node {i+1}: {node.get('name')} ({node.get('type')}) ---")
    print("Parameters:", json.dumps(node.get("parameters"), indent=2))
    # Let's inspect position and other metadata if relevant
    # but the key is type, name, parameters.

# Let's write a file listing the summary of the nodes and their parameters for review.
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nodes_summary.txt", "w") as out:
    out.write(f"Workflow: {wf.get('name')}\n")
    out.write(f"Description: {wf.get('description')}\n\n")
    out.write("Nodes List:\n")
    for node in nodes:
        out.write(f"- {node.get('name')} ({node.get('type')})\n")
        out.write(f"  Parameters: {json.dumps(node.get('parameters'))}\n")
