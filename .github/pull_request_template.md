## 📌 Ringkasan Perubahan (Pull Request Summary)
- **ID Tiket / Task**: `[Contoh: SJA-104 / Traceability Refactor]`
- **Tautan PRD / Tech Spec**: `[Tautan Dokumen Spesifikasi Teknis]`
- **Domain Terkait**: `[ ] Produksi | [ ] QC | [ ] PA (Product Assurance)`
- **Tipe Perubahan**: `[ ] Fix / Bug | [ ] Feat / Fitur Baru | [ ] Refactor / Modularitas | [ ] Security / Audit`

---

## 🛠️ Deskripsi Masalah & Solusi
### Masalah:
<!-- Jelaskan akar masalah (root cause) atau kebutuhan bisnis yang melandasi PR ini -->

### Solusi Teknis:
<!-- Jelaskan pendekatan arsitektur dan apa saja yang diubah -->

---

## 🛡️ Anti-AI Slop & Human Code Ownership Mandate
- [ ] **Human Code Understanding**: Seluruh kode dalam PR ini telah dibaca, dipahami, dan diverifikasi secara manual oleh pembuat PR baris demi baris (bukan blind-commit dari LLM/AI).
- [ ] **Single Source of Truth**: Data murni bersumber dari Database MySQL (`db_traceability_sja`). Tidak ada hardcode fallback dummy / Excel tiruan. Jika data nihil, sistem menampilkan `'Data tidak ditemukan'`.
- [ ] **Modularitas (<200 baris/file)**: Seluruh file baru atau yang di-refactor mematuhi batas arsitektur modular maksimal 200 baris/file (NIST SP 800-218 SSDF & SJA-PRAS).
- [ ] **Industrial Clean UI**: Antarmuka bersih, fungsional, kontras tinggi, bebas dari elemen visual dekoratif yang tidak perlu (*clean dashboard standard*).

---

## 🧪 Verifikasi & Pengujian (Quality Gate)
- [ ] **Automated Test Suite**: `npm test` lolos 100% (15/15 Test Cases SJA-PRAS hijau tanpa error).
- [ ] **Audit Engine**: `npm run audit` menghasilkan skor `>= 9.3/10` dengan status keputusan rilis **GO**.
- [ ] **Edge Cases & Error Handling**: Telah diuji skenario input kosong, parameter tidak valid, dan kondisi kegagalan koneksi.
- [ ] **Security Checks**: Bebas SQL Injection (menggunakan parameterized queries), validasi schema Zod aktif, dan proteksi role RBAC terpenuhi.

---

## 📋 Definition of Done (DoD) Checklist
- [ ] Kode bersih dari log debug console / komentar AI yang tidak relevan.
- [ ] Dokumentasi teknis atau migrasi skema diperbarui jika ada perubahan struktur tabel.
- [ ] Reviewer manusia minimal 1 orang telah memverifikasi logika perubahan sebelum merge.

