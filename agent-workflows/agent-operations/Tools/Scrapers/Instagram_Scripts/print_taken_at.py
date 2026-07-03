import json
import datetime

# Load the timeline JSON
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/intercepted_1780985671112.json", "r") as f:
    js = json.load(f)

edges = js["data"]["xdt_api__v1__feed__user_timeline_graphql_connection"]["edges"]

codes_of_interest = [
  "DZN6nbkEq5g",
  "DZJWLBnxjFX",
  "DY0I_NqPYtj",
  "DZGeBjcAQPV",
  "DY2xlOzHbhJ",
  "DYnYr-KyFZ1",
  "DYpFAwzkfXC",
  "DYh6hcipZCf",
  "DYfStMpuEMu",
  "DYfh4VRHbNS",
  "DYkcjIwEWO8",
  "DYQacz9PwzL"
]

print("All 12 codes taken_at times:")
for edge in edges:
    node = edge["node"]
    code = node["code"]
    if code in codes_of_interest:
        taken_at = node["taken_at"]
        dt = datetime.datetime.fromtimestamp(taken_at, datetime.timezone.utc)
        print(f"Code: {code} | Date: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')} | Timestamp: {taken_at}")
