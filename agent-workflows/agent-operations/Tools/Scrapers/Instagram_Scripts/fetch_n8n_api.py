import urllib.request
import urllib.error
import json
import ssl

ctx = ssl._create_unverified_context()

endpoints = [
    "https://n8n.io/templates/workflows/6187",
    "https://n8n.io/workflows/templates/6187",
    "https://n8n.io/api/templates/workflows/6187",
    "https://n8n.io/api/workflows/templates/6187",
    "https://n8n.io/api/v1/templates/workflows/6187",
    "https://n8n.io/api/v1/workflows/templates/6187",
    
    # Try api.n8n.io
    "https://api.n8n.io/templates/workflows/6187",
    "https://api.n8n.io/workflows/templates/6187",
    "https://api.n8n.io/api/templates/workflows/6187",
    "https://api.n8n.io/api/workflows/templates/6187",
    "https://api.n8n.io/api/v1/templates/workflows/6187",
    "https://api.n8n.io/api/v1/workflows/templates/6187",
]

for url in endpoints:
    print(f"Requesting: {url}")
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            print(f"-> Success! Status: {status}")
            print(f"-> Content preview: {body[:300]}")
            # Save it
            try:
                js = json.loads(body)
                fn = url.replace("https://", "").replace("/", "_").replace(".", "_") + ".json"
                with open(f"~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/{fn}", "w") as f_out:
                    json.dump(js, f_out, indent=2)
                print(f"-> Saved to scratch/{fn}")
            except Exception as json_err:
                print(f"-> Not valid JSON: {json_err}")
    except urllib.error.HTTPError as e:
        print(f"-> HTTP Error {e.code}: {e.reason}")
    except Exception as e:
        print(f"-> General Error: {e}")
