import re

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/.system_generated/steps/3/content.md", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for "6187" in the HTML and print 100 characters around it
matches = [m.start() for m in re.finditer(r'6187', html)]
print(f"Found {len(matches)} occurrences of '6187' in HTML:")
for idx in matches:
    start = max(0, idx - 100)
    end = min(len(html), idx + 150)
    print(f"Index {idx}:")
    print(html[start:end])
    print("-" * 50)
