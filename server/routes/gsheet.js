const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { TableNameParamSchema } = require('../schemas/importSchema');
const { syncAllQcTables, syncSingleTable, getSyncStatus } = require('../services/googleSheetService');

const SyncBodySchema = z.object({
  sheetId: z.string().optional().nullable(),
  tower: z.enum(['1', '2', 'all', 'both']).optional().default('1'),
});

router.get('/status', (req, res) => {
  res.json(getSyncStatus());
});

router.post('/sync-all', async (req, res) => {
  try {
    const bodyResult = SyncBodySchema.safeParse(req.body);
    const tower = bodyResult.success && bodyResult.data.tower ? bodyResult.data.tower : '1';
    const sheetId = bodyResult.success ? bodyResult.data.sheetId : null;
    const summary = await syncAllQcTables(tower, sheetId);
    res.json(summary);
  } catch (err) {
    console.error('Google Sheet Sync Error:', err);
    res.status(500).json({ error: err.message });
  }
});

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
