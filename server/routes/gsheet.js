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

const SyncBodySchema = z.object({
  sheetId: z.string().optional().nullable(),
  tower: z.enum(['1', '2', 'all', 'both']).optional().default('all'),
  division: z.enum(['qc', 'produksi', 'all']).optional().default('all'),
});

router.get('/status', (req, res) => {
  res.json(getSyncStatus());
});

// POST /api/gsheet/sync-all — Sync tables (Produksi, QC, or Both)
router.post('/sync-all', async (req, res) => {
  try {
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const tower = bodyResult.success && bodyResult.data.tower ? bodyResult.data.tower : 'all';
    const division = bodyResult.success && bodyResult.data.division ? bodyResult.data.division : 'all';
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const summary = await syncUnifiedTables({ division, tower, customSheetId: sheetId });
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Unified Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync-unified — Dedicated unified endpoint
router.post('/sync-unified', async (req, res) => {
  try {
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const tower = bodyResult.success && bodyResult.data.tower ? bodyResult.data.tower : 'all';
    const division = bodyResult.success && bodyResult.data.division ? bodyResult.data.division : 'all';
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const summary = await syncUnifiedTables({ division, tower, customSheetId: sheetId });
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Unified Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync-prod — Sync Production tables (Roasting, Ekstraksi, Evaporasi, Dryer, Packing)
router.post('/sync-prod', async (req, res) => {
  try {
    const summary = await syncAllProdTables();
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Produksi Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gsheet/sync/:tableName — Sync specific table (QC or Produksi)
router.post('/sync/:tableName', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const result = await syncSingleTable(paramValidation.data.tableName, sheetId);
    res.json(result);
  } catch (err) {
    console.error('Single Table Google Sheet Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
