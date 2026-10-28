const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { validatePasswordPolicy } = require('../utils/passwordPolicy');

async function loginUser(username, password) {
  if (!username || !password) {
    throw new Error('Username dan password wajib diisi.');
  }

  const [rows] = await pool.query(
    'SELECT id, username, password_hash, full_name, role, department, is_active FROM `users` WHERE `username` = ? LIMIT 1',
    [username.trim()]
  );

  if (rows.length === 0) {
    throw new Error('Username atau password salah.');
  }

  const user = rows[0];

  if (!user.is_active) {
    throw new Error('Akun ini dinonaktifkan. Hubungi Administrator sistem.');
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    throw new Error('Username atau password salah.');
  }

  const payload = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
    department: user.department,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });

  return {
    user: payload,
    token,
  };
}

async function getUserProfile(userId) {
  const [rows] = await pool.query(
    'SELECT id, username, full_name, role, department, is_active, created_at FROM `users` WHERE `id` = ? LIMIT 1',
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0];
}

async function listAllUsers() {
  const [rows] = await pool.query(
    'SELECT id, username, full_name, role, department, is_active, created_at FROM `users` ORDER BY id ASC'
  );
  return rows;
}

async function createNewUser({ username, password, full_name, role = 'viewer', department = 'General' }) {
  if (!username || !password || !full_name) {
    throw new Error('Username, password, dan nama lengkap wajib diisi.');
  }

  const validRoles = ['admin', 'produksi', 'qc', 'viewer'];
  if (!validRoles.includes(role)) {
    throw new Error(`Role '${role}' tidak valid. Pilihan: ${validRoles.join(', ')}`);
  }

  const policy = validatePasswordPolicy(password, username);
  if (!policy.valid) {
    throw new Error(policy.error);
  }

  const [existing] = await pool.query('SELECT id FROM `users` WHERE `username` = ? LIMIT 1', [username.trim()]);
  if (existing.length > 0) {
    throw new Error(`Username '${username}' sudah digunakan.`);
  }

  const hash = bcrypt.hashSync(password, 10);
  const [result] = await pool.query(
    'INSERT INTO `users` (username, password_hash, full_name, role, department) VALUES (?, ?, ?, ?, ?)',
    [username.trim(), hash, full_name.trim(), role, department.trim()]
  );

  return {
    id: result.insertId,
    username: username.trim(),
    full_name: full_name.trim(),
    role,
    department: department.trim(),
  };
}

module.exports = {
  loginUser,
  getUserProfile,
  listAllUsers,
  createNewUser,
};
