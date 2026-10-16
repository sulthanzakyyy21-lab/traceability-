CREATE DATABASE IF NOT EXISTS db_traceability_sja
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_traceability_sja;

-- =========================================================================
-- 1. TABEL DRYER TOWER 1 (Persis 38 Kolom dari file: dryer tower 1.xlsx)
-- Sheet: 'Checklist Scada Dryer - T1'
-- =========================================================================
CREATE TABLE `dryer_tower_1` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `Stamp` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Waktu` VARCHAR(100),
    `Nama` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Final Tank` VARCHAR(50),
    `Level Final Tank` VARCHAR(50),
    `Temperatur Final Tank (level < 20% FT temperatur tdk valid)` VARCHAR(50),
    `TS Final Tank` VARCHAR(50),
    `Level Feed System Tank (H1B1K01)` VARCHAR(50),
    `Feed Pressure (H1B1K03)` VARCHAR(50),
    `Speed Feed Pump (H1B1K03)` VARCHAR(50),
    `Nozzle Pressure - PV (H1B1K60)` VARCHAR(50),
    `Speed HPP - CV (H1B1K60)` VARCHAR(50),
    `Feed Extract Mass Flow (H1B1P20)` VARCHAR(50),
    `Factor Gas` VARCHAR(50),
    `Adjustable Valve CO2 (H1B1Q31)` VARCHAR(50),
    `Flow Meter CO2 (H1B1K30)` VARCHAR(50),
    `Temp Feed Inlet (H1B1K50)` VARCHAR(50),
    `Pressure Supply Steam Main Air (H1P1P21)` VARCHAR(50),
    `Temp Main Air (H1E1K01)` VARCHAR(50),
    `Flow Main Air (H1E1K08)$` VARCHAR(50),
    `Temp SFB Inlet (H1E1K06)` VARCHAR(50),
    `Flow SFB Inlet (H1E1K05)` VARCHAR(50),
    `Temp VF1 inlet (H1G1K02)` VARCHAR(50),
    `Flow VF1 Inlet (H1G1K01)` VARCHAR(50),
    `Flow VF2 Inlet (H1G1K04)` VARCHAR(50),
    `Temp VF2 Inlet (H1G1K03)` VARCHAR(50),
    `Temp VF (H1G1P07)` VARCHAR(50),
    `Δ Pressure Chamber : SFB (H1E1K04)` VARCHAR(50),
    `Temp SFB (H1E1P05)` VARCHAR(50),
    `(H1E1K03)` VARCHAR(50),
    `Temp Main Outlet (H1E1K02)` VARCHAR(50),
    `Pressure Bag Filter (H1F1P01)` VARCHAR(50),
    `Pressure Blower (H1H1P04)` VARCHAR(50),
    INDEX `idx_dt1_batch` (`Batch`),
    INDEX `idx_dt1_tanggal` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 2. TABEL DRYER TOWER 2 (Persis 44 Kolom dari file: dryer tower 2.xlsx)
