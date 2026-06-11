"""
PDF Export Service — ConstructVision AI
Generates a professional BOQ report using ReportLab.
"""
import io
import os
from datetime import datetime
from decimal import Decimal

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable, KeepTogether
)
from reportlab.platypus.flowables import HRFlowable

# ── Brand colours ─────────────────────────────────────────────────────────────
BRAND_ORANGE  = colors.HexColor("#FF7510")
DARK_BG       = colors.HexColor("#1A1714")
SLATE_LIGHT   = colors.HexColor("#F6F5F4")
SLATE_MID     = colors.HexColor("#D2CEC9")
SLATE_DARK    = colors.HexColor("#47423A")
TEXT_MUTED    = colors.HexColor("#7A7269")
WHITE         = colors.white

CATEGORY_COLOURS = {
    "civil":        colors.HexColor("#3B82F6"),
    "civil_work":   colors.HexColor("#3B82F6"),
    "finishing":    colors.HexColor("#8B5CF6"),
    "electrical":   colors.HexColor("#F59E0B"),
    "plumbing":     colors.HexColor("#06B6D4"),
    "external":     colors.HexColor("#10B981"),
    "external_work":colors.HexColor("#10B981"),
}
CATEGORY_LABELS = {
    "civil": "Civil Work", "civil_work": "Civil Work",
    "finishing": "Finishing Work", "electrical": "Electrical Work",
    "plumbing": "Plumbing Work", "external": "External Work",
    "external_work": "External Work",
}
CAT_ORDER = ["civil","civil_work","plumbing","electrical","finishing","external","external_work"]


def _fmt_inr(val) -> str:
    if val is None: return "—"
    n = float(val)
    if n >= 10_000_000: return f"₹{n/10_000_000:.2f} Cr"
    if n >= 100_000:    return f"₹{n/100_000:.2f} L"
    return f"₹{n:,.0f}"

def _fmt_num(val) -> str:
    if val is None: return "—"
    return f"{float(val):,.2f}"


