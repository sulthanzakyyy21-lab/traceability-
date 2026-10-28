const pool = require('../../db');
const bcrypt = require('bcryptjs');

async function migrateUsersTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(50) NOT NULL UNIQUE,
      \`password_hash\` VARCHAR(255) NOT NULL,
      \`full_name\` VARCHAR(100) NOT NULL,
      \`role\` ENUM('admin', 'produksi', 'qc', 'viewer') NOT NULL DEFAULT 'viewer',
      \`department\` VARCHAR(50) DEFAULT 'General',
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_username\` (\`username\`),
      INDEX \`idx_role\` (\`role\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await pool.query(createTableQuery);

  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      full_name: 'Super Admin SJA',
      role: 'admin',
      department: 'IT / Industrial Engineering',
    },
    {
      username: 'operator.prod',
      password: 'prod123',
      full_name: 'Operator Produksi SJA',
      role: 'produksi',
      department: 'Produksi',
    },
    {
      username: 'analis.qc',
      password: 'qc123',
      full_name: 'Analis Quality Control SJA',
      role: 'qc',
      department: 'Quality Control',
    },
    {
      username: 'viewer',
      password: 'view123',
      full_name: 'Auditor & Management SJA',
      role: 'viewer',
      department: 'Management',
    },
  ];

  for (const u of defaultUsers) {
    const [existing] = await pool.query('SELECT id FROM `users` WHERE `username` = ? LIMIT 1', [u.username]);
    if (existing.length === 0) {
      const hash = bcrypt.hashSync(u.password, 10);
      await pool.query(
        'INSERT INTO `users` (username, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, ?)',
        [u.username, hash, u.full_name, u.role, u.department]
      );
    }
  }

  return { success: true, message: 'Users table verified and seeded.' };
}

if (require.main === module) {
  migrateUsersTable()
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { migrateUsersTable };
