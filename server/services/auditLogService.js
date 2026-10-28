const pool = require('../db');

/**
 * Service Audit Log & Non-Repudiation (GMS-PRAS v1.0 Kategori 10)
 * Mencatat seluruh perubahan data transaksi tanpa menghapus riwayat lama.
 */

async function recordAuditLog({
  userId = null,
  username = 'system',
  role = 'system',
  action,
  tableName,
  recordId = null,
  beforeData = null,
  afterData = null,
  ipAddress = null,
  reason = null,
}) {
  try {
    const beforeStr = beforeData ? (typeof beforeData === 'string' ? beforeData : JSON.stringify(beforeData)) : null;
    const afterStr = afterData ? (typeof afterData === 'string' ? afterData : JSON.stringify(afterData)) : null;

    const [res] = await pool.query(
      `INSERT INTO \`audit_logs\` 
        (user_id, username, role, action, table_name, record_id, before_data, after_data, ip_address, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        String(username || 'system').slice(0, 50),
        String(role || 'system').slice(0, 30),
        action,
        String(tableName || 'unknown').slice(0, 64),
        recordId ? String(recordId).slice(0, 64) : null,
        beforeStr,
        afterStr,
        ipAddress ? String(ipAddress).slice(0, 45) : null,
        reason ? String(reason).slice(0, 255) : null,
      ]
    );

    return { success: true, id: res.insertId };
  } catch (err) {
    // Non-blocking for production operations, logged to stderr
    console.error('[AuditLog] Gagal mencatat audit log:', err.message);
    return { success: false, error: err.message };
  }
}

async function getRecentAuditLogs({ limit = 50, tableName = null } = {}) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  let sql = 'SELECT * FROM `audit_logs` ';
  const params = [];

  if (tableName) {
    sql += 'WHERE `table_name` = ? ';
    params.push(tableName);
  }

  sql += 'ORDER BY `id` DESC LIMIT ?';
  params.push(safeLimit);

  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  recordAuditLog,
  getRecentAuditLogs,
};
