# Project Agent Instructions

Load and follow the global instructions and quality constraints from:
- `~/.ag/AG_GLOBAL_INSTRUCTIONS.md`

### Core Mandates:
1. **Anti-Halusinasi & Single Source of Truth**: Wajib ambil data murni dari Database MySQL (`db_traceability_sja`). Sistem HANYA memiliki 3 domain data di DB: Produksi, QC, dan PA. Dilarang keras hardcode fallback dari file Excel contoh audit. Jika data/tabel/field/PIC tidak ditemukan di database, WAJIB menampilkan tulisan 'Data tidak ditemukan'.
2. **Anti-AI Slop**: Buat kode modular (<200 baris/file), tanpa komentar berlebihan, dan gunakan UI industrial-clean ber-kontras tinggi tanpa efek visual murahan.
3. **Skills**: Gunakan skills yang terdaftar di `.agents/skills` dan `~/.ag/skills` (misal `anti-halusinasi-db`, `clean-dashboard-ui`).
4. **SJA Audit Standard**: Patuhi standar SJA-PRAS v1.0 (OWASP ASVS 5.0.0, NIST SP 800-218 SSDF v1.1, NIST SP 800-63B-4, NIST SP 800-34 Rev.1, SLSA v1.2) di setiap audit dan penulisan kode.

