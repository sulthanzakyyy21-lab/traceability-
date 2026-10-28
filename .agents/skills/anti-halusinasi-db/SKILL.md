---
name: anti-halusinasi-db
description: Mandat mutlak pengambilan data traceability PT. Santos Jaya Abadi wajib dari Database MySQL (Produksi, QC, PA). Dilarang keras hardcode fallback dari file Excel. Jika data atau tabel tidak ada di database, wajib menampilkan tulisan 'Data tidak ditemukan'.
---

# Mandat Integritas Data & Anti-Halusinasi Database

## 1. Single Source of Truth: Database MySQL (`db_traceability_sja`)
Sistem Traceability PT. Santos Jaya Abadi HANYA memiliki 3 domain data dan PIC yang tercatat di database:
1. **Produksi**:
   - `packing_tower_1`, `packing_tower_2`
   - `dryer_tower_1`, `dryer_tower_2`
   - `evaporation_tower_1`, `evaporation_tower_2`
   - `extraction_tower_1`, `extraction_tower_2`
   - `roasting_probat`, `roasting_scolari_1`, `roasting_scolari_2`
   - Rekonsiliasi Neraca Massa (`mass_balance`) dihitung murni dari data roasting & packing.
2. **Quality Control (QC)**:
   - `qc_packing_*`, `qc_dryer_*`, `qc_evaporasi_*`, `qc_final_tank_*`
   - `qc_grinding_*`, `qc_aroma_*`, `qc_hydro_*`, `qc_mesh_*`
   - `qc_rework_*`
3. **Product Assurance (PA)**:
   - `pa_fwt_t1`, `pa_fwt_t2` (Water Process: Fisika Kimia & Mikrobiologi)
   - `pa_cip_t1`, `pa_cip_t2` (Sanitasi CIP Extraction, Evap, Final Tank, Dryer, Rework)
   - `pa_emp_t1`, `pa_emp_t2` (Environmental Swab)
   - `pa_abe_t1`, `pa_abe_t2` (Air Bacteria Exposed)

## 2. Domain & Alur Yang TIDAK ADA di Database
Database MySQL saat ini **TIDAK MEMILIKI TABEL** untuk:
- **Flow 1: DISTRIBUSI / FGW** (Gudang Jadi: Nomor Truk, No SJ, Tujuan, No Rak, No Pallet, PIC FGW)
- **Flow 3: REWORK Produksi** (Pengerjaan Ulang produksi tidak tercatat tabelnya di DB)
- **Flow 9: UPBM Inload** (Serah terima Silo Cell / BSTB belum memiliki tabel di DB)
- **Flow 11: INCOMING BAHAN / RMW** (Kedatangan armada truk kopi mentah & QC incoming biji kopi)
- **Flow 12: INCOMING BAHAN KEMAS** (Kedatangan Karton Box, Plastik PE & QC Kemasan)
- **Material Tambahan**: Gas CO2 Supplier (Dryer) dan Antifoam (Extraction) tidak ada tabelnya di DB.

## 3. Larangan Keras (Strict Prohibitions)
1. **Dilarang Keras Mocking / Hardcoding Fallback**:
   - Dilarang keras mengambil data dari file contoh Excel audit (seperti `Traceability 13_10_2026 (1).xlsx`) lalu menaruhnya sebagai string statis / fallback di kode frontend (`clusterTraceStore.js`, `index.html`) seolah-olah data live database.
2. **Dilarang Mengarang Nama PIC atau Parameter**:
   - Jika suatu PIC atau parameter tidak tercantum di baris database hasil kueri, dilarang menebak atau menaruh nama personil fiktif.

## 4. Standar Output Saat Data Tidak Ditemukan
1. **Wajib Tulisan 'Data tidak ditemukan'**:
   - Setiap kali data field, kolom, atau PIC tidak ditemukan di database (nilai `null`, `undefined`, baris kosong, atau tabel belum ada), sistem WAJIB menampilkan tulisan:
     `Data tidak ditemukan`
2. **Status Ketersediaan Alur (Flow Availability)**:
   - Jika suatu alur secara keseluruhan belum memiliki tabel di database (seperti Flow 1 Distribusi, Flow 11 Incoming Bahan, Flow 12 Incoming Kemas), flow tersebut ditandai dengan badge: `Data tidak ditemukan di database` dan `isAvailable: false`.
3. **Kejujuran Audit**:
   - Jika proses memang tidak terjadi pada batch yang diperiksa (misalnya tidak ada rework), statusnya adalah tidak ada data di database (`Data tidak ditemukan`).
