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
 * GET /api/trace/years
 * Returns distinct production years genuinely available in database tables.
 */
router.get('/years', async (req, res) => {
  try {
    const pool = require('../db');
    const [rows] = await pool.query(
      `SELECT DISTINCT YEAR(tanggal) as yr FROM packing_tower_1 WHERE tanggal IS NOT NULL
       UNION
       SELECT DISTINCT YEAR(tanggal) as yr FROM packing_tower_2 WHERE tanggal IS NOT NULL
       ORDER BY yr DESC`
    );
    const years = rows.map((r) => r.yr).filter(Boolean);
    res.json({ success: true, years: years.length > 0 ? years : [2026, 2025] });
  } catch (err) {
    res.json({ success: false, years: [2026, 2025] });
  }
});

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

  const { noBatchFull, tower, tahun: queryTahun, tglProduksi, totalOutput } = parseResult.data;
  let { batch, tahun } = parseBatch(noBatchFull);
  if (!tahun && queryTahun) {
    tahun = queryTahun;
  }

  if (!batch) {
    return res.status(400).json({
      error: 'Format batch tidak valid. Harap gunakan format seperti A370/26 atau 370/26.',
    });
  }

  // Auto-detect Tower based on batch prefix ('A' -> Tower 1, 'B' -> Tower 2)
  const cleanBatch = (noBatchFull || '').trim().toUpperCase();
  let effectiveTower = tower;
  if (cleanBatch.startsWith('A')) {
    effectiveTower = '1';
  } else if (cleanBatch.startsWith('B')) {
    effectiveTower = '2';
  }

  const pool = require('../db');
  if (!tahun) {
    const packingTable = effectiveTower === '2' ? 'packing_tower_2' : 'packing_tower_1';
    try {
      const [pRows] = await pool.query(`SELECT YEAR(tanggal) as yr FROM \`${packingTable}\` WHERE batch = ? LIMIT 1`, [batch]);
      if (pRows.length > 0 && pRows[0].yr) {
        tahun = pRows[0].yr;
      } else {
        tahun = new Date().getFullYear();
      }
    } catch {
      tahun = new Date().getFullYear();
    }
  }

  const yr2 = String(tahun).slice(-2);
  const prefixChar = effectiveTower === '2' ? 'B' : 'A';
  let normalizedBatchFull = noBatchFull;
  if (!cleanBatch.startsWith('A') && !cleanBatch.startsWith('B')) {
    normalizedBatchFull = `${prefixChar}${String(batch).padStart(3, '0')}/${yr2}`;
  } else if (!noBatchFull.includes('/')) {
    normalizedBatchFull = `${noBatchFull}/${yr2}`;
  }

  try {
    const result = {
      input: {
        noBatchFull: normalizedBatchFull,
        rawNoBatch: noBatchFull,
        tower: effectiveTower,
        requestedTower: tower,
        autoDetectedTower: effectiveTower !== tower,
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
      rmw: null,
      mass_balance: null,
    };

    // 0. Packing stage
    result.packing = await getPackingFlow(batch, tahun, effectiveTower);

    // 1. Dryer stage
    result.dryer = await getDryerFlow(batch, tahun, effectiveTower);

    // 2. Evaporation stage
    result.evaporation = await getEvaporationFlow(batch, tahun, effectiveTower);

    // 3. Extraction stage
    const extractionResult = await getExtractionFlow(batch, tahun, effectiveTower);
    result.extraction = extractionResult;

    // 4. Roasting, UPBM, and Mass Balance stage
    const roastResult = await getRoastingFlow(
      extractionResult.siloNumbers,
      extractionResult.extractionStartStr,
      result.input.totalOutput,
      result.packing?.total_output_kg,
      batch
    );
    result.roasting = roastResult.roasting;
    result.upbm = roastResult.upbm;
    result.mass_balance = roastResult.mass_balance;

    // 5. QC stage (Tower 1 & Tower 2)
    const qcFlow = await getQcFlow(batch, tahun, effectiveTower, normalizedBatchFull);
    result.qc = formatQcTrace(qcFlow, result.packing, result.roasting);
    result.qc_raw = qcFlow;

    // 6. PA stage (Water Process, CIP Sanitasi, Environmental & Air)
    const { getPaFlow } = require('../services/paService');
    result.pa = await getPaFlow(
      batch,
      tahun,
      effectiveTower,
      extractionResult?.extractionStartStr,
      result.packing?.tanggal,
      result.dryer?.tanggal
    );

    // 6.5. Incoming Raw Material stage (RMW / GBB)
    const { getGbbFlow } = require('../services/gbbService');
    result.rmw = await getGbbFlow(
      batch,
      tahun,
      result.roasting?.jenis_biji_mentah,
      extractionResult?.extractionStartStr
    );

    // 7. Manual Verifications from DB (Human-in-the-Loop)
    const { getVerification } = require('../services/verificationService');
    const verif = await getVerification(normalizedBatchFull, tahun, effectiveTower);
    result.verification = verif;
    if (verif) {
      if (verif.helper_packing && result.packing) {
        result.packing.helper_packing = verif.helper_packing;
      }
      if (verif.konsentrasi_lye && result.pa?.cip) {
        ['evaporation', 'final_tank', 'extraction', 'dryer', 'rework'].forEach(k => {
          if (result.pa.cip[k]) result.pa.cip[k].konsentrasi_lye = verif.konsentrasi_lye;
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error('[Trace Service Error]:', error);
    res.status(500).json({ error: 'Terjadi kesalahan internal pada server saat menelusuri data batch.' });
  }
});

module.exports = router;
