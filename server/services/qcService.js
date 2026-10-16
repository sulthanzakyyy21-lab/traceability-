const pool = require('../db');

/**
 * Helper to safely query a QC table by Batch
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
    return {
      found: rows.length > 0,
      totalRows: rows.length,
      data: rows[0] || null,
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
