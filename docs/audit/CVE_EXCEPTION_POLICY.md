# Vulnerability & CVE Management Exception Policy
## Sistem Traceability PT. Santos Jaya Abadi

### 1. Tujuan & Ruang Lingkup
Dokumen ini mengatur penanganan temuan CVE dari pemindaian dependensi (`npm audit`, Trivy, Trivy/Gitleaks) pada Sistem Traceability PT. Santos Jaya Abadi sesuai standar NIST SP 800-218 SSDF v1.1 dan GMS-PRAS v1.0.

### 2. Kebijakan Pengecualian (Exception Policy)
Setiap CVE berstatus HIGH atau CRITICAL dilarang diabaikan (*ignored*) tanpa justifikasi teknis resmi yang didokumentasikan, mencakup:
- ID Kerentanan / Advisory URL
- Komponen & Versi terdampak
- Alasan teknis ketidakterpaparan (*reachability / exploitability analysis*)
- Mitigasi kompensasi yang diterapkan
- Tanggal evaluasi dan tanggal kedaluwarsa pengecualian

---

### 3. Daftar Pengecualian Aktif (Active Exceptions)

#### Exception EX-001: xlsx (SheetJS)
- **Advisory ID**: GHSA-4r6h-8v6p-xvw6 (Prototype Pollution) & GHSA-5pgg-2g8v-p4x9 (ReDoS).
- **Paket**: `xlsx@0.18.5` (SheetJS Community Edition).
- **Severity**: HIGH.
- **Analisis Keterpaparan**:
  1. Input file Excel hanya diakses oleh pengguna dengan role terotentikasi `admin` melalui endpoint terproteksi (`/api/import/:tableName`, `/api/import/inspect`).
  2. Parsing dilakukan di memori via buffer murni (`xlsx.read(buffer, { type: 'buffer' })`) tanpa interaksi dengan template engines atau recursive deep merge objek yang rentan terhadap prototype pollution.
  3. Skema kolom diverifikasi ketat menggunakan Zod dan whitelist kolom (`TABLE_COLUMNS_MAP`), sehingga nilai sel yang dibaca hanya dipetakan sebagai string/number flat tanpa dynamic object assignment.
  4. Ukuran file dibatasi maksimal 10 MB untuk mencegah ReDoS pada parsing dokumen besar.
- **Status Mitigasi**: **COMPENSATING CONTROLS ACTIVE**.
- **Tanggal Evaluasi**: 2026-10-27.
- **Tanggal Kedaluwarsa Evaluasi**: 2027-04-27 (Tinjauan berkala 6 bulan).
- **Rekomendasi Jangka Panjang**: Evaluasi migrasi ke `exceljs` jika patch SheetJS upstream belum dirilis.