def generate_boq_pdf(project, estimation) -> bytes:
    """
    Returns PDF bytes for the given project + estimation.
    project and estimation are SQLAlchemy model instances.
    """
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=15*mm, bottomMargin=20*mm,
        title=f"BOQ — {project.name}",
        author="ConstructVision AI",
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Header band ───────────────────────────────────────────────────────────
    header_data = [[
        Paragraph(f"<font color='#FF7510'><b>ConstructVision AI</b></font>", ParagraphStyle(
            "brand", fontSize=16, fontName="Helvetica-Bold", textColor=BRAND_ORANGE
        )),
        Paragraph(
            "<font color='#D2CEC9'>Bill of Quantities</font>",
            ParagraphStyle("boqlbl", fontSize=10, fontName="Helvetica", textColor=SLATE_MID, alignment=TA_RIGHT)
        )
    ]]
    header_table = Table(header_data, colWidths=["60%","40%"])
    header_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), DARK_BG),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("LEFTPADDING",  (0,0), (0,-1),  12),
        ("RIGHTPADDING", (-1,0),(-1,-1), 12),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 6*mm))

    # ── Project info table ────────────────────────────────────────────────────
    def info_cell(label, value):
        return [
            Paragraph(label, ParagraphStyle("lbl", fontSize=7, fontName="Helvetica",
                                             textColor=TEXT_MUTED, spaceBefore=0)),
            Paragraph(str(value) if value else "—", ParagraphStyle("val", fontSize=9,
                       fontName="Helvetica-Bold", textColor=SLATE_DARK)),
        ]

    city_state = ", ".join(filter(None, [project.city, project.state])) or "—"
    area_txt   = f"{float(project.total_area_sqft):,.0f} sq.ft" if project.total_area_sqft else "—"
    conf_map   = {"high":"High ✓","medium":"Medium","low":"Low ⚠"}
    conf_txt   = conf_map.get(estimation.ai_confidence or "medium", "—")

    info_data = [
        info_cell("Project Name", project.name),
        info_cell("Project Type", project.project_type.capitalize()),
        info_cell("Location", city_state),
        info_cell("Built-up Area", area_txt),
        info_cell("No. of Floors", str(project.num_floors)),
        info_cell("Finish Quality", project.finish_quality.capitalize()),
        info_cell("AI Confidence", conf_txt),
        info_cell("Prepared On", datetime.now().strftime("%d %b %Y")),
    ]

    # Arrange in 4 columns
    rows = []
    for i in range(0, len(info_data), 4):
        row = []
        for cell in info_data[i:i+4]:
            row.extend(cell)
        # pad to 8 cols if needed
        while len(row) < 8:
            row.extend([Paragraph("","Normal"), Paragraph("","Normal")])
        rows.append(row)

    info_table = Table(rows, colWidths=["10%","15%","10%","15%","10%","15%","10%","15%"])
    info_table.setStyle(TableStyle([
        ("BACKGROUND",   (0,0),(-1,-1), SLATE_LIGHT),
        ("TOPPADDING",   (0,0),(-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("LEFTPADDING",  (0,0),(-1,-1), 6),
        ("RIGHTPADDING", (0,0),(-1,-1), 6),
        ("BOX",          (0,0),(-1,-1), 0.5, SLATE_MID),
        ("ROWBACKGROUNDS",(0,0),(-1,-1),[SLATE_LIGHT, WHITE]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 8*mm))

    # ── Cost summary bar ──────────────────────────────────────────────────────
    total = float(estimation.total_cost or 0)
    cpf   = float(estimation.cost_per_sqft or 0)

    summary_data = [[
        Paragraph(f"<b>Total Project Cost</b>", ParagraphStyle("tl", fontSize=9, fontName="Helvetica-Bold", textColor=WHITE)),
        Paragraph(f"<b>{_fmt_inr(total)}</b>", ParagraphStyle("tv", fontSize=14, fontName="Helvetica-Bold",
                                                                textColor=BRAND_ORANGE, alignment=TA_RIGHT)),
        Paragraph(f"₹{cpf:,.0f} / sq.ft", ParagraphStyle("cpf", fontSize=9, fontName="Helvetica",
                                                           textColor=SLATE_MID, alignment=TA_RIGHT)),
    ]]
    summary_table = Table(summary_data, colWidths=["35%","35%","30%"])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0),(-1,-1), DARK_BG),
        ("TOPPADDING",    (0,0),(-1,-1), 8),
        ("BOTTOMPADDING", (0,0),(-1,-1), 8),
        ("LEFTPADDING",   (0,0),(0,-1),  12),
        ("RIGHTPADDING",  (-1,0),(-1,-1),12),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 6*mm))

    # ── BOQ Table ─────────────────────────────────────────────────────────────
    # Column header
    col_hdr_style = ParagraphStyle("ch", fontSize=7.5, fontName="Helvetica-Bold",
                                   textColor=WHITE, alignment=TA_CENTER)
    boq_header = [
        Paragraph("Item Code", col_hdr_style),
        Paragraph("Description of Work", col_hdr_style),
        Paragraph("Unit", col_hdr_style),
        Paragraph("Qty", col_hdr_style),
        Paragraph("Rate (₹)", col_hdr_style),
        Paragraph("Amount (₹)", col_hdr_style),
    ]
    col_widths = [18*mm, 82*mm, 13*mm, 18*mm, 22*mm, 27*mm]

    # Group items
    grouped: dict[str, list] = {}
    for item in estimation.boq_items:
        c = item.category.lower()
        grouped.setdefault(c, []).append(item)

    cats = sorted(grouped.keys(), key=lambda x: CAT_ORDER.index(x) if x in CAT_ORDER else 99)

    desc_style    = ParagraphStyle("ds", fontSize=8, fontName="Helvetica",    textColor=SLATE_DARK, leading=10)
    code_style    = ParagraphStyle("cs", fontSize=7, fontName="Helvetica",    textColor=TEXT_MUTED)
    num_style     = ParagraphStyle("ns", fontSize=8, fontName="Helvetica",    textColor=SLATE_DARK, alignment=TA_RIGHT)
    amount_style  = ParagraphStyle("as", fontSize=8, fontName="Helvetica-Bold",textColor=SLATE_DARK, alignment=TA_RIGHT)
    cat_lbl_style = ParagraphStyle("cl", fontSize=8.5, fontName="Helvetica-Bold", textColor=WHITE)
    subtot_style  = ParagraphStyle("st", fontSize=8, fontName="Helvetica-Bold", textColor=SLATE_DARK, alignment=TA_RIGHT)

    boq_rows = [boq_header]
    boq_styles = [
        ("BACKGROUND",    (0,0),(-1,0),  DARK_BG),
        ("TEXTCOLOR",     (0,0),(-1,0),  WHITE),
        ("FONTNAME",      (0,0),(-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",      (0,0),(-1,0),  7.5),
        ("TOPPADDING",    (0,0),(-1,0),  5),
        ("BOTTOMPADDING", (0,0),(-1,0),  5),
        ("ALIGN",         (0,0),(-1,-1), "CENTER"),
        ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ("GRID",          (0,0),(-1,-1), 0.3, SLATE_MID),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, SLATE_LIGHT]),
    ]

    row_idx = 1
    grand_total = 0.0

    for cat in cats:
        items = grouped[cat]
        cat_colour = CATEGORY_COLOURS.get(cat, SLATE_DARK)
        cat_label  = CATEGORY_LABELS.get(cat, cat.replace("_"," ").title())
        cat_total  = sum(float(i.amount or 0) for i in items)
        grand_total += cat_total

        # Category header row
        boq_rows.append([
            Paragraph(cat_label, cat_lbl_style),
            "", "", "", "",
            Paragraph(_fmt_inr(cat_total), ParagraphStyle("ct", fontSize=8, fontName="Helvetica-Bold",
                                                           textColor=WHITE, alignment=TA_RIGHT)),
        ])
        boq_styles += [
            ("BACKGROUND",  (0,row_idx),(-1,row_idx), cat_colour),
            ("SPAN",        (0,row_idx),(4,row_idx)),
            ("TOPPADDING",  (0,row_idx),(-1,row_idx), 4),
            ("BOTTOMPADDING",(0,row_idx),(-1,row_idx),4),
            ("LEFTPADDING", (0,row_idx),(0,row_idx),  8),
        ]
        row_idx += 1

        for i, item in enumerate(items):
            bg = WHITE if i % 2 == 0 else SLATE_LIGHT
            boq_rows.append([
                Paragraph(item.item_code or "—", code_style),
                Paragraph(item.description, desc_style),
                Paragraph(str(item.unit).upper(), ParagraphStyle("u", fontSize=7.5, alignment=TA_CENTER, textColor=TEXT_MUTED)),
                Paragraph(_fmt_num(item.quantity), num_style),
                Paragraph(_fmt_num(item.rate), num_style),
                Paragraph(_fmt_inr(item.amount), amount_style),
            ])
            boq_styles += [
                ("BACKGROUND",    (0,row_idx),(-1,row_idx), bg),
                ("TOPPADDING",    (0,row_idx),(-1,row_idx), 3),
                ("BOTTOMPADDING", (0,row_idx),(-1,row_idx), 3),
                ("LEFTPADDING",   (0,row_idx),(0,row_idx),  4),
                ("LEFTPADDING",   (1,row_idx),(1,row_idx),  4),
            ]
            row_idx += 1

        # Subtotal row
        boq_rows.append([
            "", Paragraph(f"{cat_label} — Subtotal", subtot_style),
            "", "", "",
            Paragraph(_fmt_inr(cat_total), subtot_style),
        ])
        boq_styles += [
            ("BACKGROUND",    (0,row_idx),(-1,row_idx), colors.HexColor("#E8E6E3")),
            ("SPAN",          (0,row_idx),(4,row_idx)),
            ("TOPPADDING",    (0,row_idx),(-1,row_idx), 3),
            ("BOTTOMPADDING", (0,row_idx),(-1,row_idx), 3),
            ("LINEABOVE",     (0,row_idx),(-1,row_idx), 0.5, SLATE_MID),
        ]
        row_idx += 1

    # Contingency row
    contingency = float(estimation.contingency_cost or grand_total * 0.05)
    boq_rows.append([
        "", Paragraph("<b>Contingency @ 5%</b>", ParagraphStyle("cg", fontSize=8, fontName="Helvetica-Bold",
                                                                  textColor=SLATE_DARK)),
        "", "", "",
        Paragraph(_fmt_inr(contingency), amount_style),
    ])
    boq_styles += [
        ("BACKGROUND",  (0,row_idx),(-1,row_idx), SLATE_LIGHT),
        ("SPAN",        (0,row_idx),(4,row_idx)),
        ("TOPPADDING",  (0,row_idx),(-1,row_idx), 4),
        ("BOTTOMPADDING",(0,row_idx),(-1,row_idx),4),
    ]
    row_idx += 1

    # Grand total row
    boq_rows.append([
        "", Paragraph("<font color='white'><b>GRAND TOTAL</b></font>",
                       ParagraphStyle("gt", fontSize=10, fontName="Helvetica-Bold", textColor=WHITE)),
        "", "", "",
        Paragraph(f"<font color='#FF7510'><b>{_fmt_inr(total)}</b></font>",
                   ParagraphStyle("gtv", fontSize=11, fontName="Helvetica-Bold",
                                  textColor=BRAND_ORANGE, alignment=TA_RIGHT)),
    ])
    boq_styles += [
        ("BACKGROUND",    (0,row_idx),(-1,row_idx), DARK_BG),
        ("SPAN",          (0,row_idx),(4,row_idx)),
        ("TOPPADDING",    (0,row_idx),(-1,row_idx), 7),
        ("BOTTOMPADDING", (0,row_idx),(-1,row_idx), 7),
        ("LEFTPADDING",   (1,row_idx),(1,row_idx),  10),
    ]

    boq_table = Table(boq_rows, colWidths=col_widths, repeatRows=1)
    boq_table.setStyle(TableStyle(boq_styles))
    story.append(boq_table)
    story.append(Spacer(1, 8*mm))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    disc_style = ParagraphStyle("disc", fontSize=7, fontName="Helvetica",
                                 textColor=TEXT_MUTED, leading=10)
    story.append(HRFlowable(width="100%", thickness=0.5, color=SLATE_MID))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "<b>Disclaimer:</b> This estimate was generated by ConstructVision AI using Gemini 1.5 Pro. "
        "Quantities and rates are indicative based on current market data for the specified region. "
        "Actual costs may vary. Please verify with a licensed quantity surveyor before procurement. "
        f"Generated on {datetime.now().strftime('%d %b %Y at %H:%M')}.",
        disc_style
    ))

    # ── Page footer callback ──────────────────────────────────────────────────
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(TEXT_MUTED)
        canvas.drawString(15*mm, 10*mm, f"ConstructVision AI  ·  {project.name}")
        canvas.drawRightString(A4[0]-15*mm, 10*mm, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    buffer.seek(0)
    return buffer.read()
