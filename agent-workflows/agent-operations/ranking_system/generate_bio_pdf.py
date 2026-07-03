import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# Define target PDF path
pdf_path = "Agent_Operations/ranking_system/pawel_feldman_bio.pdf"

# Setup Document with 0.75 in (54 pt) margins
doc = SimpleDocTemplate(
    pdf_path, 
    pagesize=letter, 
    rightMargin=54, 
    leftMargin=54, 
    topMargin=54, 
    bottomMargin=54
)

story = []
styles = getSampleStyleSheet()

# Custom Colors matching the dashboard palette
c_dark = colors.HexColor("#0b0f19")
c_sky = colors.HexColor("#38bdf8")
c_violet = colors.HexColor("#a78bfa")
c_text = colors.HexColor("#1e293b")
c_text_muted = colors.HexColor("#64748b")
c_bg_light = colors.HexColor("#f8fafc")

# Custom Styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=22,
    leading=26,
    textColor=c_dark,
    spaceAfter=12
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=12,
    textColor=c_sky,
    spaceAfter=4
)

body_style = ParagraphStyle(
    'DocBody',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9.5,
    leading=14,
    textColor=c_text,
    spaceAfter=8
)

bold_body_style = ParagraphStyle(
    'DocBodyBold',
    parent=body_style,
    fontName='Helvetica-Bold'
)

header_style = ParagraphStyle(
    'DocHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=13,
    leading=15,
    textColor=c_dark,
    spaceBefore=12,
    spaceAfter=8,
    keepWithNext=True
)

# Header Section
story.append(Paragraph("EMERGENTIC LEAD PROSPECT DOSSIER", subtitle_style))
story.append(Paragraph("Pawel Feldman", title_style))
story.append(Paragraph("Chief Business Development Officer & Member of the Board &bull; 11 bit studios S.A.", bold_body_style))
story.append(Spacer(1, 10))

# Draw a divider line
divider = Table([['']], colWidths=[504], rowHeights=[2])
divider.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), c_sky),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ('TOPPADDING', (0,0), (-1,-1), 0),
]))
story.append(divider)
story.append(Spacer(1, 12))

# Professional Bio
story.append(Paragraph("Professional Summary", header_style))
summary_text = (
    "Pawel Feldman is a senior executive in the international gaming industry, "
    "with deep expertise in both video game development and global publishing. Currently serving "
    "as the Chief Business Development Officer and a Member of the Board at 11 bit studios S.A., Pawel "
    "oversees strategic partnerships, game licensing, publishing acquisitions (XDEV), and global marketing "
    "operations. Over his tenure of nearly four years, he has guided commercial operations for "
    "acclaimed proprietary franchises like <i>Frostpunk 2</i> and <i>The Alters</i>, while steering third-party "
    "publishing deals for global hits such as <i>Moonlighter</i>, <i>Children of Morta</i>, and <i>The Thaumaturge</i>."
)
story.append(Paragraph(summary_text, body_style))

# Core Experience & Profile
story.append(Paragraph("Key Profile Details", header_style))

profile_data = [
    [Paragraph("<b>Current Role:</b>", body_style), Paragraph("Chief Business Development Officer (CBDO) & Member of the Board", body_style)],
    [Paragraph("<b>Company:</b>", body_style), Paragraph("11 bit studios S.A. (Warsaw Stock Exchange: 11B)", body_style)],
    [Paragraph("<b>Tenure:</b>", body_style), Paragraph("3 years, 11 months (Current)", body_style)],
    [Paragraph("<b>Key Specializations:</b>", body_style), Paragraph("B2B Licensing, Financing, IP Development, Executive Publishing", body_style)],
    [Paragraph("<b>Location:</b>", body_style), Paragraph("Warsaw, Mazowieckie, Poland", body_style)]
]

t_profile = Table(profile_data, colWidths=[130, 374])
t_profile.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.lightgrey),
]))
story.append(t_profile)
story.append(Spacer(1, 10))

# B2B Compatibility Scoring
story.append(Paragraph("Emergentic B2B Compatibility Audit", header_style))
audit_intro = (
    "Based on network parameters scraped from LinkedIn Sales Navigator, Pawel Feldman represents a "
    "<b>High Priority (Top Tier)</b> target for the Emergentic pipeline automation offerings."
)
story.append(Paragraph(audit_intro, body_style))

score_data = [
    [
        Paragraph("<b>Metric</b>", bold_body_style), 
        Paragraph("<b>Rating</b>", bold_body_style), 
        Paragraph("<b>Weight</b>", bold_body_style), 
        Paragraph("<b>Subtotal</b>", bold_body_style), 
        Paragraph("<b>Strategic Implications</b>", bold_body_style)
    ],
    [
        Paragraph("Mutual Contacts", body_style), 
        "5.0 / 5.0", 
        "x 3.0", 
        "15.0", 
        Paragraph("6 shared connections; highly warm accessibility path.", body_style)
    ],
    [
        Paragraph("Role Seniority", body_style), 
        "5.0 / 5.0", 
        "x 2.0", 
        "10.0", 
        Paragraph("CBDO & Board status yields direct signing authority.", body_style)
    ],
    [
        Paragraph("AI-Tech Alignment", body_style), 
        "2.0 / 5.0", 
        "x 1.5", 
        "3.0", 
        Paragraph("Traditional publisher; high initial tech-adoption friction.", body_style)
    ],
    [
        Paragraph("Content Scale Need", body_style), 
        "4.0 / 5.0", 
        "x 1.0", 
        "4.0", 
        Paragraph("Hybrid multi-title publishing operations; heavy trailer/social asset localizations.", body_style)
    ],
    [
        Paragraph("<b>Total Score</b>", bold_body_style), 
        "<b>-</b>", 
        "<b>-</b>", 
        "<b>32.0 / 37.5</b>", 
        Paragraph("<b>High Priority Target (Tier 1)</b>", bold_body_style)
    ]
]

t_score = Table(score_data, colWidths=[110, 45, 45, 45, 259])
t_score.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), c_bg_light),
    ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#e0f2fe")), # Accent light blue for total
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
]))
story.append(t_score)
story.append(Spacer(1, 10))

# Strategic Alignment Summary
story.append(Paragraph("Custom Outreach Strategy", header_style))
outreach_text = (
    "To address their lower AI-alignment score, the pitch should skip AI buzzwords and focus on "
    "<b>operational media pipeline engineering</b>. 11 bit studios' hybrid model (internal development + third-party publishing) "
    "creates massive ongoing trailer, localization, and promo asset formatting overhead. "
    "Key value propositions include automating localized trailer subtitle burns across 12+ languages and "
    "programmatically formatting vertical 9:16 gameplay clips from widescreen captures for active titles."
)
story.append(Paragraph(outreach_text, body_style))

# Build Doc
doc.build(story)
print("PDF generated successfully.")
