from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from .theme import (
    set_slide_background, add_header, BG_CARD, BG_CARD_LIGHT, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, TEXT_WHITE,
    FONT_HEADING, FONT_BODY
)
from .components import add_card, add_metric_badge

def build_slide_1_cover(slide):
    set_slide_background(slide)
    
    tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.2), Inches(4.8), Inches(0.4))
    tag.fill.solid()
    tag.fill.fore_color.rgb = BG_CARD_LIGHT
    tag.line.color.rgb = ACCENT_AMBER
    p_tag = tag.text_frame.paragraphs[0]
    p_tag.text = "PLANT OPERATIONS & ASSURANCE SYSTEM"
    p_tag.font.size = Pt(11)
    p_tag.font.bold = True
    p_tag.font.color.rgb = ACCENT_AMBER
    
    tb_title = slide.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(2.2))
    tf_title = tb_title.text_frame
    tf_title.word_wrap = True
    p1 = tf_title.paragraphs[0]
    p1.text = "SISTEM TRACEABILITY TERPADU"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = FONT_HEADING
    
    p2 = tf_title.add_paragraph()
    p2.text = "PT. SANTOS JAYA ABADI"
    p2.font.size = Pt(28)
    p2.font.bold = True
    p2.font.color.rgb = ACCENT_AMBER
    p2.font.name = FONT_HEADING
    
    desc_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(4.2), Inches(11.3), Inches(1.4))
    desc_card.fill.solid()
    desc_card.fill.fore_color.rgb = BG_CARD
    desc_card.line.color.rgb = BORDER_COLOR
    tf_desc = desc_card.text_frame
    tf_desc.word_wrap = True
    tf_desc.margin_left = Inches(0.3)
    tf_desc.margin_top = Inches(0.2)
    pd = tf_desc.paragraphs[0]
    pd.text = "Dokumentasi Lengkap Siklus Produksi Kopi Multi-Echelon: Flowchart Proses Manufaktur, Engine Penelusuran, dan Entity Relationship Diagram (ERD) Komprehensif Melintasi Domain Produksi, QC, PA & Keamanan."
    pd.font.size = Pt(13)
    pd.font.color.rgb = TEXT_WHITE
    pd.font.name = FONT_BODY
    
    pd2 = tf_desc.add_paragraph()
    pd2.text = "Standar Kesiapan SJA-PRAS v1.0 (OWASP ASVS 5.0.0, NIST SP 800-218 SSDF, NIST SP 800-63B-4, NIST SP 800-34 Rev.1)"
    pd2.font.size = Pt(11)
    pd2.font.color.rgb = ACCENT_CYAN
    pd2.font.name = FONT_BODY
    
    add_metric_badge(slide, Inches(1.0), Inches(5.9), Inches(3.5), Inches(0.9), "db_traceability_sja", "Single Source of Truth MySQL", ACCENT_CYAN)
    add_metric_badge(slide, Inches(4.9), Inches(5.9), Inches(3.5), Inches(0.9), "41+ Tabel Database", "Domain Produksi • QC • PA • Security", ACCENT_AMBER)
    add_metric_badge(slide, Inches(8.8), Inches(5.9), Inches(3.5), Inches(0.9), "Score: 9.41 / 10", "Production Readiness (GO Decision)", ACCENT_EMERALD)

def build_slide_2_summary(slide):
    add_header(slide, "Executive Summary & Urgensi Traceability Industri", "LATAR BELAKANG & TUJUAN STRATEGIS", 2)
    col_w = Inches(3.7)
    
    add_card(slide, Inches(0.8), Inches(1.7), col_w, Inches(5.2), "1. TANTANGAN INDUSTRI")
    tb1 = slide.shapes.add_textbox(Inches(0.95), Inches(2.2), col_w - Inches(0.3), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    lines1 = [
        ("Kompleksitas Multi-Tower", "Operasional simultan Tower 1 & Tower 2 dengan belasan parameter proses per tahap."),
        ("Kecepatan Isolasi Recall", "Penanganan isu mutu memerlukan penelusuran mundur instan dalam hitungan detik."),
        ("Audit Kepatuhan Ketat", "Standar FSSC 22000, BPOM, dan regulasi keamanan pangan mewajibkan data presisi."),
        ("Pencegahan Silo Data", "Data produksi, lab QC, dan sanitasi PA tidak boleh terisolasi di berkas manual.")
    ]
    for i, (title, txt) in enumerate(lines1):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = ACCENT_CYAN
        p2 = tf1.add_paragraph()
        p2.text = f"  {txt}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(4.8), Inches(1.7), col_w, Inches(5.2), "2. SOLUSI TRACEABILITY")
    tb2 = slide.shapes.add_textbox(Inches(4.95), Inches(2.2), col_w - Inches(0.3), Inches(4.5))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    lines2 = [
        ("Multi-Echelon Trace", "Menghubungkan batch packing ke spray dryer, evaporasi, ekstraksi, hingga roasting."),
        ("Rekonsiliasi Mass Balance", "Menghitung otomatis Yield Roasting (%) dan Rasio IC secara matematis presisi."),
        ("Integrasi Domain QC & PA", "Menyajikan hasil uji fisik/kimia tangki dan status sanitasi CIP per siklus batch."),
        ("Dual Ingestion Pipeline", "Mendukung upload batch Excel audit dan sinkronisasi berkala via Google Sheets API.")
    ]
    for i, (title, txt) in enumerate(lines2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = ACCENT_AMBER
        p2 = tf2.add_paragraph()
        p2.text = f"  {txt}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(8.8), Inches(1.7), col_w, Inches(5.2), "3. NILAI & MANFAAT BISNIS")
    tb3 = slide.shapes.add_textbox(Inches(8.95), Inches(2.2), col_w - Inches(0.3), Inches(4.5))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    lines3 = [
        ("Efisiensi Waktu Audit", "Waktu query batch berkurang dari 3-5 jam menjadi < 500 ms."),
        ("Zero Halusinasi Data", "Data mutlak dari MySQL tanpa rekayasa atau hardcoded mock values."),
        ("Non-Repudiation Security", "Log audit trail mencatat histori mutasi data secara transparan dan permanen."),
        ("Audit Readiness SJA-PRAS", "Mendapatkan predikat Strong Production Ready dengan skor kelayakan 9.41/10.")
    ]
    for i, (title, txt) in enumerate(lines3):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = ACCENT_EMERALD
        p2 = tf3.add_paragraph()
        p2.text = f"  {txt}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_WHITE
