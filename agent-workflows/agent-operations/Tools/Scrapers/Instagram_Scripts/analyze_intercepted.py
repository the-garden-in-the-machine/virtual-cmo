import os
import json
import datetime

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
files = [f for f in os.listdir(scratch_dir) if f.startswith("intercepted_") and f.endswith(".json")]

print(f"Checking {len(files)} files...")

for fn in files:
    path = os.path.join(scratch_dir, fn)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if not content.strip():
            continue
            
        # Try loading as json
        js = json.loads(content)
        
        # Check if it has a typical graphql signature for user timeline
        # or references to fuserstudio or has a count / edges structure
        found_data = False
        
        def find_edges(obj, p=""):
            results = []
            if isinstance(obj, dict):
                if "edges" in obj and isinstance(obj["edges"], list) and len(obj["edges"]) > 0:
                    # check if the nodes have taken_at_timestamp or similar
                    first_node = obj["edges"][0].get("node", {})
                    if "taken_at_timestamp" in first_node or "display_url" in first_node:
                        results.append((p + ".edges", obj["edges"]))
                for k, v in obj.items():
                    results.extend(find_edges(v, p + "." + k))
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    results.extend(find_edges(item, p + f"[{i}]"))
            return results

        edges_list = find_edges(js)
        if edges_list:
            print(f"\n==================================================")
            print(f"File: {fn} (Size: {os.path.getsize(path)} bytes)")
            for path_str, edges in edges_list:
                print(f"Found {len(edges)} edges at path: {path_str}")
                # Print preview of first edge
                node = edges[0].get("node", {})
                timestamp = node.get("taken_at_timestamp")
                if timestamp:
                    dt = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)
                    print(f"  First post date: {dt.strftime('%Y-%m-%d %H:%M:%S')}")
                # Let's count how many posts in past month (since May 8, 2026)
                now = datetime.datetime(2026, 6, 8, tzinfo=datetime.timezone.utc)
                one_month_ago_ts = (now - datetime.timedelta(days=31)).timestamp()
                
                pm_count = 0
                for edge in edges:
                    ts = edge.get("node", {}).get("taken_at_timestamp")
                    if ts and ts >= one_month_ago_ts:
                        pm_count += 1
                print(f"  Posts in this batch in past month: {pm_count}")
    except Exception as e:
        print(f"Error parsing {fn}: {e}")
