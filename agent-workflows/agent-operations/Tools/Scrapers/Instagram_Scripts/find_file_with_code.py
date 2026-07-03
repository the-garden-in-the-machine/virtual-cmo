import os
import json

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
files = [f for f in os.listdir(scratch_dir) if f.startswith("intercepted_") and f.endswith(".json")]

for fn in files:
    path = os.path.join(scratch_dir, fn)
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        if "DZN6nbkEq5g" in content:
            print(f"File {fn} contains DZN6nbkEq5g (Size: {os.path.getsize(path)} bytes)")
    except Exception as e:
        pass
