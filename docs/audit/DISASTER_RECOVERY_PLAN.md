# Disaster Recovery & Contingency Plan (NIST SP 800-34 Rev.1)
## Sistem Traceability PT. Santos Jaya Abadi

### 1. Business Impact Analysis (BIA)
- **Kritikalitas Sistem**: Traceability proses produksi (Roasting, Ekstraksi, Evaporasi, Dryer, Packing, QC, PA).
- **Maximum Tolerable Downtime (MTD)**: 4 Jam.
- **Recovery Point Objective (RPO)**: <= 1 Jam (data transaksi harian tersimpan dalam dump & snapshot).
- **Recovery Time Objective (RTO)**: <= 30 Menit (kemampuan spin up database dari dump terverifikasi).

### 2. Preventive Controls & Backup Strategy
- **Backup Harian**: Dump skema dan data database `db_traceability_sja`.
- **Integritas Backup**: Setiap arsip backup menghasilkan checksum SHA-256 (`.sha256`) yang diverifikasi sebelum diarsipkan.
- **Lokasi Penyimpanan**: Direktori lokal terproteksi (`backups/`) dengan opsi replikasi off-host ke NAS / network share pabrik.

### 3. Restore & Exercise Procedure (Testing)
- **Otomatisasi Drill**: Menggunakan skrip `scripts/restore-drill.js`.
- **Langkah Drill**:
  1. Verifikasi kecocokan hash SHA-256 arsip backup.
  2. Inisialisasi basis data pengujian sementara (`db_traceability_test_restore`).
  3. Eksekusi import SQL dari arsip backup.
  4. Rekonsiliasi data: Memeriksa keberadaan 9 tabel produksi, 8 tabel PA, dan tabel user/audit_log.
  5. Validasi hitung baris data dan drop database sementara.
  6. Dokumentasikan hasil drill dan waktu eksekusi sebagai evidence audit.

### 4. Contingency Operation & Incident Traceability
- Jika server crash: Jalankan `start_server.bat` pada host cadangan setelah me-restore backup tervalidasi.
- Seluruh insiden kegagalan wajib dicatat dalam log insiden sistem.
