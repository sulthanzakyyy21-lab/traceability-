const pool = require('../db');
const { getVerification } = require('./verificationService');

async function initSessionTable() {
  const sql = `
  CREATE TABLE IF NOT EXISTS \`audit_session_state\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`session_key\` VARCHAR(32) NOT NULL DEFAULT 'current',
    \`no_batch\` VARCHAR(64) NOT NULL,
    \`tahun\` INT NOT NULL DEFAULT 2026,
    \`tower\` VARCHAR(10) NOT NULL DEFAULT '1',
    \`status\` ENUM('idle', 'running', 'completed', 'paused') NOT NULL DEFAULT 'idle',
    \`start_time\` DATETIME NULL,
    \`end_time\` DATETIME NULL,
    \`duration_seconds\` INT DEFAULT 0,
    \`started_by\` VARCHAR(100) NULL,
    \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY \`uq_session_key\` (\`session_key\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;
  try {
    await pool.query(sql);
  } catch (err) {
    console.error('[AuditSessionService] initSessionTable error:', err.message);
  }
}

async function getActiveSession() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM `audit_session_state` WHERE `session_key` = ? LIMIT 1',
      ['current']
    );
    if (rows.length === 0) {
      return {
        session_key: 'current',
        no_batch: 'A370/26',
        tahun: 2026,
        tower: '1',
        status: 'idle',
        start_time: null,
        end_time: null,
        elapsed_seconds: 0,
        duration_seconds: 0,
        started_by: null,
        verification: null
      };
    }

    const row = rows[0];
    const verification = await getVerification(row.no_batch, row.tahun, row.tower);

    // Auto-stop jika kedua parameter verifikasi (PA & Produksi) telah lengkap di DB
    if (row.status === 'running' && verification?.konsentrasi_lye && verification?.helper_packing) {
      const startMs = row.start_time ? new Date(row.start_time).getTime() : Date.now();
      const finalSec = Math.max(1, Math.floor((Date.now() - startMs) / 1000));
      await pool.query(
        'UPDATE `audit_session_state` SET `status` = ?, `end_time` = NOW(), `duration_seconds` = ? WHERE `session_key` = ?',
        ['completed', finalSec, 'current']
      );
      row.status = 'completed';
      row.duration_seconds = finalSec;
      row.elapsed_seconds = finalSec;
    } else if (row.status === 'running' && row.start_time) {
      const startMs = new Date(row.start_time).getTime();
      row.elapsed_seconds = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      row.duration_seconds = row.elapsed_seconds;
    } else {
      row.elapsed_seconds = row.duration_seconds || 0;
    }

    return {
      ...row,
      verification
    };
  } catch (err) {
    console.error('[AuditSessionService] getActiveSession error:', err.message);
    return null;
  }
}

async function startSession({ no_batch, tahun, tower, user }) {
  const cleanBatch = String(no_batch || 'A370/26').trim();
  const cleanYear = parseInt(tahun, 10) || 2026;
  const cleanTower = String(tower || '1').trim();
  const username = String(user || 'admin').trim();

  const sql = `
    INSERT INTO \`audit_session_state\`
      (\`session_key\`, \`no_batch\`, \`tahun\`, \`tower\`, \`status\`, \`start_time\`, \`end_time\`, \`duration_seconds\`, \`started_by\`)
    VALUES ('current', ?, ?, ?, 'running', NOW(), NULL, 0, ?)
    ON DUPLICATE KEY UPDATE
      \`no_batch\` = VALUES(\`no_batch\`),
      \`tahun\` = VALUES(\`tahun\`),
      \`tower\` = VALUES(\`tower\`),
      \`status\` = 'running',
      \`start_time\` = NOW(),
      \`end_time\` = NULL,
      \`duration_seconds\` = 0,
      \`started_by\` = VALUES(\`started_by\`);
  `;

  await pool.query(sql, [cleanBatch, cleanYear, cleanTower, username]);
  return getActiveSession();
}

async function stopSession() {
  const session = await getActiveSession();
  if (!session || session.status !== 'running') return session;

  const startMs = session.start_time ? new Date(session.start_time).getTime() : Date.now();
  const finalSec = Math.max(1, Math.floor((Date.now() - startMs) / 1000));

  await pool.query(
    'UPDATE `audit_session_state` SET `status` = ?, `end_time` = NOW(), `duration_seconds` = ? WHERE `session_key` = ?',
    ['completed', finalSec, 'current']
  );
  return getActiveSession();
}

async function resetSession() {
  await pool.query(
    'UPDATE `audit_session_state` SET `status` = ?, `start_time` = NULL, `end_time` = NULL, `duration_seconds` = 0 WHERE `session_key` = ?',
    ['idle', 'current']
  );
  return getActiveSession();
}

module.exports = {
  initSessionTable,
  getActiveSession,
  startSession,
  stopSession,
  resetSession
};

