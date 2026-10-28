# Strict Database Mandate - Anti-Halusinasi

1. **Database-Only Rule**:
   - Seluruh data yang disajikan di halaman traceability dan API WAJIB berasal dari kueri database MySQL `db_traceability_sja`.
   - Domain yang ada di DB:
     - **Produksi**: `packing_*`, `dryer_*`, `evaporation_*`, `extraction_*`, `roasting_*`, `mass_balance`
     - **QC**: `qc_*`
     - **PA**: `pa_*`
2. **Missing Data Policy**:
   - Jika suatu field, tabel, atau alur tidak ditemukan di database (nilai null, undefined, atau tabel belum ada), WAJIB bernilai:
     `"Data tidak ditemukan"`
3. **Zero Fallback from Files**:
   - Dilarang keras membaca file Excel audit lokal (`Traceability 13_10_2026 (1).xlsx` dll.) untuk dijadikan fallback data live.
