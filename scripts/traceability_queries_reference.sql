-- ==============================================================================
-- PT. SANTOS JAYA ABADI - TRACEABILITY SYSTEM
-- DATABASE: db_traceability_sja
-- MASTER QUERIES REFERENCE: FLOWCHART ENGINE & ERD TOPOLOGY
-- Standard: SJA-PRAS v1.0 / Single Source of Truth
-- ==============================================================================

USE `db_traceability_sja`;

-- ==============================================================================
-- BAGIAN 1: QUERY UNTUK FLOWCHART TRACEABILITY ENGINE (BACKWARD & FORWARD)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1.0. MASTER ALL-IN-ONE QUERY (SELURUH FLOWCHART JADI SATU QUERY TUNGGAL)
-- Menggabungkan: Packing -> Dryer -> Evaporasi -> Ekstraksi -> Roasting (UPBM) -> QC -> PA
-- Ubah nilai @batch_input dan @tahun_input sesuai kebutuhan pencarian.
-- ------------------------------------------------------------------------------
SET @batch_input := 444;
SET @tahun_input := 2026;

WITH 
pack_summary AS (
    SELECT 
        batch,
        tanggal,
        MIN(waktu) AS waktu_mulai,
        MAX(waktu) AS waktu_selesai,
        GROUP_CONCAT(DISTINCT shift ORDER BY shift SEPARATOR ', ') AS shifts,
        GROUP_CONCAT(DISTINCT team ORDER BY team SEPARATOR ', ') AS teams,
        GROUP_CONCAT(DISTINCT nama ORDER BY nama SEPARATOR ', ') AS operators,
        GROUP_CONCAT(DISTINCT pin ORDER BY pin SEPARATOR ', ') AS pins,
        MAX(nama_produk) AS nama_produk,
        SUM(COALESCE(ok_box, 0)) AS total_ok_box,
        SUM(COALESCE(hold_box, 0)) AS total_hold_box,
        SUM(COALESCE(bo_box, 0)) AS total_bo_box,
        SUM(COALESCE(bo_kg, 0)) AS total_bo_kg,
        SUM(COALESCE(waste_dust_collector_kg, 0) + COALESCE(waste_metal_separator_kg, 0) + COALESCE(waste_sapuan_kg, 0)) AS total_waste_kg,
        ROUND(AVG(NULLIF(temp_ruang_packing, 0)), 1) AS avg_temp_packing,
        ROUND(AVG(NULLIF(rh_ruang_packing, 0)), 0) AS avg_rh_packing
    FROM `packing_tower_1`
    WHERE batch = @batch_input AND YEAR(tanggal) = @tahun_input
    GROUP BY batch, tanggal
    LIMIT 1
),
dryer_summary AS (
    SELECT 
        CAST(d.Batch AS UNSIGNED) AS batch,
        d.Tanggal,
        GROUP_CONCAT(DISTINCT d.`Final Tank` SEPARATOR ', ') AS final_tanks,
        ROUND(AVG(CAST(NULLIF(d.`TS Final Tank`, '') AS DECIMAL(5,2))), 2) AS avg_ts_dryer,
        ROUND(AVG(CAST(NULLIF(d.`Feed Pressure (H1B1K03)`, '') AS DECIMAL(5,2))), 2) AS avg_feed_pressure,
        ROUND(AVG(CAST(NULLIF(d.`Temp Main Air (H1E1K01)`, '') AS DECIMAL(5,2))), 1) AS avg_temp_main_air,
        GROUP_CONCAT(DISTINCT d.Nama SEPARATOR ', ') AS operators_dryer
    FROM `dryer_tower_1` d
    WHERE (TRIM(d.Batch) IN (CAST(@batch_input AS CHAR), CONCAT(@batch_input, '.0')) OR TRIM(d.Batch) LIKE CONCAT(@batch_input, '-%'))
      AND YEAR(d.Tanggal) = @tahun_input
    GROUP BY CAST(d.Batch AS UNSIGNED), d.Tanggal
    LIMIT 1
),
evap_summary AS (
    SELECT 
        CAST(ev.Batch AS UNSIGNED) AS batch,
        ev.Tanggal,
        GROUP_CONCAT(DISTINCT ev.`Separated Tank` SEPARATOR ', ') AS separated_tanks,
        ROUND(AVG(CAST(NULLIF(ev.`TS Separated Tank`, '') AS DECIMAL(5,2))), 2) AS avg_ts_separated,
        ROUND(AVG(CAST(NULLIF(ev.`TS Final Tank`, '') AS DECIMAL(5,2))), 2) AS avg_ts_final,
        GROUP_CONCAT(DISTINCT ev.`Destination Final Tank` SEPARATOR ', ') AS dest_final_tanks
    FROM `evaporation_tower_1` ev
    WHERE (TRIM(ev.Batch) IN (CAST(@batch_input AS CHAR), CONCAT(@batch_input, '.0')) OR TRIM(ev.Batch) LIKE CONCAT(@batch_input, '-%'))
      AND YEAR(ev.Tanggal) = @tahun_input
    GROUP BY CAST(ev.Batch AS UNSIGNED), ev.Tanggal
    LIMIT 1
),
extract_summary AS (
    SELECT 
        CAST(ex.Batch AS UNSIGNED) AS batch,
        ex.Tanggal,
        MIN(ex.`Start Extraction`) AS start_extraction,
        MAX(ex.`Stop Extraction`) AS stop_extraction,
        CAST(ex.Degassing AS UNSIGNED) AS silo_degassing,
        COUNT(DISTINCT ex.Perculator) AS jumlah_percolator
    FROM `extraction_tower_1` ex
    WHERE (TRIM(ex.Batch) IN (CAST(@batch_input AS CHAR), CONCAT(@batch_input, '.0')) OR TRIM(ex.Batch) LIKE CONCAT(@batch_input, '-%'))
      AND YEAR(ex.Tanggal) = @tahun_input
    GROUP BY CAST(ex.Batch AS UNSIGNED), ex.Tanggal, CAST(ex.Degassing AS UNSIGNED)
    LIMIT 1
),
roast_summary AS (
    SELECT 
        CAST(r.`Silo Degassing` AS UNSIGNED) AS silo_degassing,
        GROUP_CONCAT(DISTINCT r.Batch SEPARATOR ', ') AS batches_roasting,
        GROUP_CONCAT(DISTINCT r.`Jenis Kopi Mentah` SEPARATOR ', ') AS jenis_kopi_mentah,
        SUM(COALESCE(CAST(NULLIF(REPLACE(r.`berat kopi matang`, ',', '.'), '') AS DECIMAL(10,2)), 0)) AS total_berat_matang,
        ROUND(AVG(CAST(NULLIF(REPLACE(r.`Susut Goreng`, ',', '.'), '') AS DECIMAL(6,3))), 2) AS avg_susut_goreng
    FROM `roasting_probat` r
    WHERE CAST(r.`Silo Degassing` AS UNSIGNED) IN (SELECT silo_degassing FROM extract_summary)
    GROUP BY CAST(r.`Silo Degassing` AS UNSIGNED)
    LIMIT 1
),
qc_summary AS (
    SELECT 
        qc.Batch,
        ROUND(AVG(CAST(NULLIF(REPLACE(qc.`Kadar Air (%)`, ',', '.'), '') AS DECIMAL(5,2))), 2) AS avg_kadar_air,
        ROUND(AVG(CAST(NULLIF(REPLACE(qc.`Density (g/L)`, ',', '.'), '') AS DECIMAL(6,2))), 2) AS avg_density,
        ROUND(AVG(CAST(NULLIF(REPLACE(qc.`Solubility (s)`, ',', '.'), '') AS DECIMAL(5,2))), 1) AS avg_kelarutan_sec,
        GROUP_CONCAT(DISTINCT qc.Status SEPARATOR ', ') AS status_qc
    FROM `qc_dryer_t1` qc
    WHERE (qc.Batch IN (CAST(@batch_input AS CHAR), CONCAT('A', @batch_input, '/26'), CONCAT('A', @batch_input)) OR qc.Batch LIKE CONCAT('%', @batch_input, '%'))
    GROUP BY qc.Batch
    LIMIT 1
),
pa_fwt_summary AS (
    SELECT 
        pH AS fwt_ph,
        TDS AS fwt_tds,
        Kekeruhan AS fwt_kekeruhan
    FROM `pa_fwt_t1`
    ORDER BY id DESC
    LIMIT 1
),
pa_cip_summary AS (
    SELECT 
        Peralatan AS latest_cip_equipment,
        `pH Lab` AS latest_cip_ph,
        Conductivity AS latest_cip_conductivity,
        Swab AS latest_cip_swab
    FROM `pa_cip_t1`
    ORDER BY id DESC
    LIMIT 1
)
SELECT 
    -- 1. ECHELON PACKING (FINISHED GOODS)
    p.batch AS no_batch,
    p.tanggal AS tgl_packing,
    p.waktu_mulai AS waktu_mulai_packing,
    p.waktu_selesai AS waktu_selesai_packing,
    p.shifts AS shift_packing,
    p.nama_produk,
    p.pins AS pin_kemasan,
    p.total_ok_box,
    p.total_hold_box,
    p.total_bo_box,
    p.total_waste_kg,
    p.avg_temp_packing,
    p.avg_rh_packing,
    
    -- 2. ECHELON SPRAY DRYER (POWDER)
    d.final_tanks AS dryer_final_tank,
    d.avg_ts_dryer AS dryer_ts_persen,
    d.avg_feed_pressure AS dryer_feed_pressure_bar,
    d.avg_temp_main_air AS dryer_temp_main_air_c,
    d.operators_dryer,
    
    -- 3. ECHELON EVAPORASI (CONCENTRATE)
    ev.separated_tanks AS evap_separated_tank,
    ev.avg_ts_separated AS evap_ts_separated,
    ev.avg_ts_final AS evap_ts_final,
    ev.dest_final_tanks AS evap_dest_final_tank,
    
    -- 4. ECHELON EKSTRAKSI (LIQUID EXTRACT)
    ex.silo_degassing AS extract_silo_degassing,
    ex.jumlah_percolator AS extract_jumlah_percolator,
    ex.start_extraction,
    ex.stop_extraction,
    
    -- 5. ECHELON ROASTING & RAW BEANS (HULU UPBM)
    r.batches_roasting,
    r.jenis_kopi_mentah,
    r.total_berat_matang AS berat_kopi_matang_kg,
    r.avg_susut_goreng AS susut_goreng_roasting,
    
    -- 6. DOMAIN QUALITY CONTROL (QC LAB)
    qc.avg_kadar_air AS qc_kadar_air_pct,
    qc.avg_density AS qc_density_g_l,
    qc.avg_kelarutan_sec AS qc_kelarutan_sec,
    qc.status_qc,
    
    -- 7. DOMAIN PROCESS ASSURANCE (SANITASI & AIR)
    fwt.fwt_ph AS pa_air_ph,
    fwt.fwt_tds AS pa_air_tds,
    cip.latest_cip_equipment AS pa_cip_alat,
    cip.latest_cip_ph AS pa_cip_ph
