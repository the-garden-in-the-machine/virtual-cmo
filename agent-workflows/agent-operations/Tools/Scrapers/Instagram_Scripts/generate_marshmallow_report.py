import json
import os
import shutil

scratch_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779/scratch"
artifacts_dir = "~/.gemini/antigravity/brain/e8d813fa-bcf4-4b82-9340-3d986a2f8779"

# Load scraped details and target media info
with open(os.path.join(scratch_dir, "scraped_details_marshmallowlaserfeast.json"), "r") as f:
    scraped_details = json.load(f)

with open(os.path.join(scratch_dir, "marshmallow_media_info.json"), "r") as f:
    media_info = json.load(f)

target_posts = []
for post in scraped_details:
    code = post["code"]
    info = media_info.get(code, {})
    
    # Clean comments
    cleaned_comments = []
    for comment in post.get("comments", []):
        author = comment["author"]
        text = comment["text"]
        
        # Filter out tag-mentions (starting with @) and metadata buttons/verified-badges
        if author.startswith("@"):
            continue
        if "Verified" in text or "Verified" in author:
            continue
        if "Edited" in text or "Reply" in text:
            txt_clean = text.replace("Edited", "").replace("Reply", "").replace("likes", "").replace("like", "").strip()
            if not txt_clean or txt_clean.isdigit():
                continue
        if text.strip() == "Original audio":
            continue
            
        cleaned_comments.append({
            "author": author,
            "text": text
        })
        
    # Copy screenshot to artifacts directory
    src_screenshot = os.path.join(scratch_dir, f"post_{code}.png")
    dst_screenshot = os.path.join(artifacts_dir, f"post_{code}.png")
    if os.path.exists(src_screenshot):
        shutil.copy2(src_screenshot, dst_screenshot)
        screenshot_path = dst_screenshot
    else:
        screenshot_path = None

    target_posts.append({
        "code": code,
        "url": post["url"],
        "date": info.get("date", "Unknown"),
        "images": info.get("images", 0),
        "videos": info.get("videos", 0),
        "caption": post["caption"],
        "comments": cleaned_comments,
        "screenshot": screenshot_path
    })

# Sort newest first
target_posts.sort(key=lambda x: x["date"], reverse=True)

# Generate Markdown content
md_lines = []
md_lines.append("# Instagram Profile Analysis: @marshmallowlaserfeast")
md_lines.append("")
md_lines.append("Analysis of posts and user interactions from the past month (May 8, 2026 – June 8, 2026).")
md_lines.append("")

# Summary stats
total_posts = len(target_posts)
total_images = sum(p["images"] for p in target_posts)
total_videos = sum(p["videos"] for p in target_posts)
total_comments = sum(len(p["comments"]) for p in target_posts)

md_lines.append("## 📊 Summary Metrics")
md_lines.append(f"- **Time Period:** May 8, 2026 – June 8, 2026")
md_lines.append(f"- **Total Posts:** {total_posts}")
md_lines.append(f"- **Total Images:** {total_images}")
md_lines.append(f"- **Total Videos:** {total_videos}")
md_lines.append(f"- **Total User Comments:** {total_comments}")
md_lines.append("")

md_lines.append("## 🗂 Posts Feed Detailed Walkthrough")
md_lines.append("")

for i, post in enumerate(target_posts):
    md_lines.append(f"### Post {i+1}: {post['date']} (code: `[{post['code']}]({post['url']})`)")
    md_lines.append("")
    md_lines.append(f"- **Date:** {post['date']}")
    md_lines.append(f"- **Link:** [Instagram Link]({post['url']})")
    md_lines.append(f"- **Media Count:** 📷 {post['images']} Image(s) | 🎥 {post['videos']} Video(s)")
    md_lines.append("")
    
    md_lines.append("#### Caption")
    if post["caption"]:
        md_lines.append(f"> {post['caption']}")
    else:
        md_lines.append("*No author caption on this post (collaborator description or empty).*")
    md_lines.append("")
    
    # Comments list
    md_lines.append("#### Comments")
    if post["comments"]:
        for comment in post["comments"]:
            md_lines.append(f"- **@{comment['author']}:** {comment['text']}")
    else:
        md_lines.append("*No comments on this post.*")
    md_lines.append("")
    
    # Screenshot embed
    if post["screenshot"]:
        md_lines.append("#### Screenshot")
        md_lines.append(f"![Screenshot of post {post['code']}]({post['screenshot']})")
    md_lines.append("")
    md_lines.append("---")
    md_lines.append("")

# Write to the final report
with open(os.path.join(artifacts_dir, "marshmallow_posts_month.md"), "w") as f:
    f.write("\n".join(md_lines))

print("Successfully generated marshmallow_posts_month.md!")
