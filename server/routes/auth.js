const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { loginUser, getUserProfile, listAllUsers, createNewUser } = require('../services/authService');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validatePasswordPolicy } = require('../utils/passwordPolicy');
const { loginRateLimiter, recordLoginFailure, resetLoginFailure } = require('../middleware/loginRateLimiter');

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi').max(50),
  password: z.string().min(1, 'Password wajib diisi').max(128),
});

const createUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter').max(50),
  password: z.string().refine((val) => validatePasswordPolicy(val).valid, {
    message: 'Password minimal 15 karakter dan tidak boleh menggunakan kata sandi umum (NIST SP 800-63B-4).',
  }),
  full_name: z.string().min(1, 'Nama lengkap wajib diisi').max(100),
  role: z.enum(['admin', 'produksi', 'qc', 'viewer']),
  department: z.string().max(50).optional(),
});

router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      recordLoginFailure(req);
      return res.status(400).json({
        success: false,
        message: parse.error.issues[0]?.message || 'Input login tidak valid.',
      });
    }

    const { username, password } = parse.data;
    const result = await loginUser(username, password);

    resetLoginFailure(req);
    return res.json({
      success: true,
      message: `Login berhasil sebagai ${result.user.full_name} (${result.user.role.toUpperCase()})`,
      ...result,
    });
  } catch (err) {
    recordLoginFailure(req);
    return res.status(401).json({
      success: false,
      message: err.message || 'Login gagal.',
    });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    return res.json({ success: true, user: profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/logout', (req, res) => {
  return res.json({ success: true, message: 'Logout berhasil.' });
});

router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await listAllUsers();
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        message: parse.error.issues[0]?.message || 'Data user tidak valid.',
      });
    }

    const created = await createNewUser(parse.data);
    return res.status(201).json({
      success: true,
      message: `User '${created.username}' berhasil dibuat.`,
      user: created,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
