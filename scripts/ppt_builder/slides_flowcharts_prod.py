from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_flow_step, add_process_node

def build_slide_4_physical_flowchart(slide):
    add_header(slide, "Manufacturing Flowchart: Alur Lengkap Proses Fisik Pabrik", "FLOW CHART LENGKAP PRODUKSI (1/5)", 4)
    
    # 2 rows of detailed plant equipment steps
    row1 = [
        ("UPBM", "1. Penerimaan Biji", ["Sampling Green Beans", "Cleaning & Destoner", "Lot SiloCell 1-8"]),
        ("ROASTER", "2. Roasting Probat/Scolari", ["Temp End Roast (°C)", "Roast Time (sec)", "Susut Goreng (%)"]),
        ("DEGASSING", "3. Quenching & Silo", ["Water Quench Volume", "Silo Degassing Kopi", "Transfer Matang (Kg)"]),
        ("EXTRACTION", "4. Grinding & Ekstraksi", ["Moist R&G Coffee", "Brix Extract Liquid", "Percolator Pressure"])
    ]
    row2 = [
        ("PACKING", "8. Packing & Box", ["Karton OK / Hold / BO", "Metal Separator Test", "Pemberian PIN & Label"]),
        ("DRYER", "7. Spray Drying", ["Feed Mass Flow", "Temp Main Air / SFB", "High Pressure Pump"]),
        ("CONCENTRATE", "6. Tangki Final & Feed", ["Total Solid (TS %)", "Temp Output Evap", "Pure Aroma Dosing"]),
        ("EVAPORATION", "5. Pemekatan Evaporator", ["Separated Tank", "Level & Vakum Mbar", "Nilai Sedimen (%)"])
    ]
    
    w = Inches(2.7)
    gap = Inches(0.25)
    start_x = Inches(0.8)
    
    for i, (tag, title, b) in enumerate(row1):
        x = start_x + i * (w + gap)
        add_process_node(slide, x, Inches(1.75), w, Inches(2.3), tag, title, b, ACCENT_AMBER)
        
    for i, (tag, title, b) in enumerate(row2):
        x = start_x + (3 - i) * (w + gap)
        add_process_node(slide, x, Inches(4.3), w, Inches(2.3), tag, title, b, ACCENT_CYAN)
        
    # Summary note
    add_card(slide, Inches(0.8), Inches(6.75), Inches(11.7), Inches(0.55), "", ACCENT_EMERALD)
    tb = slide.shapes.add_textbox(Inches(0.95), Inches(6.8), Inches(11.4), Inches(0.45))
    tb.text_frame.word_wrap = True
    p = tb.text_frame.paragraphs[0]
    p.text = "Alur Fisik Produksi Terintegrasi: Dari Biji Kopi Mentah di SiloCell hingga Karton Box Terkemas di Tower 1 & 2."
    p.font.size = Pt(9)
    p.font.color.rgb = TEXT_WHITE

