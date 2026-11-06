from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_erd_box

def build_slide_10_erd_qc_part1(slide):
    add_header(slide, "Complete ERD: Domain QC Bagian 1 - Pre-Process & Ekstraksi", "ERD LENGKAP QC (2/5)", 10)
    
    w = Inches(2.7)
    h = Inches(4.3)
    start_x = Inches(0.8)
    gap = Inches(0.25)
    y_pos = Inches(1.8)
    
    groups = [
        ("qc_mesh_t1 & qc_mesh_t2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Jam (TIME)", "Nomor Box",
            "Mesh Test > 600 gram", "Mesh Test 425-600 gram", "Mesh Test 300-425 gram",
            "Mesh Test 250-300 gram", "Mesh Test 212-250 gram", "Mesh Test 180-212 gram",
            "Mesh Test 150-180 gram", "Mesh Test < 150 gram", "Mesh < 180 / > 425", "TTD Analis"
        ], ACCENT_AMBER, 7.5),
        ("qc_grinding_t1 & t2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Jam / Shift", "Nomor Silo",
            "Partikel Size Distribution", "Moisture R&G Coffee (%)", "Densitas Gilingan",
            "Suhu Bubuk Kopi (°C)", "Aroma & Bau Bubuk", "Status Kelayakan", "TTD Analis"
        ], ACCENT_CYAN, 7.5),
        ("qc_pure_aroma & aroma_t1/t2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Jam / Shift", "Odor Sensory Profile",
            "Densitas Pure Aroma", "Persentase Dosing", "Suhu Condenser (°C)",
            "Recovery Rate Aroma (%)", "Brix Hydro Condensate", "Status Organoleptik", "TTD Analis"
        ], ACCENT_EMERALD, 7.5),
        ("qc_evaporasi & tank_system", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Jam / Shift", "Nomor Tangki Feed",
            "Brix Refractometer (°Bx)", "pH Extract Liquid", "Total Solid (TS %)",
            "Sedimen Konsentrat (%)", "Viskositas Liquid", "Status In-Process", "TTD Analis"
        ], ACCENT_ROSE, 7.5)
    ]
    
    for i, (tbl, pks, flds, col, sz) in enumerate(groups):
        x = start_x + i * (w + gap)
        add_erd_box(slide, x, y_pos, w, h, tbl, pks, flds, col, sz)
        
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_CYAN)
    tb = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Integritas Pengujian Pre-Process: Setiap sampel mesh dan aroma dikaitkan langsung dengan No. Batch. Deviasi ukuran partikel mesh atau pH tangki di luar rentang standar akan memicu peringatan dini sebelum proses spray drying."
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_WHITE

def build_slide_11_erd_qc_part2(slide):
    add_header(slide, "Complete ERD: Domain QC Bagian 2 - Spray Dryer & Produk Akhir", "ERD LENGKAP QC (3/5)", 11)
    
    w = Inches(2.7)
    h = Inches(4.3)
    start_x = Inches(0.8)
    gap = Inches(0.25)
    y_pos = Inches(1.8)
    
    groups = [
        ("qc_final_tank & feed_tank", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Jam / Shift", "Nomor Final Tank",
            "Level Tangki (%)", "Suhu Konsentrat (°C)", "TS Final Tank (TS %)",
            "pH Konsentrat Kopi", "Sedimen Tangki (%)", "Brix Akhir Konsentrat",
            "Status Kelayakan Umpan Dryer", "TTD Analis QC"
        ], ACCENT_CYAN, 7.5),
        ("qc_dryer_t1 & qc_dryer_t2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Nomor Box / Jam",
            "Kadar Air (%) [Maks 3.5%]", "Density (g/L)", "FM (Foreign Matter)",
            "Viskositas & Warna Bubuk", "Brix (°brix) & pH", "Floating Particles",
            "Fluidity & Solubility (detik)", "Status (RELEASE / HOLD)", "TTD Analis"
        ], ACCENT_AMBER, 7.5),
        ("qc_dryer (Cup Test Sensori)", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk (VARCHAR)", "Nomor Box / Jam",
            "Cup Test Wangi (Skala 1-5)", "Cup Test Pahit (Skala 1-5)",
            "Cup Test Asam (Skala 1-5)", "Cup Test Body (Skala 1-5)",
            "Cup Test Sepet (Skala 1-5)", "Keterangan Organoleptik",
            "Panelis Sensori Terakreditasi", "TTD Kepala Lab QC"
        ], ACCENT_EMERALD, 7.5),
        ("qc_rework_t1 & rework_t2", ["id (INT PK)", "Tanggal (DATE)", "Batch (INT)"], [
            "Stamp (DATETIME)", "Produk Asal (VARCHAR)", "Jam / Shift",
            "Alasan Rework (Moisture / Density)", "Nomor Tangki Rework",
            "Formula Blending Persentase", "Uji Ulang Kadar Air (%)",
            "Uji Ulang Kelarutan (s)", "Disposisi Akhir Rework", "Approval Manajer QC"
        ], ACCENT_ROSE, 7.5)
    ]
    
    for i, (tbl, pks, flds, col, sz) in enumerate(groups):
        x = start_x + i * (w + gap)
        add_erd_box(slide, x, y_pos, w, h, tbl, pks, flds, col, sz)
        
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_EMERALD)
    tb = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Gerbang Kelulusan Produk (Quality Release Gate): 22 tabel QC mencakup seluruh checkpoint dari tangki umpan, spray dryer, hingga uji organoleptik cup test. Data tersimpan permanen di database tanpa rekayasa file eksternal."
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_WHITE

