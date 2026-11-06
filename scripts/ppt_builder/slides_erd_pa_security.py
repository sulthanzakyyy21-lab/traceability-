from pptx.util import Inches, Pt
from .theme import (
    add_header, BG_CARD, BORDER_COLOR,
    ACCENT_AMBER, ACCENT_CYAN, ACCENT_EMERALD, ACCENT_ROSE,
    TEXT_WHITE, FONT_BODY
)
from .components import add_card, add_erd_box

def build_slide_12_erd_pa(slide):
    add_header(slide, "Complete ERD: Domain Process Assurance / PA (8 Tabel Lengkap)", "ERD LENGKAP PA (4/5)", 12)
    
    w = Inches(2.7)
    h = Inches(4.3)
    start_x = Inches(0.8)
    gap = Inches(0.25)
    y_pos = Inches(1.8)
    
    groups = [
        ("pa_fwt_t1 & pa_fwt_t2", ["id (INT PK)", "Tanggal & Waktu (DATETIME)"], [
            "pH Air Proses (6.5 - 8.5)", "TDS (Total Dissolved Solids ppm)",
            "Kekeruhan Air (NTU)", "Kesadahan Total (CaCO3 ppm)", "Sisa Khlor Aktif (ppm)",
            "Kandungan Logam (Mangan & Besi)", "Aluminium & Warna",
            "Uji Bakteriologis: E. Coli", "Uji Bakteriologis: Total Coliform",
            "Pseudomonas Aeruginosa", "Noted / Analis Lab PA"
        ], ACCENT_CYAN, 7.5),
        ("pa_cip_t1 & pa_cip_t2", ["id (INT PK)", "Tanggal & Waktu", "Peralatan"], [
            "Stamp (DATETIME)", "Waktu Sirkulasi (Menit)",
            "Peralatan: Extractor / Evaporator / FT / Dryer / Pack",
            "pH Lab Sirkulasi NaOH / Acid", "Conductivity Sirkulasi (mS/cm)",
            "Uji Swab Residu Kimia", "pH In-Line Pipa Sirkuit",
            "Start Final Rinse RO", "Finish Final Rinse RO",
            "Status Kelulusan Sanitasi", "Keterangan Petugas CIP"
        ], ACCENT_AMBER, 7.5),
        ("pa_emp_t1 & pa_emp_t2", ["id (INT PK)", "Tanggal & Waktu (DATETIME)"], [
            "Titik Sampling / Lokasi", "Zona Higienis (Zone 1 - 4)",
            "Swab Permukaan Kontak Pangan", "Total Plate Count (TPC cfu/cm2)",
            "Yeast & Mold Count", "Status Salmonella (Negatif/Positif)",
            "Status Listeria Monocytogenes", "Tindakan Koreksi Kebersihan",
            "Verifikasi Auditor Higienitas", "Keterangan Inspeksi"
        ], ACCENT_EMERALD, 7.5),
        ("pa_abe_t1 & pa_abe_t2", ["id (INT PK)", "Tanggal & Waktu (DATETIME)"], [
            "Area Ruangan: Packing / Transit", "Tekanan Diferensial Ruang (Pa)",
            "Suhu Ruang Pengemasan (°C)", "Kelembaban Relatif / RH (%)",
            "Particle Counter (0.5µm & 5.0µm)", "Cawan Papar Udara (CFU/plate)",
            "Efisiensi Filter HVAC HEPA", "Status Higienitas Udara",
            "Petugas Verifikasi Lingkungan"
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
    p.text = "Korelasi Waktu Process Assurance: Sistem memvalidasi apakah batch diproduksi saat sirkuit CIP berstatus VALID, air umpan FWT memenuhi baku mutu Permenkes/BPOM, dan ruang pengemasan bertekanan positif bebas kontaminan udara."
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_WHITE

def build_slide_13_erd_security(slide):
    add_header(slide, "Complete ERD: Security, RBAC & Non-Repudiation Audit Trail", "ERD SECURITY & GOVERNANCE (5/5)", 13)
    
    w = Inches(5.6)
    
    add_erd_box(slide, Inches(0.8), Inches(1.8), w, Inches(4.3), "users (Tabel Autentikasi Pengguna & RBAC)", [
        "id (INT AUTO_INCREMENT PK)", "username (VARCHAR(50) UNIQUE NOT NULL)"
    ], [
        "password_hash (VARCHAR(255) NOT NULL - Bcrypt salt 10 rounds)",
        "nama_lengkap (VARCHAR(100) NOT NULL - Nama Asli Operator/Analis/PIC)",
        "role (ENUM('admin', 'produksi', 'qc', 'viewer') NOT NULL DEFAULT 'viewer')",
        "status (ENUM('active', 'inactive') NOT NULL DEFAULT 'active')",
        "failed_login_attempts (INT DEFAULT 0 - Proteksi Brute-force NIST SP 800-63B)",
        "locked_until (DATETIME NULL - Kunci akun otomatis jika salah 5 kali)",
        "last_login_at (DATETIME NULL - Telemetri akses pengguna)",
        "created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
        "updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"
    ], ACCENT_AMBER, 8)
    
    add_erd_box(slide, Inches(6.9), Inches(1.8), w, Inches(4.3), "audit_logs (Tabel Audit Trail Non-Repudiation)", [
        "id (BIGINT AUTO_INCREMENT PK)", "user_id (INT NULL FK -> users.id)"
    ], [
        "username (VARCHAR(50) NOT NULL - Pelaku Aksi / Eksekutor)",
        "action (ENUM('LOGIN', 'LOGOUT', 'IMPORT', 'SYNC', 'UPDATE', 'DELETE') NOT NULL)",
        "table_name (VARCHAR(64) NOT NULL - Nama Tabel yang Dimutasi)",
        "record_id (VARCHAR(64) NULL - Primary Key / No. Batch Data Terkait)",
        "before_value (JSON NULL - Snapshot Data Lengkap Sebelum Dimodifikasi)",
        "after_value (JSON NULL - Snapshot Data Lengkap Sesudah Dimodifikasi)",
        "ip_address (VARCHAR(45) NULL - IP Forensik IPv4 / IPv6)",
        "user_agent (TEXT NULL - Spesifikasi Peramban / Klien API)",
        "created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP - Waktu Mutasi Presisi)"
    ], ACCENT_EMERALD, 8)
    
    add_card(slide, Inches(0.8), Inches(6.25), Inches(11.7), Inches(0.8), "", ACCENT_CYAN)
    tb = slide.shapes.add_textbox(Inches(0.95), Inches(6.3), Inches(11.4), Inches(0.7))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "Integritas Forensik Berstandar ISO 27001 & FDA 21 CFR Part 11: Tabel audit_logs bersifat APPEND-ONLY. Tidak ada endpoint yang mengizinkan UPDATE atau DELETE pada tabel audit_logs, menjamin bukti mutasi transaksi 100% otentik dan tidak dapat disangkal."
    p.font.size = Pt(8.5)
    p.font.color.rgb = TEXT_WHITE

