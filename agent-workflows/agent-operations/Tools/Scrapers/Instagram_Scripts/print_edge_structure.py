import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/intercepted_1780985688094.json", "r") as f:
    js = json.load(f)

edges = js["data"]["xdt_api__v1__feed__user_timeline_graphql_connection"]["edges"]
print(f"Number of edges: {len(edges)}")
if len(edges) > 0:
    node = edges[0]["node"]
    print("Node keys:", list(node.keys()))
    # Print some interesting fields
    for k in ['id', 'taken_at', 'device_timestamp', 'media_type', 'code', 'caption', 'like_count', 'comment_count']:
        if k in node:
            if k == 'caption':
                print(f"- caption: {type(node[k])} (preview: {str(node[k])[:100]})")
            else:
                print(f"- {k}: {node[k]}")
        else:
            # check if it is under a different name
            print(f"- {k}: NOT FOUND")
            
    # Check if there is any image list or carousel items (sidecar)
    if 'carousel_media' in node:
        print(f"- carousel_media: list of length {len(node['carousel_media'])}")
    if 'image_versions2' in node:
        print(f"- image_versions2: dict keys {list(node['image_versions2'].keys())}")