-- Sheet: 'Checklist Scada Dryer - T2'
-- =========================================================================
CREATE TABLE `dryer_tower_2` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `Stamp:` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Waktu` VARCHAR(100),
    `Nama` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Final Tank (FTC0)` VARCHAR(50),
    `Level Final Tank (Ton)` VARCHAR(50),
    `Temperatur Final Tank (Level <20% FT temperatue tidak valid)` VARCHAR(50),
    `TS Final Tank` VARCHAR(50),
    `Level Feed System Tank (B1K01)(%)` VARCHAR(50),
    `Feed Pressure (B1K41)(bar)` VARCHAR(50),
    `Speed Feed Pump - CV (B1K41) (% )` VARCHAR(50),
    `Nozzle Pressure - PV (B1K60) (bar)` VARCHAR(50),
    `Speed HPP - CV (B1K60) (%)` VARCHAR(50),
    `Feed Extract Mass Flow (B1K02) (kg/h)` VARCHAR(50),
    `Factor Gas (gr/kg)` VARCHAR(50),
    `Flow Meter CO2 (B1K03)(g/h)` VARCHAR(50),
    `Temp Feed Inlet (B1K50) (°C)` VARCHAR(50),
    `Temp Fresh Air (P1P0)(°C)` VARCHAR(50),
    `Temp Main Air (E1K02)(°C)` VARCHAR(50),
    `Flow Main Air - PV (E1K01)(m3/h)` VARCHAR(50),
    `Speed Motor Main Air - CV (E1K01)(%)` VARCHAR(50),
    `Temp SFB Inlet (E1K06)(°C)` VARCHAR(50),
    `Flow SFB Inlet - PV (E1K05) (m3/h)` VARCHAR(50),
    `Speed Motor Supply SFB Inlet - CV (E1K05)(%)` VARCHAR(50),
    `Temp VF1 inlet (G1K02)( °C )` VARCHAR(50),
    `Flow VF1 Inlet (G1K01)(m3/h)` VARCHAR(50),
    `Temp VF2 Inlet (G1K04) ( °C )` VARCHAR(50),
    `Flow VF2 Inlet (G1K03)(m3/h)` VARCHAR(50),
    `Hydrolyse Pump Speed (E1G1G01)(%)` VARCHAR(50),
    `Temp VF (G1P07)( °C )` VARCHAR(50),
    `Δ Pressure Chamber : SFB (E1K07)(mbar)` VARCHAR(50),
    `Temp SFB Atas (H1E1P05)(°C)` VARCHAR(50),
    `Temp SFB Bawah (H1E1P06)(°C)` VARCHAR(50),
    `Δ Temp SFB (°C)` VARCHAR(50),
    `Pressure Chamber (E1K04)(mbar)` VARCHAR(50),
    `Temp Main Outlet (E1K03)(°C)` VARCHAR(50),
    `Pressure Bag Filter (F1P01)(mbar)` VARCHAR(50),
    `Flow Fine Powder Bag Filter (H1P03)(mbar)` VARCHAR(50),
    `Ampere moto blower H1G01 (A)` VARCHAR(50),
    `Keterangan` TEXT,
    INDEX `idx_dt2_batch` (`Batch`),
    INDEX `idx_dt2_tanggal` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 3. TABEL EXTRACTION TOWER 1 (Persis 23 Kolom dari file: tower 1.xlsx)