def build_slide_5_backward_trace_engine(slide):
    add_header(slide, "Backward Traceability Engine: Algoritma Penelusuran Mundur", "FLOW CHART ALGORITMA RECALL (2/5)", 5)
    
    steps = [
        ("1", "Input & Normalisasi", "Terima No. Batch (e.g. A370/26), Tower 1/2. Regex ekstraksi batch 370, tahun 2026.", ACCENT_CYAN),
        ("2", "Lacak Packing Tower", "Ambil data packing_tower_X: Jam, Shift, Team, PIN, OK Box, Hold Box, Waste Kg.", ACCENT_AMBER),
        ("3", "Lacak Spray Dryer", "Query dryer_tower_X by Batch: Final Tank, Feed Pressure, TS, Temp Main Air.", ACCENT_EMERALD),
        ("4", "Lacak Evaporasi", "Query evaporation_tower_X: Separated Tank, TS, Temp Output, Pure Aroma.", ACCENT_CYAN),
        ("5", "Lacak Ekstraksi", "Query extraction_tower_X: Start/Stop time, Silo Asal Degassing, Percolator.", ACCENT_AMBER),
        ("6", "Lacak Roasting & UPBM", "Query roasting_probat/scolari: Susut Goreng, SiloCell 1-8, Jenis Kopi Mentah.", ACCENT_EMERALD),
    ]
    
    card_w = Inches(1.8)
    gap = Inches(0.18)
    start_x = Inches(0.8)
    
    for i, (num, title, desc, col) in enumerate(steps):
        x = start_x + i * (card_w + gap)
        add_flow_step(slide, x, Inches(1.8), card_w, Inches(2.8), num, title, desc, col)
        
    # Bottom Reconciliation Logic
    add_card(slide, Inches(0.8), Inches(4.8), Inches(11.7), Inches(2.2), "REKONSILIASI MASS BALANCE & KALKULASI TEKNIS", ACCENT_AMBER)
    tb = slide.shapes.add_textbox(Inches(1.0), Inches(5.25), Inches(11.3), Inches(1.6))
    tf = tb.text_frame
    tf.word_wrap = True
    formulas = [
        "1. Yield Roasting (%) = (Total Berat Kopi Matang / Total Berat Kopi Mentah) × 100%",
        "2. Rasio Instant Coffee (IC) = Berat Kopi Matang Roasting (Kg) / Total Output Produksi Packing (Kg)",
        "3. Verifikasi Deviasi: Jika Rasio IC di luar ambang batas wajar (1.8 - 2.4), flag indikator anomali material.",
        "4. Kecepatan Eksekusi: Seluruh rangkaian query bertingkat diselesaikan dalam < 450 milidetik."
    ]
    for i, f in enumerate(formulas):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = f
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

def build_slide_6_forward_containment(slide):
    add_header(slide, "Forward Traceability & Anomaly Containment: Penelusuran Maju", "FLOW CHART ISOLASI MUTU (3/5)", 6)
    
    steps = [
        ("FASE 1: DETEKSI", "Identifikasi Defek Hulu", ["Penyimpangan mutu biji UPBM", "Suhu roaster out-of-spec", "Kadar air roasting tinggi"], ACCENT_ROSE),
        ("FASE 2: PEMETAAN", "Lacak Jalur Distribusi", ["Identifikasi Silo Degassing", "Mapping jalur pipa Ekstraktor", "Cek tangki evaporasi & dryer"], ACCENT_AMBER),
        ("FASE 3: ISOLASI", "Karantina Batch Produk", ["Temukan seluruh batch packing", "Identifikasi no. karton & PIN", "Kunci status: HOLD / KARANTINA"], ACCENT_CYAN),
        ("FASE 4: DISPOSISI", "Keputusan Rilis / Recall", ["Uji ulang laboratorium QC", "Rework sesuai SOP", "Rilis resmi atau musnahkan"], ACCENT_EMERALD)
    ]
    
    w = Inches(2.7)
    gap = Inches(0.25)
    start_x = Inches(0.8)
    
    for i, (tag, title, b, col) in enumerate(steps):
        x = start_x + i * (w + gap)
        add_process_node(slide, x, Inches(1.8), w, Inches(2.7), tag, title, b, col)
        
    add_card(slide, Inches(0.8), Inches(4.7), Inches(11.7), Inches(2.3), "PROTOKOL TANGGAP DARURAT MUTU (EMERGENCY RESPONSE PROTOCOL)", ACCENT_ROSE)
    tb = slide.shapes.add_textbox(Inches(1.0), Inches(5.15), Inches(11.3), Inches(1.7))
    tf = tb.text_frame
    tf.word_wrap = True
    points = [
        "• Kecepatan Respons Krisis: Sistem memungkinkan isolasi 100% produk terdampak dalam waktu kurang dari 2 menit.",
        "• Pencegahan Penarikan Luas: Forward trace mengisolasi hanya karton dengan PIN dan batch spesifik, mencegah penarikan massal yang tidak perlu.",
        "• Integritas Rantai Pasok: Mencegah produk cacat sampai ke tangan konsumen, melindungi reputasi merek PT. Santos Jaya Abadi.",
        "• Bukti Dokumentasi Audit: Menghasilkan log kronologis investigasi otomatis untuk laporan BPOM dan sertifikasi FSSC 22000."
    ]
    for i, p_txt in enumerate(points):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = p_txt
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_WHITE

