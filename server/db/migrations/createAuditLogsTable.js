const pool = require('../../db');

async function migrateAuditLogsTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS \`audit_logs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NULL,
      \`username\` VARCHAR(50) NOT NULL DEFAULT 'system',
      \`role\` VARCHAR(30) NOT NULL DEFAULT 'system',
      \`action\` ENUM('INSERT', 'UPDATE', 'DELETE', 'BULK_IMPORT', 'SYNC_GSHEET', 'CLEAR_DATA') NOT NULL,
      \`table_name\` VARCHAR(64) NOT NULL,
      \`record_id\` VARCHAR(64) NULL,
      \`before_data\` LONGTEXT NULL,
      \`after_data\` LONGTEXT NULL,
      \`ip_address\` VARCHAR(45) NULL,
      \`reason\` VARCHAR(255) NULL,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX \`idx_table_name\` (\`table_name\`),
      INDEX \`idx_action\` (\`action\`),
      INDEX \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(createTableQuery);
  return { success: true, message: 'Audit logs table verified and ready.' };
}

if (require.main === module) {
  migrateAuditLogsTable()
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Audit log migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateAuditLogsTable };
