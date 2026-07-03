import json

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/nuxt_resolved.json", "r") as f:
    state = json.load(f)

# Find the keys
wf_key = 'get-workflow-6187-instagram-full-profile-scraper-with-apify-and-google-sheets'
desc_key = 'get-workflow-6187-instagram-full-profile-scraper-with-apify-and-google-sheets-description'

workflow_data = state.get(wf_key)
description_data = state.get(desc_key)

print(f"Workflow Data Type: {type(workflow_data)}")
print(f"Description Data Type: {type(description_data)}")

# Let's save them to clean files
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/workflow_data.json", "w") as out:
    json.dump(workflow_data, out, indent=2)

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/description_data.json", "w") as out:
    json.dump(description_data, out, indent=2)

# If workflow_data has keys like "nodes" or "code" or "json", let's inspect
if isinstance(workflow_data, dict):
    print("Workflow data keys:", list(workflow_data.keys()))
    # Often, n8n templates have a "code" or "json" field that is the actual workflow JSON.
    # Let's see if there is any "code" field.
    for k in workflow_data.keys():
        val = workflow_data[k]
        if isinstance(val, dict):
            print(f"Sub-key '{k}' keys:", list(val.keys()))
        elif isinstance(val, str) and ("nodes" in val or "connections" in val):
            print(f"Found JSON string in key '{k}'!")
            try:
                sub_parsed = json.loads(val)
                print(f"Sub-parsed keys: {list(sub_parsed.keys())}")
                with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/n8n_workflow_extracted.json", "w") as wf_out:
                    json.dump(sub_parsed, wf_out, indent=2)
                print("Saved extracted workflow to n8n_workflow_extracted.json!")
            except Exception as e:
                print(f"Error parsing json in key {k}: {e}")
else:
    print("Workflow data is not a dict, representation:")
    print(str(workflow_data)[:1000])
