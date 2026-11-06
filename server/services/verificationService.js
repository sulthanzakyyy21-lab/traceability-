const pool = require('../db');

async function initVerificationTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS \`audit_manual_verifications\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`no_batch\` VARCHAR(64) NOT NULL,
    \`tahun\` INT NOT NULL,
    \`tower\` VARCHAR(10) NOT NULL,
    \`konsentrasi_lye\` VARCHAR(64) DEFAULT NULL,
    \`helper_packing\` VARCHAR(255) DEFAULT NULL,
    \`pic_pa\` VARCHAR(100) DEFAULT NULL,
    \`pic_produksi\` VARCHAR(100) DEFAULT NULL,
    \`duration_seconds\` INT DEFAULT 0,
    \`verified_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
    \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_batch_year_tower\` (\`no_batch\`, \`tahun\`, \`tower\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await pool.query(sql);
  } catch (err) {
    console.error('[VerificationService] Init table error:', err.message);
  }
}

async function getVerification(batch, tahun, tower) {
  try {
    const cleanBatch = String(batch || '').trim();
    const cleanYear = parseInt(tahun, 10) || 2026;
    const cleanTower = String(tower || '1').trim();
    const [rows] = await pool.query(
      `SELECT * FROM \`audit_manual_verifications\` WHERE \`no_batch\` = ? AND \`tahun\` = ? AND \`tower\` = ? LIMIT 1`,
      [cleanBatch, cleanYear, cleanTower]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error('[VerificationService] getVerification error:', err.message);
    return null;
  }
}

async function saveVerification(payload) {
  const {
    no_batch,
    tahun,
    tower,
    konsentrasi_lye,
    helper_packing,
    pic_pa,
    pic_produksi,
    duration_seconds
  } = payload;

  const cleanBatch = String(no_batch || '').trim();
  const cleanYear = parseInt(tahun, 10) || 2026;
  const cleanTower = String(tower || '1').trim();
  const durSec = parseInt(duration_seconds, 10) || 0;

  const sql = `
    INSERT INTO \`audit_manual_verifications\`
      (\`no_batch\`, \`tahun\`, \`tower\`, \`konsentrasi_lye\`, \`helper_packing\`, \`pic_pa\`, \`pic_produksi\`, \`duration_seconds\`, \`verified_at\`)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      \`konsentrasi_lye\` = COALESCE(VALUES(\`konsentrasi_lye\`), \`konsentrasi_lye\`),
      \`helper_packing\` = COALESCE(VALUES(\`helper_packing\`), \`helper_packing\`),
      \`pic_pa\` = COALESCE(VALUES(\`pic_pa\`), \`pic_pa\`),
      \`pic_produksi\` = COALESCE(VALUES(\`pic_produksi\`), \`pic_produksi\`),
      \`duration_seconds\` = CASE WHEN VALUES(\`duration_seconds\`) > 0 THEN VALUES(\`duration_seconds\`) ELSE \`duration_seconds\` END,
      \`verified_at\` = NOW();
  `;

  await pool.query(sql, [
    cleanBatch, cleanYear, cleanTower,
    konsentrasi_lye || null,
    helper_packing || null,
    pic_pa || null,
    pic_produksi || null,
    durSec
  ]);

  const verified = await getVerification(cleanBatch, cleanYear, cleanTower);
  if (verified && verified.konsentrasi_lye && verified.helper_packing) {
    try {
      const dur = durSec || verified.duration_seconds || 1;
      await pool.query(
        "UPDATE `audit_session_state` SET `status` = 'completed', `end_time` = NOW(), `duration_seconds` = CASE WHEN `duration_seconds` = 0 THEN ? ELSE `duration_seconds` END WHERE `session_key` = 'current'",
        [dur]
      );
    } catch (_) {}
  }
  return verified;
}

async function resetVerification(batch, tahun, tower) {
  try {
    const cleanBatch = String(batch || '').trim();
    const cleanYear = parseInt(tahun, 10) || 2026;
    const cleanTower = String(tower || '1').trim();
    await pool.query(
      `DELETE FROM \`audit_manual_verifications\` WHERE \`no_batch\` = ? AND \`tahun\` = ? AND \`tower\` = ?`,
      [cleanBatch, cleanYear, cleanTower]
    );
    try {
      await pool.query(
        "UPDATE `audit_session_state` SET `status` = 'idle', `start_time` = NULL, `end_time` = NULL, `duration_seconds` = 0 WHERE `session_key` = 'current'"
      );
    } catch (_) {}
    return true;
  } catch (err) {
    console.error('[VerificationService] resetVerification error:', err.message);
    return false;
  }
}

module.exports = {
  initVerificationTable,
  getVerification,
  saveVerification,
  resetVerification
};

