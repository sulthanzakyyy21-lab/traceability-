# GMS Production Readiness Audit Standard (GMS-PRAS v1.0)
## Adaptasi Khusus: Sistem Traceability PT. Santos Jaya Abadi

Dokumen ini merupakan standar resmi penjaminan mutu, kesiapan produksi (*production readiness*), dan keamanan siber untuk Sistem Traceability PT. Santos Jaya Abadi (SJA).

---

## 1. Baseline & Benchmark Standar Formal
1. **Keamanan Aplikasi Web**: **OWASP ASVS 5.0.0** (Stable). Digunakan sebagai yardstick tingkat kepercayaan security controls (L1 & L2).
2. **Secure Software Development Lifecycle (SSDF)**: **NIST SP 800-218 SSDF v1.1 FINAL**. (*Catatan: Draft Rev.1 / SSDF v1.2 hanya diperlakukan sebagai forward-looking recommendation, bukan penalti skor*).
3. **Autentikasi & Digital Identity**: **NIST SP 800-63B-4**:
   - Minimum 15 karakter untuk single-factor password.
   - Minimum 8 karakter jika hanya digunakan sebagai bagian MFA.
   - Pengecekan daftar password umum/expected/compromised (blocklist).
   - Rate limiting & proteksi brute-force login.
4. **Disaster Recovery & Contingency Planning**: **NIST SP 800-34 Rev.1**:
   - Business Impact Analysis (BIA), recovery strategy (RPO < 1 jam, RTO < 30 menit), contingency plan, testing/exercises (restore drill terbukti), dan maintenance.
5. **Software Supply Chain Security**: **SLSA v1.2** (Approved):
   - Pemisahan Build Track (L1-L3) dan Source Track (L1-L4).

---

## 2. Bobot & Formula Production Readiness Score (0–10)
Skor akhir merupakan satu-satunya nilai acuan "Score Kesiapan Produksi Aplikasi".

| No | Area Audit | Bobot | Fokus Pemeriksaan Sistem Traceability SJA |
|---|---|:---:|---|
| 1 | **Authentication & Session Security** | 15% | Bcrypt hash, NIST 800-63B-4 (>=15 char single-factor, blocklist), login rate limit, brute-force protection, token verification, session lifecycle. |
| 2 | **Authorization, RBAC & Data Access** | 12% | Fail-closed RBAC (`admin`, `produksi`, `qc`, `viewer`), route protection, isolasi data antar role, pencegahan IDOR/BOLA pada endpoint import/sync. |
| 3 | **Validation, API & File Security** | 8% | Zod schema validation boundaries, whitelist table (`ALLOWED_TABLES`), upload size limit, sanitasi file name, isolasi parsing buffer memory. |
| 4 | **Secrets, Config, Network & Runtime** | 10% | Tidak ada hardcoded secret di git, JWT secret validation, CSP & HSTS security headers, CORS sanitization, error leak masking. |
| 5 | **Database, Migration & Data Integrity** | 10% | Pool connection reliability, schema consistency, ACID batch transaction di Excel/Google Sheet sync, deduplikasi, smart UPSERT, foreign integrity. |
| 6 | **Automated Testing & CI Quality Gates** | 12% | Unit & integration tests, modularity enforcement (<200 baris/file), CI pipeline blocking checks, negative test cases. |
| 7 | **Release, Deployment & Rollback** | 10% | Release scripts (`start_server.bat`, `stop_server.bat`), deterministic runtime, skrip backup sebelum deploy, health check probe. |
| 8 | **Backup, Restore, DR & Observability** | 10% | NIST SP 800-34: Skrip backup otomatis, SHA-256 hash integrity, **actual restore drill verification**, logging operasional sistem. |
| 9 | **Vulnerability & Software Supply Chain** | 8% | Dependency scanning (`npm audit`), CVE exception policy dengan justifikasi teknis, pinning versions, SLSA Build & Source provenance tracking. |
| 10 | **Audit Trail, Documentation & Governance** | 5% | Tabel `audit_logs` mencatat siapa mengubah apa (before/after value), timestamp, IP, reason, DR plan docs, arsitektur traceability. |
| **TOTAL** | | **100%** | **Production Score = Σ (Nilai Kategori × Bobot)** |

---

## 3. Skala Interpretasi Level
- **0.0 – 3.9**: Level 1–3 (Prototype / Unsafe)
- **4.0 – 4.9**: Level 4 (Development)
- **5.0 – 5.9**: Level 5 (Functional)
- **6.0 – 6.9**: Level 6 (Basic Production Foundation)
- **7.0 – 7.9**: Level 7 (Production Capable)
- **8.0 – 8.4**: Level 8 (Near Production Ready)
- **8.5 – 8.9**: Level 8.5+ (Advanced Production Ready)
- **9.0 – 9.2**: Level 9 (Production Ready)
- **9.3 – 9.5**: Level 9.3+ (Strong Production Ready)
- **9.6 – 9.8**: Level 9.6+ (Enterprise-grade Maturity)
- **9.9 – 10.0**: Level 10 (Exceptional / Highly Mature)

---

## 4. Safety Gates (Aturan yang Mengalahkan Skor)
Skor tinggi (misal 9.4) **TIDAK DAPAT** meloloskan aplikasi menjadi **GO** jika salah satu Safety Gate berikut terpicu:
- 🔴 Exploitable Critical vulnerability
- 🔴 Authentication bypass
- 🔴 Authorization bypass terhadap data/transaksi
- 🔴 Remote code execution
- 🔴 SQL injection exploitable
- 🔴 Production secrets exposed
- 🔴 Data corruption / loss defect
- 🔴 Migration dapat merusak production data
- 🔴 Backup tidak bisa direstore (restore test drill gagal)
- 🔴 CI blocking checks gagal
- 🟠 Rollback release kritikal tidak terdokumentasi/dapat dilakukan (Conditional GO)
- 🟠 HIGH/CRITICAL CVE di-ignore tanpa valid justification (Conditional GO)

**Dua Output Wajib Setiap Audit**:
1. **Production Score**: `X.XX / 10.0`
2. **Release Decision**: `GO` / `CONDITIONAL GO` / `NO-GO`

---

## 5. Klasifikasi Evidence
- **VERIFIED**: Bukti ditemukan langsung di source code, config, unit test, workflow log, atau bukti eksekusi nyata.
- **PARTIAL**: Kontrol ada, namun bukti eksekusinya belum lengkap.
- **DECLARED**: Hanya tertulis dalam dokumentasi atau policy tanpa implementasi aktif.
- **NOT VERIFIED**: Tidak ditemukan bukti.
- **FAIL**: Terbukti tidak memenuhi requirement atau gagal saat diuji.

---

## 6. Aturan Delta Audit & Baseline
- Setiap audit setelah baseline wajib menyajikan:
  `Previous Score → Current Score → Delta → Penyebab Rinci`.
- Tidak boleh me-reset skor dari nol tanpa alasan arsitektural mayor.
- Urutan Delta: `Last Audited SHA → New SHA → Changed Files → Regression Check → Affected Controls → Critical Gates → New Score`.