FROM pack_summary p
LEFT JOIN dryer_summary d ON d.batch = p.batch
LEFT JOIN evap_summary ev ON ev.batch = p.batch
LEFT JOIN extract_summary ex ON ex.batch = p.batch
LEFT JOIN roast_summary r ON r.silo_degassing = ex.silo_degassing
LEFT JOIN qc_summary qc ON 1=1
LEFT JOIN pa_fwt_summary fwt ON 1=1
LEFT JOIN pa_cip_summary cip ON 1=1;

-- ------------------------------------------------------------------------------
-- 1.1. BACKWARD TRACE - TAHAP 1: QUERY PACKING TOWER (Berdasarkan Batch & Tahun)
-- Input: Batch = 370, Tahun = 2026, Tower = 1
-- ------------------------------------------------------------------------------
SELECT 
    id,
    stamp,
    tanggal,
    waktu,
    shift,
    team,
    nama AS operator_packing,
    batch,
    pin,
    nama_produk,
    ok_box,
    hold_box,
    bo_box,
    bo_kg,
    waste_dust_collector_kg,
    waste_metal_separator_kg,
    waste_sapuan_kg,
    waste_blocking_kg,
    temp_ruang_packing,
    rh_ruang_packing,
    temp_ruang_transit,
    rh_ruang_transit,
    kondisi_dehumidifier,
    keterangan
