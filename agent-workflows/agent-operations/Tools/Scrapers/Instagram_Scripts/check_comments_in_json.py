import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/intercepted_1780985671112.json", "r") as f:
    js = json.load(f)

edges = js["data"]["xdt_api__v1__feed__user_timeline_graphql_connection"]["edges"]
if len(edges) > 0:
    node = edges[0]["node"]
    print("Node keys:", list(node.keys()))
    
    # Check for keys related to comments
    comment_keys = [k for k in node.keys() if "comment" in k.lower()]
    print("Comment keys found:", comment_keys)
    
    for k in comment_keys:
        val = node[k]
        if isinstance(val, dict):
            print(f"- {k}: dict, keys: {list(val.keys())}")
            if "edges" in val:
                print(f"  edges count: {len(val['edges'])}")
                if len(val['edges']) > 0:
                    print("  First comment:", val['edges'][0])
            elif "count" in val:
                print(f"  count: {val['count']}")
        else:
            print(f"- {k}: {type(val)} (value: {val})")
