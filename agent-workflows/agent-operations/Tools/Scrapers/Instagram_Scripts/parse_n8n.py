import re
from html.parser import HTMLParser

class HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.result = []
        self.in_script_or_style = False

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.in_script_or_style = True
        # For links, print their destination too
        self.current_attrs = attrs

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.in_script_or_style = False

    def handle_data(self, data):
        if self.in_script_or_style:
            return
        text = data.strip()
        if text:
            self.result.append(text)

with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/.system_generated/steps/3/content.md", "r", encoding="utf-8") as f:
    html_content = f.read()

extractor = HTMLTextExtractor()
extractor.feed(html_content)

# Print out extracted text to inspect it
output_text = "\n".join(extractor.result)
with open("~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch/extracted_text.txt", "w", encoding="utf-8") as out:
    out.write(output_text)

print(f"Extracted {len(extractor.result)} text segments.")
# Print some preview lines that might contain content
for i, line in enumerate(extractor.result):
    if "Instagram" in line or "Apify" in line or "workflow" in line:
        # print context
        start = max(0, i - 2)
        end = min(len(extractor.result), i + 3)
        print(f"--- Context around segment {i} ---")
        for idx in range(start, end):
            print(f"{idx}: {extractor.result[idx]}")
        print("----------------------------------")
