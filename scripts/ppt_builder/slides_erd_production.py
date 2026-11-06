from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_erd_box

def build_slide_9_erd_production(slide):
    add_header(slide, "Complete ERD: Domain Produksi (11 Tabel Lengkap)", "ERD LENGKAP PRODUKSI (1/5)", 9)
    
    # 5 Main Process Blocks displaying all 11 production tables
    w = Inches(2.2)
    h = Inches(4.3)
    start_x = Inches(0.8)
    gap = Inches(0.18)
    y_pos = Inches(1.8)
    
    tables = [
        ("roasting_probat & scolari 1/2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Shift / Team", "Mode Goreng", "Silo Degassing",
            "Start & Roasting Time", "Temperatur End Roast", "Volume air quench",
            "Warna & Bau Kopi", "Foreign Matter", "SiloCell 1 - SiloCell 8",
            "Jenis Kopi Mentah", "berat kopi matang", "Susut Goreng (%)", "Nama Petugas"
        ], ACCENT_AMBER, 7.5),
        ("extraction_tower_1 & 2", ["id (INT PK)", "Batch (INT)", "Tanggal (DATE)"], [
            "Stamp (DATETIME)", "Shift / Team", "Mode / Degassing", "Perculator",
            "Start Extraction", "Amount Aroma Extract", "TS Aroma Extract",
            "Amount Hydrolysis Extract", "TS Hydrolysis Extract", "Level Extract Tank",
            "Grinding / Moist R&G", "TS Extract Tank", "Nama Petugas"
        ], ACCENT_CYAN, 7.5),
        ("evaporation_tower_1 & 2", ["id (INT PK)", "Batch (INT)", "Tanggal (DATE)"], [
            "stamp (DATETIME)", "Shift / Team", "Mode", "Separated Tank",
            "Level Separated Tank", "TS Separated Tank", "Nilai Sedimen Tank",
            "Start / Finish Tank", "Destination Final Tank", "Level Final Tank",
            "Pure Aroma Dosing", "TS Final Tank", "Temp. Output Evap", "Nama Petugas"
        ], ACCENT_EMERALD, 7.5),
        ("dryer_tower_1 & 2", ["id (INT PK)", "Batch (VARCHAR)", "Tanggal (DATE)"], [
            "Stamp (DATETIME)", "Waktu / Nama", "Shift / Team", "Final Tank & Level",
            "Temperatur Final Tank", "TS Final Tank", "Level Feed System Tank",
            "Feed Pressure (H1B1K03)", "Speed Feed Pump", "Nozzle Pressure",
            "Feed Mass Flow", "Factor Gas / CO2 Flow", "Temp Main Air / SFB"
        ], ACCENT_CYAN, 7.5),
        ("packing_tower_1 & 2", ["id (INT PK)", "batch (INT)", "tanggal (DATE)"], [
            "stamp (DATETIME)", "waktu / nama", "shift / team", "pin (INT)",
            "nama_produk", "ok_box (DECIMAL)", "hold_box (DECIMAL)", "bo_box / bo_kg",
            "waste_dust_collector_kg", "waste_metal_separator", "waste_sapuan_kg",
            "kondisi_dehumidifier", "temp_ruang_packing", "rh_ruang_packing"
        ], ACCENT_AMBER, 7.5)
    ]
    
    for i, (tbl, pks, flds, col, sz) in enumerate(tables):
        x = start_x + i * (w + gap)
        add_erd_box(slide, x, y_pos, w, h, tbl, pks, flds, col, sz)
        
    # Relational Integrity Footer
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_CYAN)
    tb = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Relasi Logikal Echelon Produksi: Dihubungkan melalui komposit tuple (batch, tanggal, tower, shift). Roasting dipetakan ke ekstraksi melalui Silo Degassing; Ekstraksi ke Evaporator via Separated Tank; Evaporator ke Dryer via Destination Final Tank; Dryer ke Packing via Nomor Batch & PIN."
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_WHITE

