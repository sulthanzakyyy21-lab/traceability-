const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const {
  getActiveSession,
  startSession,
  stopSession,
  resetSession
} = require('../services/auditSessionService');

// GET /api/trace/session/active - Sinkronisasi status audit real-time untuk seluruh pengguna
router.get('/active', async (req, res) => {
  try {
    const session = await getActiveSession();
    return res.json({ success: true, session });
  } catch (err) {
    console.error('GET /api/trace/session/active error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trace/session/start - Wewenang mutlak Super Admin
router.post('/start', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { no_batch, tahun, tower } = req.body;
    const session = await startSession({
      no_batch: no_batch || 'A370/26',
      tahun: tahun || 2026,
      tower: tower || '1',
      user: req.user?.username || 'admin'
    });
    return res.json({ success: true, session });
  } catch (err) {
    console.error('POST /api/trace/session/start error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trace/session/stop - Wewenang mutlak Super Admin
router.post('/stop', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const session = await stopSession();
    return res.json({ success: true, session });
  } catch (err) {
    console.error('POST /api/trace/session/stop error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trace/session/reset - Wewenang mutlak Super Admin
router.post('/reset', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const session = await resetSession();
    return res.json({ success: true, session });
  } catch (err) {
    console.error('POST /api/trace/session/reset error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

