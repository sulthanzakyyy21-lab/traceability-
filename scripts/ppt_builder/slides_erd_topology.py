from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_process_node

def build_slide_14_relational_topology(slide):
    add_header(slide, "Master Relational Linkage Topology: Topologi Relasi Lintas Domain", "TOPOLOGI RELASI DATABASE", 14)
    
    col_w = Inches(3.7)
    
    # 3 Domain Relational Columns
    add_card(slide, Inches(0.8), Inches(1.8), col_w, Inches(4.3), "1. RELASI PRODUKSI ➔ QC", ACCENT_AMBER)
    tb1 = slide.shapes.add_textbox(Inches(1.0), Inches(2.25), col_w - Inches(0.4), Inches(3.7))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    prod_qc = [
        ("Roasting ➔ QC Grinding & Mesh", "Tuple: (batch, tanggal, silo). Memvalidasi ukuran partikel bubuk gilingan sebelum diekstraksi."),
        ("Ekstraksi ➔ QC Aroma & Hydro", "Tuple: (batch, tanggal, waktu). Menguji densitas aroma recover & brix condensate."),
        ("Evaporasi ➔ QC Tangki Konsentrat", "Tuple: (batch, separated_tank). Mengontrol Total Solid (TS %) dan sedimentasi."),
        ("Spray Dryer ➔ QC Dryer & Cup Test", "Tuple: (batch, final_tank, no_box). Menguji kadar air, density, kelarutan & sensori rasa."),
        ("Packing ➔ QC Rework", "Tuple: (batch, tanggal). Mengontrol penanganan produk hold/rework secara presisi.")
    ]
    for i, (title, desc) in enumerate(prod_qc):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = ACCENT_AMBER
        p2 = tf1.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(8)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(4.8), Inches(1.8), col_w, Inches(4.3), "2. RELASI PRODUKSI ➔ PA", ACCENT_CYAN)
    tb2 = slide.shapes.add_textbox(Inches(5.0), Inches(2.25), col_w - Inches(0.4), Inches(3.7))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    prod_pa = [
        ("Ekstraksi & Umpan ➔ PA FWT", "Tuple: (tanggal, waktu). Menjamin air proses bebas kontaminan mikroba (E. Coli) & logam."),
        ("Ekstraktor & Evaporator ➔ PA CIP", "Tuple: (tanggal, peralatan_cip). Memverifikasi siklus pencucian sirkuit suhu >75°C & NaOH."),
        ("Final Tank & Dryer ➔ PA CIP", "Tuple: (tanggal, unit_dryer). Memastikan tangki umpan steril sebelum pengeringan."),
        ("Packing Tower ➔ PA EMP Swab", "Tuple: (tanggal, zona_packing). Memastikan belt conveyor dan corong bersih dari patogen."),
        ("Ruang Kemas ➔ PA ABE Udara", "Tuple: (tanggal, ruang_kemas). Memastikan ruang packing bertekanan positif dan steril.")
    ]
    for i, (title, desc) in enumerate(prod_pa):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = ACCENT_CYAN
        p2 = tf2.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(8)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(8.8), Inches(1.8), col_w, Inches(4.3), "3. GOVERNANCE & AUDIT TRAIL", ACCENT_EMERALD)
    tb3 = slide.shapes.add_textbox(Inches(9.0), Inches(2.25), col_w - Inches(0.4), Inches(3.7))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    sec_links = [
        ("users ➔ Seluruh Domain", "RBAC fail-closed mengunci mutasi tabel berdasarkan hak akses role (admin, prod, qc, viewer)."),
        ("Mutasi Data ➔ audit_logs", "Setiap penambahan, edit, atau sinkronisasi merekam snapshot before/after JSON."),
        ("Non-Repudiation Forensik", "Pencatatan identitas pengguna, alamat IP, timestamp milidetik, dan table_name target."),
        ("Disaster Recovery Linking", "Pencadangan berkala dengan SHA-256 merefleksikan relasi 41+ tabel secara konsisten."),
        ("Zero Data Loss Guarantee", "ACID transactional write mencegah inkonsistensi relasional saat sistem down.")
    ]
    for i, (title, desc) in enumerate(sec_links):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = ACCENT_EMERALD
        p2 = tf3.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(8)
        p2.font.color.rgb = TEXT_WHITE

    # Bottom
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_AMBER)
    tb_b = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    pb = tf_b.paragraphs[0]
    pb.text = "Sistem Relasional Holistik: Database db_traceability_sja tidak memperlakukan produksi, QC, dan sanitasi secara terpisah, melainkan sebagai satu kesatuan ekosistem manufaktur yang saling memverifikasi (cross-validation)."
    pb.font.size = Pt(8.5)
    pb.font.color.rgb = TEXT_WHITE