FROM `packing_tower_1`
WHERE batch = 370 
  AND (YEAR(tanggal) = 2026 OR YEAR(stamp) = 2026)
ORDER BY tanggal ASC, waktu ASC;

-- ------------------------------------------------------------------------------
-- 1.2. BACKWARD TRACE - TAHAP 2: QUERY SPRAY DRYER (Cocokkan Batch & Final Tank)
-- ------------------------------------------------------------------------------
SELECT 
    id,
    Stamp,
    Tanggal,
    Waktu,
    Nama AS operator_dryer,
    Shift,
    Team,
    Batch,
    Mode,
    `Final Tank` AS final_tank,
    `Level Final Tank` AS level_final_tank,
    `Temperatur Final Tank (level < 20% FT temperatur tdk valid)` AS temp_final_tank,
    `TS Final Tank` AS ts_final_tank,
    `Level Feed System Tank (H1B1K01)` AS level_feed_tank,
    `Feed Pressure (H1B1K03)` AS feed_pressure,
    `Speed Feed Pump (H1B1K03)` AS speed_feed_pump,
    `Nozzle Pressure - PV (H1B1K60)` AS nozzle_pressure,
    `Feed Extract Mass Flow (H1B1P20)` AS feed_mass_flow,
    `Temp Feed Inlet (H1B1K50)` AS temp_feed_inlet,
    `Temp Main Air (H1E1K01)` AS temp_main_air,
    `Temp SFB Inlet (H1E1K06)` AS temp_sfb_inlet
