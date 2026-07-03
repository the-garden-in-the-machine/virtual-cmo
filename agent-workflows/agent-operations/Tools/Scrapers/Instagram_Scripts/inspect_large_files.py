import os
import json

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
files = [f for f in os.listdir(scratch_dir) if f.startswith("intercepted_") and os.path.getsize(os.path.join(scratch_dir, f)) > 10000]

print(f"Inspecting {len(files)} files larger than 10KB:")
for fn in files:
    path = os.path.join(scratch_dir, fn)
    print(f"\n--- {fn} (Size: {os.path.getsize(path)} bytes) ---")
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        js = json.loads(content)
        # Print top level keys
        if isinstance(js, dict):
            print("Keys:", list(js.keys()))
            # Print a preview of subkeys
            for k, v in js.items():
                if isinstance(v, dict):
                    print(f"  {k}: dict keys {list(v.keys())}")
                    # check deeper
                    for k2, v2 in v.items():
                        if isinstance(v2, dict):
                            print(f"    {k2}: dict keys {list(v2.keys())}")
                elif isinstance(v, list):
                    print(f"  {k}: list of length {len(v)}")
                    if len(v) > 0:
                        print(f"    First element type: {type(v[0])}")
                        if isinstance(v[0], dict):
                            print(f"    First element keys: {list(v[0].keys())}")
                else:
                    print(f"  {k}: {type(v)}")
        else:
            print("Type:", type(js))
    except Exception as e:
        print("Error:", e)
