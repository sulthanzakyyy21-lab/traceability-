const pool = require('../db');

const EXCLUDE_AVG_COLS = new Set([
  'id', 'Batch', 'Batch Finished Good', 'No Pack', 'Nomor Box', 'Jam', 'Tanggal',
  'Tanggal Analisa', 'Stamp', 'Mode', 'Mode Ekstraksi', 'Produk', 'Nama Produk',
  'Produk Finished Good', 'Bahan Rework', 'Jenis Percolator', 'Silo Degassing',
  'Silo degasing', 'Percolator', 'Tank System', 'Tank Sistem', 'Separasi dari Tank System',
  'Shift', 'Transfer ke-', 'Masakan ke', 'Verifikasi', 'Status', 'Screening Test',
  'TTD', 'PIC', 'Dianalisa Oleh', 'Formula', 'Keterangan', 'Lokasi Sampling'
]);

function parseNum(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const s = String(val).trim().replace(',', '.');
  if (s === '' || s === '-') return null;
  const m = s.match(/^-?\d+(\.\d+)?/);
  if (!m) return null;
  const num = parseFloat(m[0]);
  return isNaN(num) ? null : num;
}

function averageQcRows(rows) {
  if (!rows || rows.length === 0) return null;
  if (rows.length === 1) return { ...rows[0] };

  const first = rows[0];
  const aggregated = { ...first };

  for (const col of Object.keys(first)) {
    if (col === 'id') continue;
    if (EXCLUDE_AVG_COLS.has(col)) {
      const vals = [...new Set(rows.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== ''))];
      if (vals.length === 0) aggregated[col] = first[col];
      else if (vals.length === 1) aggregated[col] = vals[0];
      else if (col === 'Status') {
        const hasBO = vals.some(v => String(v).toUpperCase().includes('BO'));
        aggregated[col] = hasBO ? vals.join(', ') : 'OK';
      } else {
        aggregated[col] = vals.join(', ');
      }
      continue;
    }

    const hasSlash = rows.some(r => r[col] && String(r[col]).includes('/'));
    if (hasSlash) {
      const p1Nums = [];
      const p2Nums = [];
      for (const r of rows) {
        if (!r[col]) continue;
        const parts = String(r[col]).split('/');
        const n1 = parseNum(parts[0]);
        const n2 = parseNum(parts[1]);
        if (n1 !== null) p1Nums.push(n1);
        if (n2 !== null) p2Nums.push(n2);
      }
      if (p1Nums.length > 0 || p2Nums.length > 0) {
        const a1 = p1Nums.length > 0 ? (p1Nums.reduce((a, b) => a + b, 0) / p1Nums.length) : null;
        const a2 = p2Nums.length > 0 ? (p2Nums.reduce((a, b) => a + b, 0) / p2Nums.length) : null;
        const f1 = a1 !== null ? (a1 % 1 === 0 ? String(a1) : String(Math.round(a1 * 100) / 100)) : '-';
        const f2 = a2 !== null ? (a2 % 1 === 0 ? String(a2) : String(Math.round(a2 * 100) / 100)) : '-';
        aggregated[col] = `${f1} / ${f2}`;
        continue;
      }
    }

    const nums = [];
    for (const r of rows) {
      const n = parseNum(r[col]);
      if (n !== null) nums.push(n);
    }

    if (nums.length > 0) {
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      aggregated[col] = avg % 1 === 0 ? String(avg) : String(Math.round(avg * 100) / 100);
    } else {
      const vals = [...new Set(rows.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== ''))];
      aggregated[col] = vals.length > 0 ? vals.join(', ') : first[col];
    }
  }

  return aggregated;
}

/**
 * Helper to safely query a QC table by Batch and calculate average
 */
async function queryQcTable(tableName, batch, noBatchFull, customCol = null) {
  try {
    const bStr = String(batch);
    const fullStr = noBatchFull ? String(noBatchFull) : bStr;
    const likeStr = `%${bStr}%`;

    let sql = `SELECT * FROM \`${tableName}\` WHERE \`Batch\` = ? OR \`Batch\` = ? OR \`Batch\` LIKE ? ORDER BY id ASC`;
    let params = [bStr, fullStr, likeStr];

    if (customCol) {
      sql = `SELECT * FROM \`${tableName}\` WHERE \`${customCol}\` = ? OR \`${customCol}\` LIKE ? OR \`Batch\` = ? OR \`Batch\` LIKE ? ORDER BY id ASC`;
      params = [fullStr, likeStr, bStr, likeStr];
    }

    const [rows] = await pool.query(sql, params);
    const averagedData = averageQcRows(rows);

    return {
      found: rows.length > 0,
      totalRows: rows.length,
      data: averagedData,
      raw_rows: rows,
    };
  } catch (err) {
    return { found: false, totalRows: 0, data: null, raw_rows: [], error: err.message };
  }
}

/**
 * Retrieve QC records across all 10 QC tables for a given batch
 */
async function getQcFlow(batch, tahun, tower, noBatchFull) {
  const tw = String(tower || '1');
  if (tw !== '1') {
    return {
      tower: tw,
      info: 'Tabel QC Tower 2 belum tersedia di database.',
      hasData: false,
    };
  }

  const [
    rework,
    dryer,
    feedTank,
    finalTank,
    evaporasi,
    tankSystem,
    pureAroma,
    hydro,
    aroma,
    grinding,
  ] = await Promise.all([
    queryQcTable('qc_rework_t1', batch, noBatchFull, 'Batch Finished Good'),
    queryQcTable('qc_dryer_t1', batch, noBatchFull),
    queryQcTable('qc_feed_tank_t1', batch, noBatchFull),
    queryQcTable('qc_final_tank_t1', batch, noBatchFull),
    queryQcTable('qc_evaporasi_t1', batch, noBatchFull),
    queryQcTable('qc_tank_system_t1', batch, noBatchFull),
    queryQcTable('qc_pure_aroma_t1', batch, noBatchFull),
    queryQcTable('qc_hydro_t1', batch, noBatchFull),
    queryQcTable('qc_aroma_t1', batch, noBatchFull),
    queryQcTable('qc_grinding_t1', batch, noBatchFull),
  ]);

  const hasData = [rework, dryer, feedTank, finalTank, evaporasi, tankSystem, pureAroma, hydro, aroma, grinding].some(r => r.found);

  return {
    tower: tw,
    hasData,
    rework,
    dryer,
    feed_tank: feedTank,
    final_tank: finalTank,
    evaporasi,
    tank_system: tankSystem,
    pure_aroma: pureAroma,
    hydro,
    aroma,
    grinding,
  };
}

module.exports = { getQcFlow };