FROM `dryer_tower_1`
WHERE (TRIM(Batch) IN ('370', '370.0')
   OR TRIM(Batch) LIKE '370-%'
   OR TRIM(Batch) LIKE '370.%'
   OR TRIM(Batch) REGEXP '^370[A-Za-z]')
  AND (YEAR(Tanggal) = 2026 OR Tanggal LIKE '2026%' OR Tanggal LIKE '%/2026')
ORDER BY Tanggal ASC, Waktu ASC;

-- ------------------------------------------------------------------------------
-- 1.3. BACKWARD TRACE - TAHAP 3: QUERY EVAPORASI (Pemekatan Konsentrat & TS)
-- ------------------------------------------------------------------------------
SELECT 
    id,
    stamp,
    Tanggal,
    Shift,
    Team,
    Batch,
    Mode,
    `Separated Tank` AS separated_tank,
    `Level Separated Tank` AS level_separated_tank,
    `TS Separated Tank` AS ts_separated_tank,
    `Nilai Sedimen Separated Tank` AS sedimen_separated_tank,
    `Start Tank` AS start_tank,
    `Finish Tank` AS finish_tank,
    `Destination Final Tank` AS destination_final_tank,
    `Level Final Tank` AS level_final_tank,
    `Pure Aroma` AS pure_aroma,
    `TS Final Tank` AS ts_final_tank,
    `Temp. Output Evap (di Final Tank)` AS temp_output_evap,
    `Nama Petugas` AS operator_evaporasi
FROM `evaporation_tower_1`
WHERE (TRIM(Batch) IN ('370', '370.0')
   OR TRIM(Batch) LIKE '370-%'
   OR TRIM(Batch) LIKE '370.%'
   OR TRIM(Batch) REGEXP '^370[A-Za-z]')
  AND (YEAR(Tanggal) = 2026 OR Tanggal LIKE '2026%' OR Tanggal LIKE '%/2026')
ORDER BY Tanggal ASC, `Start Tank` ASC;

-- ------------------------------------------------------------------------------
-- 1.4. BACKWARD TRACE - TAHAP 4: QUERY EKSTRAKSI (Silo Degassing & Waktu Mulai)
-- ------------------------------------------------------------------------------
SELECT 
    id,
    Stamp,
    Tanggal,
    Shift,
    Team,
    Batch,
    Mode,
    Degassing AS silo_degassing,
    Perculator,
    `Start Extraction` AS start_extraction,
    `Stop Extraction` AS stop_extraction,
    `Batch of Extraction` AS batch_extraction,
    `Amount of Aroma Extract` AS amount_aroma,
    `TS Aroma Extract` AS ts_aroma,
    `Amount of Hydrolysis Extract` AS amount_hydrolysis,
    `TS Hydrolysis Extract` AS ts_hydrolysis,
    `Level Extract Tank` AS level_extract_tank,
    Grinding,
    `Moist of R&G coffee` AS moist_rg_coffee,
    `Destination Tank Post Extraction` AS dest_tank_post_extraction,
    `TS Extract Tank` AS ts_extract_tank,
    `Nama Petugas` AS operator_ekstraksi
FROM `extraction_tower_1`
WHERE (TRIM(Batch) IN ('370', '370.0')
   OR TRIM(Batch) LIKE '370-%'
   OR TRIM(Batch) LIKE '370.%'
   OR TRIM(Batch) REGEXP '^370[A-Za-z]')
  AND (YEAR(Tanggal) = 2026 OR Tanggal LIKE '2026%' OR Tanggal LIKE '%/2026')
ORDER BY Tanggal ASC, `Start Extraction` ASC;

-- ------------------------------------------------------------------------------
-- 1.5. BACKWARD TRACE - TAHAP 5: QUERY ROASTING & UPBM (Window 48 Jam Sebelum Ekstraksi)
-- Parameter: Silo Degassing = 5, Waktu Ekstraksi = '2026-10-13 08:30:00'
-- ------------------------------------------------------------------------------
SELECT 
    id,
    Stamp,
    Tanggal,
    Shift,
    Team,
    Batch,
    `Mode Goreng` AS mode_goreng,
    `Silo Degassing` AS silo_degassing,
    Start AS start_roast,
    `Roasting Time (second)` AS roast_time_sec,
    `Temperatur End Roast` AS temp_end_roast,
    `Volume air` AS volume_air_quench,
    Warna,
    Bau,
    `Foreign Matter` AS foreign_matter,
    `waktu transfer mentah` AS transfer_mentah,
    `SiloCell 1`, `SiloCell 2`, `SiloCell 3`, `SiloCell 4`,
    `SiloCell 5`, `SiloCell 6`, `SiloCell 7`, `SiloCell 8`,
    `Jenis Kopi Mentah` AS jenis_kopi_mentah,
    `waktu transfer matang` AS transfer_matang,
    `berat kopi matang`,
    `Waste Batu Destoner`,
    `Waste cyclone destoner`,
    `Susut Goreng` AS susut_goreng_pct,
    `Nama Petugas` AS operator_roasting
FROM `roasting_probat`
WHERE CAST(`Silo Degassing` AS UNSIGNED) = 5
  AND Stamp >= DATE_SUB('2026-10-13 08:30:00', INTERVAL 48 HOUR)
  AND Stamp <= '2026-10-13 08:30:00'
ORDER BY Stamp ASC;

