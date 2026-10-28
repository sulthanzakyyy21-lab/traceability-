# Audit Trail & Data Governance Specification
## Sistem Traceability PT. Santos Jaya Abadi

### 1. Landasan Kepatuhan
Sesuai GMS-PRAS v1.0 Kategori 10 (Audit Trail, Documentation & Governance), seluruh aksi koreksi transaksi (*transaction correction*), perubahan baris (*UPSERT / update*), sinkronisasi, dan penghapusan data **TIDAK BOLEH** menghilangkan jejak historis tanpa jejak audit (*non-repudiation*).

### 2. Struktur Tabel `audit_logs`
Tabel `audit_logs` menyimpan jejak mutasi data secara mutlak (immutable):
- `id`: INT AUTO_INCREMENT PRIMARY KEY
- `user_id`: INT NULL (ID user pelaku mutasi, 0 jika sistem/auto-sync)
- `username`: VARCHAR(50) NOT NULL
- `role`: VARCHAR(30) NOT NULL
- `action`: ENUM('INSERT', 'UPDATE', 'DELETE', 'BULK_IMPORT', 'SYNC_GSHEET', 'CLEAR_DATA')
- `table_name`: VARCHAR(64) NOT NULL
- `record_id`: VARCHAR(64) NULL (Primary key / identifier baris target)
- `before_data`: JSON NULL (Kondisi data sebelum perubahan)
- `after_data`: JSON NULL (Kondisi data sesudah perubahan)
- `ip_address`: VARCHAR(45) NULL
- `reason`: VARCHAR(255) NULL (Alasan koreksi/perubahan data)
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### 3. Integritas Historis Koreksi
- Setiap kali admin atau operator melakukan perubahan data (misal koreksi batch, box, atau yield), data asli sebelum diubah disimpan dalam kolom `before_data`.
- Admin dilarang memiliki kemampuan menghapus atau mengedit baris dalam tabel `audit_logs`.
