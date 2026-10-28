-- =========================================================================
-- TABEL PA (PRODUCT ASSURANCE) - PT SANTOS JAYA ABADI
-- Generated from Google Spreadsheet: 1C8dxDDxdR2RxId5FS0y5Fs1h4XxHFqCyF7g1Q_GFJ38
-- =========================================================================
USE `db_traceability_sja`;

DROP TABLE IF EXISTS `pa_fwt_t1`;
CREATE TABLE `pa_fwt_t1` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal & Waktu` VARCHAR(100),
  `pH` VARCHAR(100),
  `TDS` VARCHAR(100),
  `Kekeruhan` VARCHAR(100),
  `Kesadahan*` VARCHAR(100),
  `Sisa Khlor` VARCHAR(100),
  `Mangan` VARCHAR(100),
  `Besi` VARCHAR(100),
  `Warna` VARCHAR(100),
  `Aluminium` VARCHAR(100),
  `E. Coli` VARCHAR(100),
  `Total Coliform` VARCHAR(100),
  `Pseudomonas Aeruginosa*` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_fwt_t1_date` (`Tanggal & Waktu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_fwt_t2`;
CREATE TABLE `pa_fwt_t2` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal & Waktu` VARCHAR(100),
  `pH` VARCHAR(100),
  `TDS` VARCHAR(100),
  `Kekeruhan` VARCHAR(100),
  `Kesadahan*` VARCHAR(100),
  `Sisa Khlor` VARCHAR(100),
  `Mangan` VARCHAR(100),
  `Besi` VARCHAR(100),
  `Warna` VARCHAR(100),
  `Aluminium` VARCHAR(100),
  `E. Coli` VARCHAR(100),
  `Total Coliform` VARCHAR(100),
  `Pseudomonas Aeruginosa*` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_fwt_t2_date` (`Tanggal & Waktu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_cip_t1`;
CREATE TABLE `pa_cip_t1` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Stamp` VARCHAR(100),
  `Tanggal & Waktu` VARCHAR(100),
  `Waktu` VARCHAR(100),
  `Peralatan` VARCHAR(100),
  `pH Lab` VARCHAR(100),
  `Conductivity` VARCHAR(100),
  `Swab` VARCHAR(100),
  `pH in line` VARCHAR(100),
  `Start Final Rinse RO` VARCHAR(100),
  `Finish Final Rinse RO` VARCHAR(100),
  `Keterangan` TEXT,
  INDEX `idx_pa_cip_t1_date` (`Stamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_cip_t2`;
CREATE TABLE `pa_cip_t2` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Stamp` VARCHAR(100),
  `Tanggal` VARCHAR(100),
  `Waktu` VARCHAR(100),
  `Peralatan` VARCHAR(100),
  `pH Lab` VARCHAR(100),
  `Conductivity` VARCHAR(100),
  `Swab` VARCHAR(100),
  `pH in line` VARCHAR(100),
  `Start Final Rinse RO` VARCHAR(100),
  `Finish Final Rinse RO` VARCHAR(100),
  INDEX `idx_pa_cip_t2_date` (`Stamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_emp_t1`;
CREATE TABLE `pa_emp_t1` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal` VARCHAR(100),
  `Waktu Analisa` VARCHAR(100),
  `Titik Uji` VARCHAR(100),
  `Team` VARCHAR(100),
  `Area` VARCHAR(100),
  `Jenis Uji` VARCHAR(100),
  `Indikator E-coli (Negatif)` VARCHAR(100),
  `Indikator Coliform (<10)` VARCHAR(100),
  `Indikator Enterobacteriaceae (100)` VARCHAR(100),
  `Indikator TPC (<3000)` VARCHAR(100),
  `Spoilage Yeast & Mold (<100)` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_emp_t1_date` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_emp_t2`;
CREATE TABLE `pa_emp_t2` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal` VARCHAR(100),
  `Waktu Analisa` VARCHAR(100),
  `Titik Uji` VARCHAR(100),
  `Team` VARCHAR(100),
  `Area` VARCHAR(100),
  `Jenis Uji` VARCHAR(100),
  `Indikator E-coli (Negatif)` VARCHAR(100),
  `Indikator Coliform (<10)` VARCHAR(100),
  `Indikator Enterobacteriaceae (Negatif)` VARCHAR(100),
  `Indikator TPC (<3000)` VARCHAR(100),
  `Spoilage Yeast & Mold (<100)` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_emp_t2_date` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_abe_t1`;
CREATE TABLE `pa_abe_t1` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal` VARCHAR(100),
  `Waktu Analisa` VARCHAR(100),
  `Titik Uji` VARCHAR(100),
  `Team` VARCHAR(100),
  `Area` VARCHAR(100),
  `Jenis Uji` VARCHAR(100),
  `TPC` VARCHAR(100),
  `Yeast & Mold` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_abe_t1_date` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pa_abe_t2`;
CREATE TABLE `pa_abe_t2` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Tanggal` VARCHAR(100),
  `Waktu Analisa` VARCHAR(100),
  `Titik Uji` VARCHAR(100),
  `Team` VARCHAR(100),
  `Area` VARCHAR(100),
  `Jenis Uji` VARCHAR(100),
  `TPC` VARCHAR(100),
  `Yeast & Mold` VARCHAR(100),
  `Noted` TEXT,
  INDEX `idx_pa_abe_t2_date` (`Tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

