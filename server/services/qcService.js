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
  if (s === '' || s === '-' || s === 'null') return null;
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
      const vals = [...new Set(rows.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '0'))];
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

    const nums = [];
    for (const r of rows) {
      const n = parseNum(r[col]);
      if (n !== null) {
        if (n === 0 && ['brix', 'ph', 'cup test', 'density', 'solubility', 'floating'].some(k => col.toLowerCase().includes(k))) {
          continue;
        }
        nums.push(n);
      }
    }

    if (nums.length > 0) {
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      aggregated[col] = avg % 1 === 0 ? String(avg) : String(Math.round(avg * 100) / 100);
    } else {
      const vals = [...new Set(rows.map(r => r[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '0'))];
      aggregated[col] = vals.length > 0 ? vals.join(', ') : first[col];
    }
  }

  return aggregated;
}

async function queryQcTable(tableName, batch, noBatchFull, customCol = null) {
  try {
    const bStr = String(batch);
    const fullStr = noBatchFull ? String(noBatchFull).trim() : bStr;
    const pad3 = String(batch).padStart(3, '0');
    const yrSuffix = noBatchFull && noBatchFull.includes('/') ? noBatchFull.split('/')[1] : '26';
    const aBatch = `A${pad3}/${yrSuffix}`;
    const candidates = [...new Set([
      fullStr,
      aBatch,
      `A${bStr}/${yrSuffix}`,
      `A ${pad3}/${yrSuffix}`,
      `A${bStr}`,
      `A${pad3}`,
      bStr,
      pad3,
      `${bStr}/${yrSuffix}`,
      `${pad3}/${yrSuffix}`,
    ])];

    const placeholders = candidates.map(() => '?').join(', ');
    let sql = `SELECT * FROM \`${tableName}\` WHERE \`Batch\` IN (${placeholders}) ORDER BY id ASC`;
    let params = [...candidates];

    if (customCol) {
      sql = `SELECT * FROM \`${tableName}\` WHERE \`${customCol}\` IN (${placeholders}) OR \`Batch\` IN (${placeholders}) ORDER BY id ASC`;
      params = [...candidates, ...candidates];
    }

    let [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
      const likePats = [`%${aBatch}%`, `%${pad3}/${yrSuffix}%`, `%${bStr}/${yrSuffix}%`];
      const likeClause = likePats.map(() => (customCol ? `\`${customCol}\` LIKE ? OR \`Batch\` LIKE ?` : `\`Batch\` LIKE ?`)).join(' OR ');
      const likeParams = customCol ? likePats.flatMap(p => [p, p]) : likePats;
      [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE ${likeClause} ORDER BY id ASC`, likeParams);
    }

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

async function getQcFlow(batch, tahun, tower, noBatchFull) {
  const tw = String(tower || '1');
  if (tw !== '1') {
    return { tower: tw, info: 'Tabel QC Tower 2 belum tersedia di database.', hasData: false };
  }

  const [
    rework,
    dryerRaw,
    feedTank,
    finalTank,
    evaporasi,
    tankSystem,
    pureAroma,
    hydro,
    aroma,
    grinding,
    mesh,
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
    queryQcTable(tw === '2' ? 'qc_mesh_t2' : 'qc_mesh_t1', batch, noBatchFull),
  ]);

  // Separate Finished Goods from VF2 monitoring in qc_dryer_t1
  const allDryerRows = dryerRaw.raw_rows || [];
  const fgRows = allDryerRows.filter((r) => String(r['Nomor Box'] || '').trim().toUpperCase() !== 'VF2');
  const vf2Rows = allDryerRows.filter((r) => String(r['Nomor Box'] || '').trim().toUpperCase() === 'VF2');

  const dryer = {
    found: fgRows.length > 0 || dryerRaw.found,
    totalRows: fgRows.length || dryerRaw.totalRows,
    data: averageQcRows(fgRows.length > 0 ? fgRows : allDryerRows),
    raw_rows: fgRows.length > 0 ? fgRows : allDryerRows,
  };

  const dryerVf2 = {
    found: vf2Rows.length > 0,
    totalRows: vf2Rows.length,
    data: averageQcRows(vf2Rows),
    raw_rows: vf2Rows,
  };

  const hasData = [rework, dryer, feedTank, finalTank, evaporasi, tankSystem, pureAroma, hydro, aroma, grinding, mesh].some(r => r.found);

  return {
    tower: tw,
    hasData,
    rework,
    dryer,
    dryer_vf2: dryerVf2,
    feed_tank: feedTank,
    final_tank: finalTank,
    evaporasi,
    tank_system: tankSystem,
    pure_aroma: pureAroma,
    hydro,
    aroma,
    grinding,
    mesh,
  };
}

module.exports = { getQcFlow, averageQcRows };
