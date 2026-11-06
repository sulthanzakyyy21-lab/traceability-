from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

BG_DARK = RGBColor(11, 19, 37)
BG_CARD = RGBColor(22, 32, 50)
BG_CARD_LIGHT = RGBColor(30, 41, 59)
BORDER_COLOR = RGBColor(51, 65, 85)
ACCENT_AMBER = RGBColor(245, 158, 11)
ACCENT_CYAN = RGBColor(56, 189, 248)
ACCENT_EMERALD = RGBColor(16, 185, 129)
ACCENT_ROSE = RGBColor(244, 63, 94)
TEXT_WHITE = RGBColor(248, 250, 252)
TEXT_MUTED = RGBColor(148, 163, 184)

FONT_HEADING = "Segoe UI"
FONT_BODY = "Segoe UI"

def set_slide_background(slide):
    bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = BG_DARK
    bg_shape.line.fill.background()
    return bg_shape

TOTAL_SLIDES = 18

def add_header(slide, title, category="SISTEM TRACEABILITY PT. SANTOS JAYA ABADI", page_num=None, total_pages=TOTAL_SLIDES):
    set_slide_background(slide)
    
    badge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.5), Inches(0.35))
    badge.fill.solid()
    badge.fill.fore_color.rgb = BG_CARD_LIGHT
    badge.line.color.rgb = ACCENT_AMBER
    badge.line.width = Pt(1)
    tf_b = badge.text_frame
    tf_b.word_wrap = True
    p_b = tf_b.paragraphs[0]
    p_b.text = f"● {category}"
    p_b.font.size = Pt(10)
    p_b.font.bold = True
    p_b.font.color.rgb = ACCENT_AMBER
    p_b.font.name = FONT_HEADING

    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.0), Inches(0.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(22)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.font.name = FONT_HEADING

    if page_num:
        tb_p = slide.shapes.add_textbox(Inches(12.0), Inches(0.4), Inches(0.8), Inches(0.35))
        tf_p = tb_p.text_frame
        p_num = tf_p.paragraphs[0]
        p_num.text = f"{page_num:02d} / {total_pages:02d}"
        p_num.font.size = Pt(11)
        p_num.font.bold = True
        p_num.font.color.rgb = TEXT_MUTED
        p_num.alignment = PP_ALIGN.RIGHT

