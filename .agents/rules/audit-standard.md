# Standar Audit Kesiapan Produksi GMS (GMS-PRAS v1.0)
## Aturan Wajib Agen untuk Sistem Traceability PT. Santos Jaya Abadi

Setiap kali melakukan evaluasi, audit, pengujian, atau implementasi fitur pada proyek ini, seluruh Agen Antigravity (AG) WAJIB mengikuti aturan standar berikut:

### 1. Standar Acuan Formal
- **OWASP ASVS 5.0.0**: Benchmark keamanan web (L1 & L2).
- **NIST SP 800-218 SSDF v1.1 FINAL**: Baseline secure SDLC (v1.2 draft hanya sebagai forward-looking).
- **NIST SP 800-63B-4**: Password minimal 15 karakter untuk single-factor, pengecekan blocklist, rate limiting.
- **NIST SP 800-34 Rev.1**: BIA, RPO/RTO, strategi backup, dan bukti nyata pelaksanaan restore drill.
- **SLSA v1.2**: Evaluasi Build Track dan Source Track secara terpisah.

### 2. Rumus & Bobot Skor Produksi (0–10)
Production Readiness Score dihitung dari 10 kategori tetap:
1. Authentication & Session Security (15%)
2. Authorization, RBAC & Data Access (12%)
3. Validation, API & File Security (8%)
4. Secrets, Config, Network & Runtime Security (10%)
5. Database, Migration & Data Integrity (10%)
6. Automated Testing & CI Quality Gates (12%)
7. Release, Deployment & Rollback (10%)
8. Backup, Restore, DR & Observability (10%)
9. Vulnerability & Software Supply Chain (8%)
10. Audit Trail, Documentation & Governance (5%)

### 3. Safety Gate & Release Decision
- Skor tidak boleh menghasilkan status `GO` jika ada Safety Gate yang terpicu (Critical vuln, auth/authz bypass, SQLi, data loss, restore gagal, dsb.).
- Selalu laporkan: Skor (0–10) dan Release Decision (`GO` / `CONDITIONAL GO` / `NO-GO`).

### 4. Evidence & Delta Audit
- Gunakan klasifikasi bukti: `VERIFIED`, `PARTIAL`, `DECLARED`, `NOT VERIFIED`, `FAIL`.
- Terapkan Delta Audit: `Previous SHA → New SHA → Delta Breakdown`. Dilarang mereset skor dari nol tanpa alasan arsitektural mayor.
