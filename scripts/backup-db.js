const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../server/db');
const { ALLOWED_TABLES } = require('../server/tableConfig');

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilename = `backup_traceability_${timestamp}.json`;
  const backupPath = path.join(backupDir, backupFilename);
  const sha256Path = `${backupPath}.sha256`;

  const tablesToBackup = [...ALLOWED_TABLES, 'users', 'audit_logs'];
  const dump = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    system: 'Traceability System PT. Santos Jaya Abadi',
    tables: {},
    summary: { totalTables: 0, totalRows: 0 },
  };

  for (const table of tablesToBackup) {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
      dump.tables[table] = rows;
      dump.summary.totalRows += rows.length;
      dump.summary.totalTables += 1;
    } catch {
      // Table may not exist yet if uninitialized
      dump.tables[table] = [];
    }
  }

  const dumpContent = JSON.stringify(dump, null, 2);
  fs.writeFileSync(backupPath, dumpContent, 'utf8');

  // Compute SHA-256
  const hash = crypto.createHash('sha256').update(dumpContent).digest('hex');
  fs.writeFileSync(sha256Path, `${hash}  ${backupFilename}\n`, 'utf8');

  console.log(`✅ Backup berhasil dibuat: ${backupFilename}`);
  console.log(`📦 Ringkasan: ${dump.summary.totalTables} tabel, ${dump.summary.totalRows} baris`);
  console.log(`🔒 SHA-256: ${hash}`);

  return {
    backupFile: backupFilename,
    backupPath,
    sha256: hash,
    tables: dump.summary.totalTables,
    rows: dump.summary.totalRows,
    createdAt: dump.createdAt,
  };
}

if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Backup error:', err);
      process.exit(1);
    });
}

module.exports = { createBackup };
