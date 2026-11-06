from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card

def build_slide_3_architecture(slide):
    add_header(slide, "Arsitektur Sistem & Prinsip Desain Anti-Halusinasi", "ARSITEKTUR & DATA INTEGRITY", 3)
    col_w = Inches(3.7)
    
    add_card(slide, Inches(0.8), Inches(1.6), col_w, Inches(3.8), "LAYER 1: PRESENTATION (UI)")
    tb1 = slide.shapes.add_textbox(Inches(0.95), Inches(2.1), col_w - Inches(0.3), Inches(3.1))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    for p_txt in [
        "Modern React 19 + TypeScript untuk dashboard analitik cepat dan tipe data ketat.",
        "Industrial SCADA UI ber-kontras tinggi, dark slate layout, tanpa visual murahan.",
        "Interactive Batch Query, Dynamic Flow Cards, KPI Metrics, PIC Viewer.",
        "Dual-running: SPA modern (/app) dan HTML klasik fallback."
    ]:
        p = tf1.add_paragraph()
        p.text = f"• {p_txt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(4.8), Inches(1.6), col_w, Inches(3.8), "LAYER 2: BACKEND & SERVICES")
    tb2 = slide.shapes.add_textbox(Inches(4.95), Inches(2.1), col_w - Inches(0.3), Inches(3.1))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    for p_txt in [
        "Node.js & Express.js REST API dengan modularitas kode tinggi (<200 LOC/file).",
        "Zod Runtime Contract Boundary: Validasi format batch dan whitelist tabel ketat.",
        "Orkestrator Multi-Echelon Traceability (Packing, Dryer, Evap, Extract, Roasting).",
        "Security Guard: JWT Token, RBAC (4 roles), Rate Limiting, Security Headers."
    ]:
        p = tf2.add_paragraph()
        p.text = f"• {p_txt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(8.8), Inches(1.6), col_w, Inches(3.8), "LAYER 3: DATABASE & STORAGE")
    tb3 = slide.shapes.add_textbox(Inches(8.95), Inches(2.1), col_w - Inches(0.3), Inches(3.1))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    for p_txt in [
        "MySQL InnoDB (db_traceability_sja) dengan pooling koneksi ACID transactions.",
        "41+ Tabel relasional terstruktur: 11 Produksi, 22 QC, 8 PA, Users & Audit Logs.",
        "Smart UPSERT & deduplikasi otomatis mencegah data ganda dari file import.",
        "Backup terjadwal dengan SHA-256 integrity dan Actual Restore Drill teruji."
    ]:
        p = tf3.add_paragraph()
        p.text = f"• {p_txt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.6), Inches(11.7), Inches(1.4))
    banner.fill.solid()
    banner.fill.fore_color.rgb = BG_CARD
    banner.line.color.rgb = ACCENT_ROSE
    banner.line.width = Pt(1.5)
    tf_b = banner.text_frame
    tf_b.word_wrap = True
    tf_b.margin_left = Inches(0.2)
    tf_b.margin_top = Inches(0.15)
    p_bh = tf_b.paragraphs[0]
    p_bh.text = "🛡️ MANDAT MUTLAK: ANTI-HALUSINASI & SINGLE SOURCE OF TRUTH"
    p_bh.font.size = Pt(12)
    p_bh.font.bold = True
    p_bh.font.color.rgb = ACCENT_ROSE
    
    p_bd = tf_b.add_paragraph()
    p_bd.text = "1. Seluruh data wajib murni dari database MySQL (db_traceability_sja). Dilarang keras fallback ke file Excel mock-up.\n2. Jika data, tabel, field, atau PIC tidak ditemukan pada database, sistem WAJIB menampilkan 'Data tidak ditemukan'.\n3. Zero mock data policy memastikan integritas hasil audit pabrik dapat dipertanggungjawabkan 100% secara legal."
    p_bd.font.size = Pt(9.5)
    p_bd.font.color.rgb = TEXT_WHITE
