from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_process_node

def build_slide_7_data_ingestion_flowchart(slide):
    add_header(slide, "Data Ingestion Engine: Alur Penyerapan & Sinkronisasi", "FLOW CHART DATA ENGINE (4/5)", 7)
    
    col_w = Inches(5.6)
    
    # Left: Excel pipeline
    add_card(slide, Inches(0.8), Inches(1.8), col_w, Inches(4.3), "JALUR 1: BATCH EXCEL INGESTION ENGINE", ACCENT_AMBER)
    steps_excel = [
        ("UPLOAD & MEMORY BUFFER", "File .xlsx / .xls diunggah ke RAM (maks 15MB, zero disk leftover)."),
        ("ZOD CONTRACT GATEWAY", "Validasi ketat nama tabel hanya dari ALLOWED_TABLES whitelist."),
        ("HEADER & DATE CONVERTER", "Matching nama kolom otomatis & konversi serial date dengan presisi leap second."),
        ("DEDUPLICATION SAFEGUARD", "dedupHelper mengecek database untuk mengeliminasi baris ganda."),
        ("ACID TRANSACTION WRITE", "Insert per chunk 500 baris dengan rollback otomatis jika terjadi kegagalan."),
        ("AUDIT TRAIL LOGGING", "Mencatat nama file, jumlah baris sukses, dan user operator ke audit_logs.")
    ]
    tb1 = slide.shapes.add_textbox(Inches(1.0), Inches(2.25), col_w - Inches(0.4), Inches(3.7))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    for i, (title, desc) in enumerate(steps_excel):
        p = tf1.paragraphs[0] if i == 0 else tf1.add_paragraph()
        p.text = f"{i+1}. {title}: "
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = ACCENT_AMBER
        p2 = tf1.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(8)
        p2.font.color.rgb = TEXT_WHITE

    # Right: Google Sheets pipeline
    add_card(slide, Inches(6.9), Inches(1.8), col_w, Inches(4.3), "JALUR 2: GOOGLE SHEETS AUTO-SYNC WORKER", ACCENT_CYAN)
    steps_gsheet = [
        ("SCHEDULED CRON WORKER", "Daemon background berjalan otomatis per interval (default: tiap 5 menit)."),
        ("MULTI-SERVICE AUTHENTICATION", "Kredensial Service Account terpisah untuk Produksi, QC, dan PA."),
        ("INCREMENTAL DATA POLLING", "Hanya mengambil range baris terbaru berdasarkan timestamp modifikasi."),
        ("SMART UPSERT ENGINE", "Update data yang dimutasi dan insert batch baru tanpa konflik indeks."),
        ("FAULT TOLERANT MASKING", "Menghandle gangguan konektivitas internet tanpa menghentikan web server."),
        ("OBSERVABILITY TELEMETRY", "Merekam status sinkronisasi, latency waktu, dan error log transparan.")
    ]
    tb2 = slide.shapes.add_textbox(Inches(7.1), Inches(2.25), col_w - Inches(0.4), Inches(3.7))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    for i, (title, desc) in enumerate(steps_gsheet):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"{i+1}. {title}: "
        p.font.bold = True
        p.font.size = Pt(8.5)
        p.font.color.rgb = ACCENT_CYAN
        p2 = tf2.add_paragraph()
        p2.text = f"   {desc}"
        p2.font.size = Pt(8)
        p2.font.color.rgb = TEXT_WHITE

    # Bottom
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_EMERALD)
    tb_b = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True
    pb = tf_b.paragraphs[0]
    pb.text = "Integritas Data Tanpa Henti: Kedua jalur penyerapan menjamin database MySQL (db_traceability_sja) selalu mutakhir (real-time up to date) dengan validasi tipe data ketat dan nol duplikasi."
    pb.font.size = Pt(9.5)
    pb.font.color.rgb = TEXT_WHITE

def build_slide_8_qa_gateway_flowchart(slide):
    add_header(slide, "Quality Assurance Gateway: Alur Verifikasi Mutu & Sanitasi", "FLOW CHART GATEWAY QC & PA (5/5)", 8)
    
    stages = [
        ("QC TAHAP 1", "Grinding & Aroma", [
            "Partikel Mesh Test (>600 s/d <150g)",
            "Moisture R&G Coffee",
            "Sensori Pure Aroma Odor Profile",
            "Recovery Rate & Suhu Hydro"
        ], ACCENT_CYAN),
        ("QC TAHAP 2", "Konsentrat Tangki", [
            "pH Extract & Separated Tank",
            "Brix Refractometer Liquid",
            "Total Solid (TS %) Tangki Final",
            "Sedimen & Densitas Cairan"
        ], ACCENT_AMBER),
        ("QC TAHAP 3", "Bubuk Spray Dryer", [
            "Kadar Air (%) Maksimal 3.5%",
            "Bulk Density (g/L)",
            "Solubility Index / Kelarutan (detik)",
            "Cup Test (Wangi, Pahit, Asam, Body)"
        ], ACCENT_ROSE),
        ("PA ASSURANCE", "Air Proses & CIP", [
            "FWT: pH 6.5-8.5, TDS < 150, Kekeruhan",
            "CIP: Suhu Soda > 75°C, NaOH 1.5-2.0%",
            "EMP: Swab Higienis Salmonella Negatif",
            "ABE: Tekanan Ruang Positif & Partikel"
        ], ACCENT_EMERALD)
    ]
    
    w = Inches(2.7)
    gap = Inches(0.25)
    start_x = Inches(0.8)
    
    for i, (tag, title, b, col) in enumerate(stages):
        x = start_x + i * (w + gap)
        add_process_node(slide, x, Inches(1.8), w, Inches(2.9), tag, title, b, col)
        
    # Decision Gate Banner
    add_card(slide, Inches(0.8), Inches(4.9), Inches(11.7), Inches(2.1), "GATEWAY KEPUTUSAN RILIS PRODUK (RELEASE / HOLD / REWORK)", ACCENT_EMERALD)
    tb = slide.shapes.add_textbox(Inches(1.0), Inches(5.35), Inches(11.3), Inches(1.5))
    tf = tb.text_frame
    tf.word_wrap = True
    rules = [
        "• Status RELEASE (Hijau): Seluruh parameter fisik/kimia QC dalam spesifikasi DAN siklus sanitasi CIP & air PA tervalidasi OK.",
        "• Status HOLD / KARANTINA (Kuning): Ditemukan deviasi parameter (misal moisture dryer > 3.8% atau CIP belum selesai). Batch otomatis terkunci.",
        "• Status REWORK (Merah): Batch diarahkan ke tangki qc_rework_t1 / qc_rework_t2 untuk blending terkontrol sesuai prosedur mutu pangan.",
        "• Zero-Tolerance Food Safety: Tidak ada produk yang dapat didistribusikan tanpa approval digital lengkap dari analis QC dan auditor PA."
    ]
    for i, r in enumerate(rules):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = r
        p.font.size = Pt(9)
        p.font.color.rgb = TEXT_WHITE

