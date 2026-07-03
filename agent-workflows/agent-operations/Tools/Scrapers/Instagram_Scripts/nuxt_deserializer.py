import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_script_4.txt", "r", encoding="utf-8") as f:
    raw_data = f.read()

data = json.loads(raw_data)

# Nuxt 3 deserialization logic:
# Basic values (number, boolean, null) are themselves.
# A string is either a literal string or a special representation.
# Arrays can represent objects or arrays.
# A dictionary represents an object where keys are string literals (or keys) and values are indices into the root array.
# For example, data[2] might be a dictionary whose values are indices in `data`.

resolved = {}

def resolve(val, seen=None):
    if seen is None:
        seen = set()
    
    # If val is an index (int), resolve it from data
    if isinstance(val, int):
        if val in seen:
            return f"<Circular reference to {val}>"
        if 0 <= val < len(data):
            seen.add(val)
            res = resolve_val(data[val], seen)
            seen.remove(val)
            return res
        else:
            return val
    return resolve_val(val, seen)

def resolve_val(item, seen):
    if isinstance(item, (str, float, bool)) or item is None:
        return item
    elif isinstance(item, list):
        # Check if it's a special type, e.g., ["ShallowReactive", index]
        if len(item) == 2 and isinstance(item[0], str) and item[0] in ("ShallowReactive", "Reactive", "ref", "shallowRef"):
            return resolve(item[1], seen)
        elif len(item) == 2 and item[0] == "Set":
            return list(resolve(item[1], seen))
        elif len(item) == 2 and item[0] == "Map":
            return dict(resolve(item[1], seen))
        # Otherwise it's a normal list of indices or values
        return [resolve(x, seen) for x in item]
    elif isinstance(item, dict):
        return {k: resolve(v, seen) for k, v in item.items()}
    return item

# Let's resolve the root state
root_state = resolve(2) # data is at index 2 or 1
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "w") as out:
    json.dump(root_state, out, indent=2)

print("Deserialized Nuxt state successfully!")
# Print keys of root_state to see what we have
if isinstance(root_state, dict):
    print("Root state keys:", list(root_state.keys()))
    if "state" in root_state:
        print("state keys:", list(root_state["state"].keys()))
        # Let's search inside state for workflow nodes
else:
    print("Root state is not a dict:", type(root_state))