-- ------------------------------------------------------------------------------
-- 1.6. BACKWARD TRACE - TAHAP 6: QUERY DOMAIN QUALITY CONTROL (QC)
-- Contoh pengujian Spray Dryer & Uji Sensori Cup Test untuk Batch 370
-- ------------------------------------------------------------------------------
SELECT 
    id,
    Tanggal,
    Jam,
    Batch,
    Produk,
    `Nomor Box` AS nomor_box,
    `Kadar Air (%)` AS kadar_air_pct,
    `Density (g/L)` AS density_g_l,
    `Brix (°brix)` AS brix,
    pH,
    `Solubility (s)` AS kelarutan_detik,
    `Cup Test Wangi`,
    `Cup Test Pahit`,
    `Cup Test Asam`,
    `Cup Test Body`,
    `Cup Test Sepet`,
    Status AS status_release,
    TTD AS ttd_analis
FROM `qc_dryer_t1`
WHERE `Batch` IN ('370', 'A370/26', 'A370', '0370')
ORDER BY id ASC;

-- ------------------------------------------------------------------------------
-- 1.7. BACKWARD TRACE - TAHAP 7: QUERY DOMAIN PROCESS ASSURANCE (PA)
-- Validasi Sanitasi Sirkuit CIP & Baku Mutu Air FWT sebelum/saat Batch Berjalan
-- ------------------------------------------------------------------------------
-- Verifikasi CIP Sirkuit Ekstraktor & Dryer
SELECT 
    id,
    `Tanggal & Waktu` AS tanggal_waktu,
    Peralatan,
    `pH Lab` AS ph_lab,
    Conductivity,
    Swab,
    `Start Final Rinse RO` AS start_rinse,
    `Finish Final Rinse RO` AS finish_rinse,
    Keterangan
FROM `pa_cip_t1`
WHERE `Tanggal & Waktu` <= '2026-10-13 23:59:59'
  AND (Peralatan LIKE '%ekstrak%' OR Peralatan LIKE '%dryer%' OR Peralatan LIKE '%final tank%')
ORDER BY id DESC
LIMIT 10;

-- Verifikasi Baku Mutu Air Proses FWT
SELECT 
    id,
    `Tanggal & Waktu` AS tanggal_waktu,
    pH,
    TDS,
    Kekeruhan,
    `Kesadahan*` AS kesadahan,
    `Sisa Khlor` AS sisa_khlor,
    `E. Coli` AS e_coli,
    `Total Coliform` AS total_coliform
FROM `pa_fwt_t1`
WHERE `Tanggal & Waktu` <= '2026-10-13 23:59:59'
ORDER BY id DESC
LIMIT 5;

-- ------------------------------------------------------------------------------
-- 1.8. FORWARD CONTAINMENT TRACE: DARI LOT BIJI ROASTING KE KARTON PACKING
-- Scenario: Batch Roasting #105 di Silo 5 terindikasi anomali, cari nomor karton boxnya
-- ------------------------------------------------------------------------------
SELECT 
    r.Batch AS batch_roasting,
    r.`Silo Degassing` AS silo_degassing,
    e.Batch AS batch_ekstraksi,
    e.Tanggal AS tgl_ekstraksi,
    d.Batch AS batch_dryer,
    d.`Final Tank` AS final_tank_dryer,
    p.batch AS batch_packing,
    p.pin AS pin_packing,
    p.nama_produk,
    p.ok_box,
    p.hold_box,
    p.tanggal AS tgl_packing,
    p.shift,
    p.team
FROM `roasting_probat` r
JOIN `extraction_tower_1` e 
    ON CAST(e.Degassing AS UNSIGNED) = CAST(r.`Silo Degassing` AS UNSIGNED)
    AND e.Stamp >= r.Stamp 
    AND e.Stamp <= DATE_ADD(r.Stamp, INTERVAL 48 HOUR)
JOIN `dryer_tower_1` d 
    ON d.Batch = e.Batch
JOIN `packing_tower_1` p 
    ON p.batch = CAST(d.Batch AS UNSIGNED)
WHERE r.Batch = 105
ORDER BY p.tanggal DESC, p.waktu DESC;