-- Sheet: 'Checklist Hasil Ekstraksi'
-- =========================================================================
CREATE TABLE `extraction_tower_1` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ID_No` VARCHAR(50),
    `Stamp` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Degassing` VARCHAR(50),
    `Perculator` VARCHAR(50),
    `Start Extraction` VARCHAR(100),
    `Batch of Extraction` VARCHAR(50),
    `Amount of Aroma Extract` VARCHAR(50),
    `TS Aroma Extract` VARCHAR(50),
    `Amount of Hydrolysis Extract` VARCHAR(50),
    `TS Hydrolysis Extract` VARCHAR(50),
    `Level Extract Tank` VARCHAR(50),
    `Grinding` VARCHAR(50),
    `Moist of R&G coffee` VARCHAR(50),
    `Destination Tank Post Extraction` VARCHAR(50),
    `TS Extract Tank` VARCHAR(50),
    `Nama Petugas` VARCHAR(100),
    `Stop Extraction` VARCHAR(100),
    `Keterangan` TEXT,
    INDEX `idx_ext1_batch` (`Batch`),
    INDEX `idx_ext1_tanggal` (`Tanggal`),
    INDEX `idx_ext1_degassing` (`Degassing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 4. TABEL EXTRACTION TOWER 2 (Persis 24 Kolom dari file: tower 2.xlsx)
-- Sheet: 'Checklist Hasil Ekstraksi'
-- =========================================================================
CREATE TABLE `extraction_tower_2` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ID_No` VARCHAR(50),
    `Stamp` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Degassing` VARCHAR(50),
    `Perculator` VARCHAR(50),
    `Start Extraction` VARCHAR(100),
    `Batch of Extraction` VARCHAR(50),
    `Amount of Aroma Extract` VARCHAR(50),
    `TS Aroma Extract` VARCHAR(50),
    `Amount of Hydrolysis Extract` VARCHAR(50),
    `TS Hydrolysis Extract` VARCHAR(50),
    `Level` VARCHAR(50),
    `Grinding` VARCHAR(50),
    `Moist of R&G coffee` VARCHAR(50),
    `Destination Tank Post Extraction` VARCHAR(50),
    `TS Extract Tank` VARCHAR(50),
    `Nama Petugas` VARCHAR(100),
    `Stop Extraction` VARCHAR(100),
    `Nomor Batch` VARCHAR(50),
    `Keterangan` TEXT,
    INDEX `idx_ext2_batch` (`Batch`),
    INDEX `idx_ext2_tanggal` (`Tanggal`),
    INDEX `idx_ext2_degassing` (`Degassing`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 5. TABEL EVAPORATION TOWER 1 (Persis 20 Kolom dari: data evaporation tower 1.xlsx)
-- Sheet: 'Checklist Hasil Evaporasi'
-- =========================================================================
CREATE TABLE `evaporation_tower_1` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `stamp` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Separated Tank` VARCHAR(50),
    `Level Separated Tank` VARCHAR(50),
    `TS Separated Tank` VARCHAR(50),
    `Nilai Sedimen Separated Tank` VARCHAR(50),
    `Start Tank` VARCHAR(100),
    `Finish Tank` VARCHAR(100),
    `Destination Final Tank` VARCHAR(50),
    `Level Final Tank` VARCHAR(50),
    `Pure Aroma` VARCHAR(50),
    `TS Final Tank` VARCHAR(50),
    `Temp. Output Evap (di Final Tank)` VARCHAR(50),
    `Nama Petugas` VARCHAR(100),
    `Keterangan` TEXT,
    `Column 1` VARCHAR(100),
    INDEX `idx_evap1_batch` (`Batch`),
    INDEX `idx_evap1_tanggal` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 6. TABEL EVAPORATION TOWER 2 (Persis 19 Kolom dari: data evaporation tower 2.xlsx)
-- Sheet: 'Checklist Hasil Evaporasi'
-- =========================================================================
CREATE TABLE `evaporation_tower_2` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `Stamp:+1` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode` VARCHAR(50),
    `Separated Tank` VARCHAR(50),
    `Level Separated Tank` VARCHAR(50),
    `TS Separated Tank` VARCHAR(50),
    `Nilai Sedimen Separated Tank` VARCHAR(50),
    `Start Tank` VARCHAR(100),
    `Finish Tank` VARCHAR(100),
    `Destination Final Tank` VARCHAR(50),
    `Level Final Tank` VARCHAR(50),
    `Pure Aroma` VARCHAR(50),
    `TS Final Tank` VARCHAR(50),
    `Temp, Output Evap (di Final Tank)` VARCHAR(50),
    `Nama Petugas` VARCHAR(100),
    `Ketereangan` TEXT,
    INDEX `idx_evap2_batch` (`Batch`),
    INDEX `idx_evap2_tanggal` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================================
-- 7. TABEL ROASTING PROBAT (Persis 31 Kolom dari: roasting probat (1).xlsx)
-- Sheet: 'Checklist Hasil Produksi Roasti'
-- =========================================================================
CREATE TABLE `roasting_probat` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `Stamp` VARCHAR(100),
    `Tanggal` VARCHAR(100),
    `Shift` VARCHAR(50),
    `Team` VARCHAR(50),
    `Batch` VARCHAR(50),
    `Mode Goreng` VARCHAR(50),
    `Silo Degassing` VARCHAR(50),
    `Start` VARCHAR(100),
    `Roasting Time (second)` VARCHAR(50),
    `Temperatur End Roast` VARCHAR(50),
    `Volume air` VARCHAR(50),
    `Warna` VARCHAR(50),
    `Foreign Matter` VARCHAR(50),
    `Bau` VARCHAR(50),
    `waktu transfer mentah` VARCHAR(100),
    `SiloCell 1` VARCHAR(50),
    `SiloCell 2` VARCHAR(50),
    `SiloCell 3` VARCHAR(50),
    `SiloCell 4` VARCHAR(50),
    `SiloCell 5` VARCHAR(50),
    `SiloCell 6` VARCHAR(50),
    `SiloCell 7` VARCHAR(50),
    `SiloCell 8` VARCHAR(50),
    `Jenis Kopi Mentah` VARCHAR(50),
    `waktu transfer matang` VARCHAR(100),
    `berat kopi matang` VARCHAR(50),
    `Waste Batu Destoner` VARCHAR(50),
    `Waste cyclone destoner` VARCHAR(50),
    `Susut Goreng` VARCHAR(50),
    `Keterangan` TEXT,
    `Nama Petugas` VARCHAR(100),
    INDEX `idx_roast_silo` (`Silo Degassing`),
    INDEX `idx_roast_tanggal` (`Tanggal`),
    INDEX `idx_roast_mode` (`Mode Goreng`)
) ENGINE=InnoDB DEFAULT CHARSET=UTF8MB4;
