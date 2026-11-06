from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_metric_badge

def build_slide_15_audit_pras(slide):
    add_header(slide, "Kepatuhan Standar Audit Kesiapan Produksi (SJA-PRAS v1.0)", "SECURITY & AUDIT COMPLIANCE", 15)
    
    add_metric_badge(slide, Inches(0.8), Inches(1.6), Inches(2.7), Inches(1.1), "9.41 / 10.0", "Production Score (Level 9.3+)", ACCENT_EMERALD)
    add_metric_badge(slide, Inches(3.8), Inches(1.6), Inches(2.7), Inches(1.1), "STATUS: GO", "Release Decision (12 Gates PASS)", ACCENT_CYAN)
    add_metric_badge(slide, Inches(6.8), Inches(1.6), Inches(2.7), Inches(1.1), "260.301 Baris", "Actual Restore Drill Teruji (2.6s)", ACCENT_AMBER)
    add_metric_badge(slide, Inches(9.8), Inches(1.6), Inches(2.7), Inches(1.1), "100% Pass", "18/18 Automated CI Test Suite", ACCENT_EMERALD)
    
    card_w = Inches(2.2)
    start_x = Inches(0.8)
    gap = Inches(0.18)
    y_pos = Inches(2.9)
    
    pillars = [
        ("OWASP ASVS 5.0.0", "Application Security", [
            "Zod API boundaries",
            "SQL injection guarded",
            "Security headers (CSP/HSTS)",
            "Fail-closed RBAC middleware"
        ], ACCENT_CYAN),
        ("NIST SP 800-63B-4", "Digital Identity", [
            "Password >= 15 karakter",
            "Common dictionary blocklist",
            "Bcrypt salt 10 rounds",
            "Brute-force rate limiter"
        ], ACCENT_AMBER),
        ("NIST 800-218 SSDF", "Secure Software Dev", [
            "Modular code (<200 LOC)",
            "Automated CI testing",
            "Zero high-risk CVEs",
            "Mitigated EX-001 SheetJS"
        ], ACCENT_EMERALD),
        ("NIST SP 800-34", "Disaster Recovery", [
            "RPO = 1 jam, RTO = 30 mnt",
            "SHA-256 backup integrity",
            "Actual restore drill teruji",
            "43 tabel terekonsiliasi"
        ], ACCENT_CYAN),
        ("SLSA v1.2", "Supply Chain Track", [
            "Git commit audit trail",
            "Deterministic build scripts",
            "start / stop / check .bat",
            "No unverified binaries"
        ], ACCENT_AMBER)
    ]
    
    for i, (title, sub, items, col) in enumerate(pillars):
        x = start_x + i * (card_w + gap)
        add_card(slide, x, y_pos, card_w, Inches(4.1), title, col)
        tb = slide.shapes.add_textbox(x + Inches(0.1), y_pos + Inches(0.5), card_w - Inches(0.2), Inches(3.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p_sub = tf.paragraphs[0]
        p_sub.text = sub
        p_sub.font.size = Pt(9)
        p_sub.font.bold = True
        p_sub.font.color.rgb = col
        for itm in items:
            p = tf.add_paragraph()
            p.text = f"✓ {itm}"
            p.font.size = Pt(8.5)
            p.font.color.rgb = TEXT_WHITE

def build_slide_16_ui_dashboard(slide):
    add_header(slide, "Antarmuka Pengguna & Fitur Dashboard: SCADA Industrial UI", "USER INTERFACE & PENGALAMAN PENGGUNA", 16)
    
    col_w = Inches(5.6)
    
    add_card(slide, Inches(0.8), Inches(1.8), col_w, Inches(5.2), "FILOSOFI DESAIN: INDUSTRIAL SCADA CLEAN", ACCENT_AMBER)
    tb1 = slide.shapes.add_textbox(Inches(1.0), Inches(2.3), col_w - Inches(0.4), Inches(4.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    design_points = [
        ("Dark Slate High-Contrast", "Palet warna #0F172A dan #1E293B mengurangi kelelahan mata operator di ruang kontrol pabrik."),
        ("Tipografi Teknis Monospace", "Data batch, serial PIN, tanggal, dan nilai sensor ditampilkan dengan alignment angka yang presisi."),
        ("Zero-Clutter Bento Grid", "Maksimal 1 level kedalaman kartu tanpa gradien mengkilap atau bayangan yang mengganggu pembacaan."),
        ("Progressive Disclosure", "Detail teknis tangki dan sensor muncul bertahap saat operator membutuhkan inspeksi mendalam."),
        ("Dual Runtime UI", "Mendukung aplikasi modern React 19 (/app) serta interface SCADA murni fallback untuk perangkat terminal lama.")
    ]
    for i, (title, desc) in enumerate(design_points):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = ACCENT_AMBER
        p2 = tf1.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_WHITE

    add_card(slide, Inches(6.9), Inches(1.8), col_w, Inches(5.2), "FITUR-FITUR UTAMA APLIKASI", ACCENT_CYAN)
    tb2 = slide.shapes.add_textbox(Inches(7.1), Inches(2.3), col_w - Inches(0.4), Inches(4.5))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    app_features = [
        ("Multi-Echelon Trace Search", "Pencarian instan no. batch penuh (misal: A370/26) dengan pilihan Tower 1 atau Tower 2."),
        ("KPI Summary Metric Cards", "Menampilkan Total Output (Kg/Box), Yield Roasting, Rasio IC, dan Status Karantina secara real-time."),
        ("Dynamic Stage Flowcards", "Visualisasi interaktif parameter Packing, Dryer, Evaporasi, Ekstraksi, Roasting, QC, dan PA."),
        ("PIC Data Converter & Viewer", "Alat verifikasi baris per operator shift, pengecekan duplikasi, dan pratinjau sebelum commit data."),
        ("Audit Logs Governance Panel", "Tampilan log audit trail khusus role Admin untuk melacak histori modifikasi sistem.")
    ]
    for i, (title, desc) in enumerate(app_features):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {title}: "
        p.font.bold = True
        p.font.size = Pt(10)
        p.font.color.rgb = ACCENT_CYAN
        p2 = tf2.add_paragraph()
        p2.text = f"  {desc}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = TEXT_WHITE
