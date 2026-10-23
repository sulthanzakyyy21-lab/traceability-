const crypto = require('crypto');
const xlsx = require('xlsx');
const pool = require('../db');
const { bulkInsertExcelData } = require('./excelService');
const { QC_TABLES_BY_TOWER, getSpreadsheetId, fetchQcSheetBuffer } = require('../config/sheetConfig');
const { getSpreadsheetFingerprint } = require('./sheetMetadataService');

async function syncTowerTables(towerKey, customSheetId, hashCache = {}, force = false, lastSyncTime = 0) {
  const targetId = customSheetId || getSpreadsheetId(towerKey);
  const tables = QC_TABLES_BY_TOWER[towerKey] || [];

  let hasEmpty = false;
  for (const tbl of tables) {
    try {
      const [r] = await pool.query(`SELECT 1 FROM \`${tbl}\` LIMIT 1`);
      if (r.length === 0) { hasEmpty = true; break; }
    } catch {}
  }

  const buffer = await fetchQcSheetBuffer(targetId);
  const bufHash = crypto.createHash('md5').update(buffer).digest('hex');
  const FORCE_AFTER_MS = 30 * 60 * 1000; // Force setelah 30 menit
  const forceByTime = (Date.now() - lastSyncTime) > FORCE_AFTER_MS;
  if (!force && !forceByTime && !hasEmpty && hashCache[targetId] === bufHash) {
    const results = tables.map(tbl => ({
      table: tbl,
      tower: `Tower ${towerKey}`,
      imported: 0,
      duplicates: 0,
      message: 'Data spreadsheet mutakhir (tidak ada perubahan).',
      success: true,
    }));
    return { tower: towerKey, sheetId: targetId, results, imported: 0, duplicates: 0 };
  }

  const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
  hashCache[targetId] = bufHash;

  const results = [];
  let imported = 0;
  let duplicates = 0;

  for (const tbl of tables) {
    try {
      const res = await bulkInsertExcelData(tbl, wb);
      results.push({
        table: tbl,
        tower: `Tower ${towerKey}`,
        imported: res.imported || 0,
        duplicates: res.duplicates || 0,
        message: res.message,
        success: true,
      });
      imported += res.imported || 0;
      duplicates += res.duplicates || 0;
    } catch (err) {
      results.push({
        table: tbl,
        tower: `Tower ${towerKey}`,
        imported: 0,
        duplicates: 0,
        message: err.message,
        success: false,
      });
    }
  }

  return { tower: towerKey, sheetId: targetId, results, imported, duplicates };
}

async function syncAllQcTables(towerOption = '1', customSheetId = null, syncState = {}, force = false, hashCache = {}) {
  const startTime = Date.now();
  const towersToSync = towerOption === 'all' || towerOption === 'both' ? ['1', '2'] : [String(towerOption)];

  try {
    let allResults = [];
    let totalImported = 0;
    let totalDuplicates = 0;

    for (const t of towersToSync) {
      const { results, imported, duplicates } = await syncTowerTables(t, towersToSync.length === 1 ? customSheetId : null, hashCache, force);
      allResults = allResults.concat(results);
      totalImported += imported;
      totalDuplicates += duplicates;
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
      division: 'QC',
      tower: towerOption,
      totalTables: allResults.length,
      totalImported,
      totalDuplicates,
      durationSeconds: `${durationSeconds}s`,
      timestamp: new Date().toISOString(),
      results: allResults,
    };

    syncState.lastSyncTime = summary.timestamp;
    syncState.lastSummary = summary;
    return summary;
  } finally {
    syncState.isSyncing = false;
  }
}

module.exports = {
  syncTowerTables,
  syncAllQcTables,
};
