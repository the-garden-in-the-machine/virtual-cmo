import json
import os
import datetime

filepath = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_raw.json"

with open(filepath, "r") as f:
    data = json.load(f)

# Let's search recursively for nodes containing user media list
found_nodes = []

def search_nodes(obj, path=""):
    if isinstance(obj, dict):
        if "edges" in obj and isinstance(obj["edges"], list):
            # Check if edges elements look like Instagram media edges
            edges = obj["edges"]
            if len(edges) > 0:
                first_edge = edges[0]
                if isinstance(first_edge, dict) and "node" in first_edge:
                    node = first_edge["node"]
                    if "code" in node and "taken_at" in node:
                        found_nodes.append((path, obj["edges"]))
        for k, v in obj.items():
            search_nodes(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            search_nodes(item, f"{path}[{i}]")

search_nodes(data)

print(f"Found {len(found_nodes)} lists of media edges.")
for path, edges in found_nodes:
    print(f"\nPath: {path} | Edges: {len(edges)}")
    
    # Filter for the past month (since May 8, 2026)
    now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
    one_month_ago_ts = (now - datetime.timedelta(days=31)).timestamp()
    
    posts_in_month = []
    for edge in edges:
        node = edge["node"]
        taken_at = node["taken_at"]
        code = node["code"]
        dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
        
        is_past_month = taken_at >= one_month_ago_ts
        posts_in_month.append((code, dt.strftime('%Y-%m-%d'), taken_at, is_past_month))
        
    print("Posts:")
    for code, date_str, ts, is_past in posts_in_month:
        status = "IN PAST MONTH" if is_past else "OLDER"
        print(f"  - Post: {code} | Date: {date_str} | Status: {status} | Timestamp: {ts}")
        
    # Let's save the codes that are in the past month to visited_codes.json
    past_month_codes = [code for code, _, _, is_past in posts_in_month if is_past]
    if past_month_codes:
        out_path = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/marshmallow_visited_codes.json"
        with open(out_path, "w") as out_f:
            json.dump(past_month_codes, out_f, indent=2)
        print(f"\nSaved {len(past_month_codes)} post codes from past month to marshmallow_visited_codes.json")
