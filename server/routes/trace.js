const express = require('express');
const router = express.Router();
const { TraceQuerySchema } = require('../schemas/traceSchema');
const { parseBatch } = require('../utils/traceHelpers');
const { getPackingFlow } = require('../services/packingService');
const { getDryerFlow } = require('../services/dryerService');
const { getEvaporationFlow } = require('../services/evaporationService');
const { getExtractionFlow } = require('../services/extractionService');
const { getRoastingFlow } = require('../services/roastingService');
const { getQcFlow } = require('../services/qcService');
const { formatQcTrace } = require('../services/qcFormatter');

/**
 * GET /api/trace
 * Orchestrates full multi-echelon traceability query across all production stages.
 */
router.get('/', async (req, res) => {
  const parseResult = TraceQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    const msg = parseResult.error.issues?.[0]?.message || parseResult.error.message || 'Input query tidak valid.';
    return res.status(400).json({
      error: msg,
      details: parseResult.error.format(),
    });
  }

  const { noBatchFull, tower, tglProduksi, totalOutput } = parseResult.data;
  let { batch, tahun } = parseBatch(noBatchFull);

  if (!batch) {
    return res.status(400).json({
      error: 'Format batch tidak valid. Harap gunakan format seperti A370/26 atau 370/26.',
    });
  }

  const pool = require('../db');
  if (!tahun) {
    const packingTable = tower === '2' ? 'packing_tower_2' : 'packing_tower_1';
    try {
      const [pRows] = await pool.query(`SELECT YEAR(tanggal) as yr FROM \`${packingTable}\` WHERE batch = ? LIMIT 1`, [batch]);
      if (pRows.length > 0 && pRows[0].yr) {
        tahun = pRows[0].yr;
      } else {
        tahun = 2026;
      }
    } catch {
      tahun = 2026;
    }
  }

  const yr2 = String(tahun).slice(-2);
  const normalizedBatchFull = noBatchFull.includes('/') ? noBatchFull : `A${String(batch).padStart(3, '0')}/${yr2}`;

  try {
    const result = {
      input: {
        noBatchFull: normalizedBatchFull,
        rawNoBatch: noBatchFull,
        tower,
        batch,
        tahun,
        tglProduksi: tglProduksi || null,
        totalOutput: totalOutput ? parseFloat(totalOutput) : null,
      },
      packing: null,
      dryer: null,
      evaporation: null,
      extraction: null,
      roasting: null,
      upbm: null,
      mass_balance: null,
    };

    // 0. Packing stage
    result.packing = await getPackingFlow(batch, tahun, tower);

    // 1. Dryer stage
    result.dryer = await getDryerFlow(batch, tahun, tower);

    // 2. Evaporation stage
    result.evaporation = await getEvaporationFlow(batch, tahun, tower);

    // 3. Extraction stage
    const extractionResult = await getExtractionFlow(batch, tahun, tower);
    result.extraction = extractionResult;

    // 4. Roasting, UPBM, and Mass Balance stage
    const roastResult = await getRoastingFlow(
      extractionResult.siloNumbers,
      extractionResult.extractionStartStr,
      result.input.totalOutput,
      result.packing?.total_output_kg
    );
    result.roasting = roastResult.roasting;
    result.upbm = roastResult.upbm;
    result.mass_balance = roastResult.mass_balance;

    // 5. QC stage (Tower 1 & Tower 2)
    const qcFlow = await getQcFlow(batch, tahun, tower, normalizedBatchFull);
    result.qc = formatQcTrace(qcFlow, result.packing, result.roasting);
    result.qc_raw = qcFlow;

    res.json(result);
  } catch (error) {
    console.error('Trace error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
