const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { TableNameParamSchema } = require('../schemas/importSchema');
const {
  syncUnifiedTables,
  syncAllQcTables,
  syncAllProdTables,
  syncSingleTable,
  getSyncStatus,
} = require('../services/googleSheetService');
const { verifyToken, requireRole } = require('../middleware/auth');

const SyncBodySchema = z.object({
  sheetId: z.string().optional().nullable(),
  tower: z.enum(['1', '2', 'all', 'both']).optional().default('all'),
  division: z.enum(['qc', 'produksi', 'pa', 'all']).optional().default('all'),
  force: z.boolean().optional().default(false),
});

router.get('/status', (req, res) => {
  res.json(getSyncStatus());
});

// POST /api/gsheet/sync-all — Sync tables (Khusus Super Admin)
router.post('/sync-all', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const tower = bodyResult.success && bodyResult.data.tower ? bodyResult.data.tower : 'all';
    const division = bodyResult.success && bodyResult.data.division ? bodyResult.data.division : 'all';
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const force = bodyResult.success && req.body && req.body.force !== undefined ? Boolean(bodyResult.data.force) : true;
    const summary = await syncUnifiedTables({ division, tower, customSheetId: sheetId, force });
    if (!summary.success) {
      return res.status(500).json({ error: summary.error || 'Gagal sinkronisasi Google Sheets', ...summary });
    }
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Unified Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync-unified — Dedicated unified endpoint (Khusus Super Admin)
router.post('/sync-unified', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const tower = bodyResult.success && bodyResult.data.tower ? bodyResult.data.tower : 'all';
    const division = bodyResult.success && bodyResult.data.division ? bodyResult.data.division : 'all';
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const force = bodyResult.success && req.body && req.body.force !== undefined ? Boolean(bodyResult.data.force) : true;
    const summary = await syncUnifiedTables({ division, tower, customSheetId: sheetId, force });
    if (!summary.success) {
      return res.status(500).json({ error: summary.error || 'Gagal sinkronisasi Google Sheets', ...summary });
    }
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Unified Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync-prod — Sync Production tables (Khusus Super Admin)
router.post('/sync-prod', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const summary = await syncAllProdTables({ force: true });
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Produksi Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync-pa — Sync PA tables (Khusus Super Admin)
router.post('/sync-pa', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { syncAllPaTables } = require('../services/googleSheetPaService');
    const summary = await syncAllPaTables({ force: true, tower: req.body?.tower || 'all', customSheetId: req.body?.sheetId || null });
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet PA Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync/:tableName — Sync specific table (Khusus Super Admin)
router.post('/sync/:tableName', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const force = bodyResult.success && req.body && req.body.force !== undefined ? Boolean(bodyResult.data.force) : true;
    const result = await syncSingleTable(paramValidation.data.tableName, sheetId, force);
    res.json(result);
  } catch (err) {
    console.error('Single Table Google Sheet Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