-- ==============================================================================
-- BAGIAN 2: QUERY UNTUK ERD (SCHEMA, RELASI, AUDIT & MASTER UNIFIED JOIN)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 2.1. MASTER UNIFIED JOIN VIEW: MENAMPILKAN SELURUH TAHAPAN PRODUKSI 1 QUERY
-- Menyatukan Roasting -> Ekstraksi -> Evaporasi -> Spray Dryer -> Packing
-- ------------------------------------------------------------------------------
SELECT 
    p.batch AS batch_kemasan,
    p.pin AS pin_kemasan,
    p.nama_produk,
    p.tanggal AS tgl_packing,
    p.ok_box AS output_box,
    p.bo_box AS reject_box,
    d.Batch AS batch_dryer,
    d.`Final Tank` AS final_tank_dryer,
    d.`TS Final Tank` AS ts_dryer,
    ev.`Separated Tank` AS separated_tank_evap,
    ev.`TS Final Tank` AS ts_evap,
    ex.Degassing AS silo_ekstraksi,
    ex.`Start Extraction` AS waktu_mulai_ekstrak,
    r.Batch AS batch_roasting,
    r.`Jenis Kopi Mentah` AS raw_beans_type,
    r.`Susut Goreng` AS susut_roasting_pct
FROM `packing_tower_1` p
LEFT JOIN `dryer_tower_1` d 
    ON CAST(d.Batch AS UNSIGNED) = p.batch 
    AND YEAR(d.Tanggal) = YEAR(p.tanggal)
LEFT JOIN `evaporation_tower_1` ev 
    ON CAST(ev.Batch AS UNSIGNED) = p.batch 
    AND YEAR(ev.Tanggal) = YEAR(p.tanggal)
LEFT JOIN `extraction_tower_1` ex 
    ON CAST(ex.Batch AS UNSIGNED) = p.batch 
    AND YEAR(ex.Tanggal) = YEAR(p.tanggal)
LEFT JOIN `roasting_probat` r 
    ON CAST(r.`Silo Degassing` AS UNSIGNED) = CAST(ex.Degassing AS UNSIGNED)
    AND r.Stamp <= ex.Stamp 
    AND r.Stamp >= DATE_SUB(ex.Stamp, INTERVAL 48 HOUR)
WHERE p.batch = 370 AND YEAR(p.tanggal) = 2026
LIMIT 10;

-- ------------------------------------------------------------------------------
-- 2.2. QUERY AUDIT TRAIL LOGGING (Non-Repudiation Security ISO 27001)
-- ------------------------------------------------------------------------------
SELECT 
    a.id,
    a.created_at AS waktu_transaksi,
    u.username,
    u.role,
    u.nama_lengkap,
    a.action,
    a.table_name,
    a.record_id,
    a.before_value,
    a.after_value,
    a.ip_address
FROM `audit_logs` a
LEFT JOIN `users` u ON a.user_id = u.id
ORDER BY a.id DESC
LIMIT 20;

-- ------------------------------------------------------------------------------
-- 2.3. QUERY INSPEKSI SKEMA & JUMLAH DATA PER TABEL ERD (41+ TABEL)
-- ------------------------------------------------------------------------------
SELECT 
    TABLE_NAME, 
    TABLE_ROWS, 
    DATA_LENGTH / 1024 / 1024 AS data_mb,
    UPDATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'db_traceability_sja'
  AND (TABLE_NAME LIKE 'packing_%' 
    OR TABLE_NAME LIKE 'dryer_%' 
    OR TABLE_NAME LIKE 'evaporation_%' 
    OR TABLE_NAME LIKE 'extraction_%' 
    OR TABLE_NAME LIKE 'roasting_%' 
    OR TABLE_NAME LIKE 'qc_%' 
    OR TABLE_NAME LIKE 'pa_%'
    OR TABLE_NAME IN ('users', 'audit_logs'))
ORDER BY TABLE_NAME ASC;

