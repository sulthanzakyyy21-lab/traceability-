const pool = require('../../db');

async function migrateGbbTables() {
  const queryPenerimaan = `
    CREATE TABLE IF NOT EXISTS \`gbb_penerimaan\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`id_lot\` VARCHAR(100) UNIQUE,
      \`tanggal_masuk\` DATE NULL,
      \`gudang\` VARCHAR(50) NULL,
      \`id_lokasi\` VARCHAR(50) NULL,
      \`no_lot\` VARCHAR(100) NULL,
      \`jenis_kopi\` VARCHAR(50) NULL,
      \`kadar_air\` VARCHAR(50) NULL,
      \`no_pol\` VARCHAR(50) NULL,
      \`supplier\` VARCHAR(150) NULL,
      \`no_palet\` VARCHAR(50) NULL,
      \`karung_masuk\` INT NULL,
      \`berat_bruto\` DECIMAL(12,2) NULL,
      \`berat_netto\` DECIMAL(12,2) NULL,
      \`no_po\` VARCHAR(50) NULL,
      \`surat_jalan\` VARCHAR(100) NULL,
      \`status_mutu\` VARCHAR(50) NULL,
      \`tanggal_serah_terima\` VARCHAR(150) NULL,
      \`pic_rmw\` VARCHAR(100) DEFAULT 'Moch. Solichudin',
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX \`idx_gbb_jenis_tgl\` (\`jenis_kopi\`, \`tanggal_masuk\`),
      INDEX \`idx_gbb_surat_jalan\` (\`surat_jalan\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  const queryKeluar = `
    CREATE TABLE IF NOT EXISTS \`gbb_transaksi_keluar\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`id_keluar\` VARCHAR(100) UNIQUE,
      \`id_permintaan\` VARCHAR(100) NULL,
      \`tanggal_keluar\` DATE NULL,
      \`jam_keluar\` VARCHAR(50) NULL,
      \`shift_keluar\` VARCHAR(50) NULL,
      \`id_lot\` VARCHAR(100) NULL,
      \`no_palet\` VARCHAR(50) NULL,
      \`jenis_kopi\` VARCHAR(50) NULL,
      \`kg_keluar\` DECIMAL(12,2) NULL,
      \`tujuan\` VARCHAR(50) NULL,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX \`idx_gbb_keluar_tgl_tujuan\` (\`tanggal_keluar\`, \`tujuan\`),
      INDEX \`idx_gbb_keluar_id_lot\` (\`id_lot\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(queryPenerimaan);
  await pool.query(queryKeluar);
  return { success: true, message: 'GBB tables (gbb_penerimaan & gbb_transaksi_keluar) verified and ready.' };
}

if (require.main === module) {
  migrateGbbTables()
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error('GBB migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateGbbTables };
