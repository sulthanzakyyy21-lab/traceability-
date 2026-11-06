from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE
from .theme import (
    add_header, BG_CARD,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_HEADING
)
from .components import add_card

def build_slide_17_roadmap(slide):
    add_header(slide, "Roadmap Strategis Pengembangan Sistem Traceability", "PENGEMBANGAN BERKELANJUTAN", 17)
    
    phases = [
        ("FASE 1 (CURRENT)", "Sistem Inti & Audit PRAS", [
            "Tersentralisasi MySQL (db_traceability_sja)",
            "Multi-echelon trace Produksi, QC, PA",
            "Audit trail & NIST SP 800-63B-4",
            "Score 9.41/10 (GO Production Ready)"
        ], ACCENT_EMERALD, "SELESAI (LIVE)"),
        ("FASE 2 (Q1-Q2 2027)", "Edge & Barcode Direct", [
            "Integrasi Scanner Barcode / QR 2D",
            "Auto-scan kemasan box di lini packing",
            "Tablet PWA offline-first untuk operator",
            "Auto-print label PIN terverifikasi"
        ], ACCENT_CYAN, "TAHAP PERSIAPAN"),
        ("FASE 3 (Q3 2027)", "Enterprise ERP Connector", [
            "Integrasi langsung ke SAP / Enterprise ERP",
            "Rekonsiliasi inventori gudang otomatis",
            "Sinkronisasi dispatch delivery order",
            "Pelacakan batch hingga distributor / toko"
        ], ACCENT_AMBER, "ROADMAP"),
        ("FASE 4 (Q4 2027)", "AI / ML Predictive Quality", [
            "Deteksi anomali parameter mesin roaster",
            "Prediksi deviasi Yield Roasting & TS tangki",
            "Optimasi energi thermal spray dryer",
            "Early warning pencegahan produk hold/BO"
        ], ACCENT_ROSE, "FUTURE VISION")
    ]
    
    card_w = Inches(2.7)
    start_x = Inches(0.8)
    gap = Inches(0.25)
    y_pos = Inches(1.8)
    
    for i, (fase, title, items, col, status) in enumerate(phases):
        x = start_x + i * (card_w + gap)
        add_card(slide, x, y_pos, card_w, Inches(4.3), fase, col)
        
        tb_st = slide.shapes.add_textbox(x + Inches(0.15), y_pos + Inches(0.45), card_w - Inches(0.3), Inches(0.3))
        p_st = tb_st.text_frame.paragraphs[0]
        p_st.text = f"[{status}] - {title}"
        p_st.font.size = Pt(8.5)
        p_st.font.bold = True
        p_st.font.color.rgb = col
        
        tb = slide.shapes.add_textbox(x + Inches(0.1), y_pos + Inches(0.8), card_w - Inches(0.2), Inches(3.3))
        tf = tb.text_frame
        tf.word_wrap = True
        for itm in items:
            p = tf.add_paragraph()
            p.text = f"• {itm}"
            p.font.size = Pt(8.5)
            p.font.color.rgb = TEXT_WHITE
            
    close_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8))
    close_card.fill.solid()
    close_card.fill.fore_color.rgb = BG_CARD
    close_card.line.color.rgb = ACCENT_AMBER
    close_card.line.width = Pt(1.5)
    tf = close_card.text_frame
    p = tf.paragraphs[0]
    p.text = "🏆 Roadmap 2026-2027: Mewujudkan Smart Factory Berbasis Kepatuhan Mutu Presisi & Nol Cacat."
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_AMBER
    p.alignment = PP_ALIGN.CENTER

def build_slide_18_conclusion(slide):
    add_header(slide, "Kesimpulan & Komitmen Integritas PT. Santos Jaya Abadi", "PENUTUP & TANYA JAWAB", 18)
    
    col_w = Inches(3.7)
    
    add_card(slide, Inches(0.8), Inches(1.8), col_w, Inches(4.1), "1. DATA INTEGRITY", ACCENT_CYAN)
    tb1 = slide.shapes.add_textbox(Inches(1.0), Inches(2.3), col_w - Inches(0.4), Inches(3.4))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    pts1 = [
        "100% Data Murni MySQL (db_traceability_sja) tanpa data palsu.",
        "Pemisahan tegas 3 domain operasional: Produksi, QC, dan PA.",
        "Jika data tidak ada di DB, sistem mutlak menampilkan 'Data tidak ditemukan'."
    ]
    for pt in pts1:
        p = tf1.add_paragraph()
        p.text = f"✓ {pt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(4.8), Inches(1.8), col_w, Inches(4.1), "2. AUDIT COMPLIANCE", ACCENT_AMBER)
    tb2 = slide.shapes.add_textbox(Inches(5.0), Inches(2.3), col_w - Inches(0.4), Inches(3.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    pts2 = [
        "Skor Audit SJA-PRAS v1.0 mencapai 9.41 / 10.0 (Status GO).",
        "Kepatuhan 5 pilar formal (OWASP ASVS, NIST SSDF, NIST 800-63B, NIST 800-34, SLSA).",
        "Restore drill teruji memulihkan 260k+ baris pada 43 tabel dalam 2.6 detik."
    ]
    for pt in pts2:
        p = tf2.add_paragraph()
        p.text = f"✓ {pt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(8.8), Inches(1.8), col_w, Inches(4.1), "3. OPERATIONAL VALUE", ACCENT_EMERALD)
    tb3 = slide.shapes.add_textbox(Inches(9.0), Inches(2.3), col_w - Inches(0.4), Inches(3.4))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    pts3 = [
        "Penelusuran multi-echelon instan (< 500 ms) dari batch box ke biji kopi.",
        "Isolasi batch terarah mencegah kerugian recall produk pangan secara masif.",
        "Non-repudiation audit trail menjamin bukti forensik terpercaya."
    ]
    for pt in pts3:
        p = tf3.add_paragraph()
        p.text = f"✓ {pt}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

    # Big Q&A Box
    qa_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.05), Inches(11.7), Inches(1.0))
    qa_card.fill.solid()
    qa_card.fill.fore_color.rgb = BG_CARD
    qa_card.line.color.rgb = ACCENT_AMBER
    qa_card.line.width = Pt(1.5)
    tf_qa = qa_card.text_frame
    p_qa1 = tf_qa.paragraphs[0]
    p_qa1.text = "TERIMA KASIH — SESI DISKUSI & TANYA JAWAB (Q & A)"
    p_qa1.font.size = Pt(14)
    p_qa1.font.bold = True
    p_qa1.font.color.rgb = ACCENT_AMBER
    p_qa1.alignment = PP_ALIGN.CENTER
    p_qa2 = tf_qa.add_paragraph()
    p_qa2.text = "PT. Santos Jaya Abadi • Plant Operations & Quality Assurance • db_traceability_sja"
    p_qa2.font.size = Pt(10)
    p_qa2.font.color.rgb = TEXT_WHITE
    p_qa2.alignment = PP_ALIGN.CENTER

