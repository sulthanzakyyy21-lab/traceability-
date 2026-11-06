const express = require('express');
const router = express.Router();
const { saveVerification, resetVerification, getVerification } = require('../services/verificationService');

router.post('/', async (req, res) => {
  try {
    const { no_batch, tahun, tower, konsentrasi_lye, helper_packing, pic_pa, pic_produksi, duration_seconds } = req.body;
    if (!no_batch) {
      return res.status(400).json({ success: false, error: 'no_batch wajib diisi.' });
    }
    const saved = await saveVerification({
      no_batch,
      tahun: tahun || 2026,
      tower: tower || '1',
      konsentrasi_lye,
      helper_packing,
      pic_pa,
      pic_produksi,
      duration_seconds
    });
    return res.json({ success: true, verification: saved });
  } catch (err) {
    console.error('POST /api/trace/verify error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/reset', async (req, res) => {
  try {
    const { no_batch, tahun, tower } = req.body;
    if (!no_batch) {
      return res.status(400).json({ success: false, error: 'no_batch wajib diisi.' });
    }
    await resetVerification(no_batch, tahun || 2026, tower || '1');
    return res.json({ success: true, message: 'Verifikasi manual berhasil direset.' });
  } catch (err) {
    console.error('POST /api/trace/verify/reset error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { batch, no_batch, tahun, tower } = req.query;
    const cleanBatch = batch || no_batch;
    const record = await getVerification(cleanBatch, tahun || 2026, tower || '1');
    return res.json({ success: true, verification: record });
  } catch (err) {
    console.error('GET /api/trace/verify error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:batch(*)', async (req, res) => {
  try {
    const batch = req.params.batch;
    const { tahun, tower } = req.query;
    const record = await getVerification(batch, tahun || 2026, tower || '1');
    return res.json({ success: true, verification: record });
  } catch (err) {
    console.error('GET /api/trace/verify/:batch error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

