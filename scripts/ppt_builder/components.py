from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from .theme import (
    BG_CARD, BG_CARD_LIGHT, BORDER_COLOR, ACCENT_AMBER, ACCENT_CYAN,
    ACCENT_EMERALD, ACCENT_ROSE, TEXT_WHITE, TEXT_MUTED, FONT_HEADING, FONT_BODY
)

def add_card(slide, left, top, width, height, title="", border_color=BORDER_COLOR, bg_color=BG_CARD):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.2)
    
    if title:
        tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.12), width - Inches(0.3), Inches(0.4))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER
        p.font.name = FONT_HEADING
    return card

def add_flow_step(slide, left, top, width, height, step_num, title, desc="", color=ACCENT_AMBER):
    step = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    step.fill.solid()
    step.fill.fore_color.rgb = BG_CARD
    step.line.color.rgb = color
    step.line.width = Pt(1.5)
    
    tf = step.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.08)
    tf.margin_left = Inches(0.08)
    tf.margin_right = Inches(0.08)
    
    p0 = tf.paragraphs[0]
    p0.text = f"STEP {step_num}"
    p0.font.size = Pt(8.5)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.font.name = FONT_HEADING
    p0.alignment = PP_ALIGN.CENTER
    
    p1 = tf.add_paragraph()
    p1.text = title
    p1.font.size = Pt(10.5)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = FONT_HEADING
    p1.alignment = PP_ALIGN.CENTER
    
    if desc:
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = TEXT_MUTED
        p2.font.name = FONT_BODY
        p2.alignment = PP_ALIGN.CENTER
    return step

def add_process_node(slide, left, top, width, height, header_tag, title, bullets, color=ACCENT_CYAN):
    node = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    node.fill.solid()
    node.fill.fore_color.rgb = BG_CARD
    node.line.color.rgb = color
    node.line.width = Pt(1.4)
    
    tf = node.text_frame
    tf.word_wrap = True
    tf.margin_top = Inches(0.08)
    tf.margin_left = Inches(0.1)
    tf.margin_right = Inches(0.1)
    
    p0 = tf.paragraphs[0]
    p0.text = header_tag.upper()
    p0.font.size = Pt(8)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.font.name = FONT_HEADING
    
    p1 = tf.add_paragraph()
    p1.text = title
    p1.font.size = Pt(10)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = FONT_HEADING
    
    for b in bullets:
        pb = tf.add_paragraph()
        pb.text = f"• {b}"
        pb.font.size = Pt(8)
        pb.font.color.rgb = TEXT_MUTED
        pb.font.name = FONT_BODY
    return node

def add_erd_box(slide, left, top, width, height, table_name, pk_list, fields_list, header_color=ACCENT_CYAN, font_size=8):
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    box.fill.solid()
    box.fill.fore_color.rgb = BG_CARD
    box.line.color.rgb = header_color
    box.line.width = Pt(1.2)
    
    hdr = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.38))
    hdr.fill.solid()
    hdr.fill.fore_color.rgb = header_color
    hdr.line.fill.background()
    p_hdr = hdr.text_frame.paragraphs[0]
    p_hdr.text = f" 📁 {table_name}"
    p_hdr.font.size = Pt(9.5)
    p_hdr.font.bold = True
    p_hdr.font.color.rgb = RGBColor(15, 23, 42)
    p_hdr.font.name = FONT_HEADING
    
    tb = slide.shapes.add_textbox(left + Inches(0.08), top + Inches(0.4), width - Inches(0.16), height - Inches(0.42))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_top = 0
    tf.margin_left = 0
    
    first = True
    for pk in pk_list:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.text = f"🔑 {pk}"
        p.font.size = Pt(font_size + 0.5)
        p.font.bold = True
        p.font.color.rgb = ACCENT_AMBER
        p.font.name = FONT_BODY
        
    for f in fields_list:
        p = tf.add_paragraph()
        p.text = f"• {f}"
        p.font.size = Pt(font_size)
        p.font.color.rgb = TEXT_WHITE
        p.font.name = FONT_BODY
    return box

def add_metric_badge(slide, left, top, width, height, value, label, color=ACCENT_EMERALD):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD_LIGHT
    card.line.color.rgb = color
    card.line.width = Pt(1)
    
    tf = card.text_frame
    tf.word_wrap = True
    p0 = tf.paragraphs[0]
    p0.text = value
    p0.font.size = Pt(16)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.font.name = FONT_HEADING
    p0.alignment = PP_ALIGN.CENTER
    
    p1 = tf.add_paragraph()
    p1.text = label
    p1.font.size = Pt(9)
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = FONT_BODY
    p1.alignment = PP_ALIGN.CENTER
    return card
