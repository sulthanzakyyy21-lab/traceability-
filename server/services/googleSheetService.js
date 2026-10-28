const crypto = require('crypto');
const xlsx = require('xlsx');
const pool = require('../db');
const { bulkInsertExcelData } = require('./excelService');
const { syncTowerTables, syncAllQcTables } = require('./googleSheetQcService');
const { getSyncStatus } = require('./googleSheetStatusService');
const { getSpreadsheetFingerprint } = require('./sheetMetadataService');
const {
  DEFAULT_PROD_SHEETS, PROD_TABLE_MAP, QC_TABLES_BY_TOWER,
  getSpreadsheetId, getTableSheetUrl, fetchGoogleSheetBuffer,
} = require('../config/sheetConfig');

let syncState = { lastSyncTime: null, isSyncing: false, lastSummary: null };
let activeSyncPromise = null;
const lastSyncByScope = {}, lastSummaryByScope = {}, sheetBufferHashes = {};
const SYNC_COOLDOWN_MS = 2 * 60 * 1000; // 2 menit cooldown (dari 10 detik)
const SYNC_FORCE_AFTER_MS = 30 * 60 * 1000; // Force sync jika data > 30 menit

const { hasEmptyTablesInScope } = require('./googleSheetScopeService');

async function executeUnifiedSync({ division = 'all', tower = 'all', customSheetId = null, force = false } = {}) {
  const startTime = Date.now(), now = startTime;
  let allResults = [], totalImported = 0, totalDuplicates = 0;
  const workbookCache = {}, fingerprintCache = {};
  try {
    if (division === 'all' || division === 'produksi') {
      const activeTower = String(tower).toLowerCase();
      for (const [tblKey, config] of Object.entries(PROD_TABLE_MAP)) {
        if (activeTower === '1' && config.tower !== 'Tower 1' && config.tower !== 'Non-Tower') continue;
        if (activeTower === '2' && config.tower !== 'Tower 2' && config.tower !== 'Non-Tower') continue;
        if ((activeTower === 'non-tower' || activeTower === 'nontower') && config.tower !== 'Non-Tower') continue;
        try {
          const [cntRows] = await pool.query(`SELECT 1 FROM \`${tblKey}\` LIMIT 1`);
          const isDbEmpty = cntRows.length === 0;

          if (!workbookCache[config.sheetId]) {
            const buffer = await fetchGoogleSheetBuffer(config.sheetId);
            const bufHash = crypto.createHash('md5').update(buffer).digest('hex');
            fingerprintCache[config.sheetId] = bufHash;
            workbookCache[config.sheetId] = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
          }
          const bufHash = fingerprintCache[config.sheetId];
          const timeSinceLastSync = now - (lastSyncByScope[`${division}:${tower}`] || 0);
          const forceByTime = timeSinceLastSync > SYNC_FORCE_AFTER_MS;
          const unchanged = !force && !forceByTime && !isDbEmpty && Boolean(bufHash && sheetBufferHashes[config.sheetId] === bufHash);

          if (unchanged) {
            allResults.push({ table: tblKey, label: config.title, pic: 'Produksi', tower: config.tower, imported: 0, duplicates: 0, message: 'Data spreadsheet mutakhir (tidak ada perubahan).', success: true });
            continue;
          }

          const wb = workbookCache[config.sheetId];
          const res = await bulkInsertExcelData(tblKey, wb, config.sheetName);
          if (bufHash) sheetBufferHashes[config.sheetId] = bufHash;

          allResults.push({ table: tblKey, label: config.title, pic: 'Produksi', tower: config.tower, imported: res.imported || 0, duplicates: res.duplicates || 0, message: res.message, success: true });
          totalImported += res.imported || 0;
          totalDuplicates += res.duplicates || 0;
        } catch (err) {
          allResults.push({ table: tblKey, label: config.title, pic: 'Produksi', tower: config.tower, imported: 0, duplicates: 0, message: err.message, success: false });
        }
      }
    }

    if (division === 'all' || division === 'qc') {
      const towersToSync = (tower === 'all' || tower === 'both') ? ['1', '2'] : [String(tower)];
      for (const t of towersToSync) {
        try {
          const lastQcTime = lastSyncByScope[`qc:${t}`] || lastSyncByScope['all:all'] || 0;
          const { results, imported, duplicates } = await syncTowerTables(t, towersToSync.length === 1 ? customSheetId : null, sheetBufferHashes, force, lastQcTime);
          results.forEach(r => { r.pic = 'QC'; r.label = r.table; });
          allResults = allResults.concat(results);
          totalImported += imported;
          totalDuplicates += duplicates;
        } catch (qcErr) {
          (QC_TABLES_BY_TOWER[t] || []).forEach(tbl => {
            allResults.push({ table: tbl, label: tbl, pic: 'QC', tower: `Tower ${t}`, imported: 0, duplicates: 0, message: qcErr.message, success: false });
          });
        }
      }
    }

    if (division === 'all' || division === 'pa') {
      try {
        const { syncAllPaTables } = require('./googleSheetPaService');
        const paRes = await syncAllPaTables({ tower, force, customSheetId });
        paRes.results.forEach(r => { r.pic = 'PA'; });
        allResults = allResults.concat(paRes.results);
        totalImported += paRes.imported;
        totalDuplicates += paRes.duplicates;
      } catch (paErr) {
        console.error('PA Sync Error in Unified:', paErr);
      }
    }

    Object.assign(sheetBufferHashes, fingerprintCache);
    const allFailed = allResults.length > 0 && allResults.every(r => !r.success);
    const summary = {
      division, tower, totalTables: allResults.length, totalImported, totalDuplicates,
      durationSeconds: `${((Date.now() - startTime) / 1000).toFixed(1)}s`, timestamp: new Date().toISOString(), results: allResults,
      success: !allFailed,
      error: allFailed ? allResults[0]?.message : null,
    };
    syncState.lastSyncTime = summary.timestamp;
    syncState.lastSummary = summary;
    const scopeKey = `${division}:${tower}`;
    lastSyncByScope[scopeKey] = lastSyncByScope['all:all'] = Date.now();
    lastSummaryByScope[scopeKey] = lastSummaryByScope['all:all'] = summary;
    return summary;
  } finally {
    syncState.isSyncing = false;
  }
}

async function syncUnifiedTables(options = {}) {
  const division = options.division || 'all';
  const tower = options.tower || 'all';
  const force = Boolean(options.force);
  const scopeKey = `${division}:${tower}`;
  const now = Date.now();

  if (activeSyncPromise) {
    const res = await activeSyncPromise;
    return { ...res, shared: true };
  }

  const hasEmpty = await hasEmptyTablesInScope(division, tower);
  if (!force && !hasEmpty && !options.customSheetId && (now - (lastSyncByScope[scopeKey] || 0) < SYNC_COOLDOWN_MS) && lastSummaryByScope[scopeKey]) {
    return { ...lastSummaryByScope[scopeKey], cached: true, message: 'Data sudah paling mutakhir, tidak perlu penarikan ulang.' };
  }

  syncState.isSyncing = true;
  const currentPromise = executeUnifiedSync(options);
  activeSyncPromise = currentPromise;
  try {
    return await currentPromise;
  } finally {
    syncState.isSyncing = false;
    activeSyncPromise = null;
  }
}

async function syncAllProdTables(options = {}) {
  return syncUnifiedTables({ division: 'produksi', tower: 'all', force: Boolean(options.force) });
}

const { syncSingleTable: runSyncSingleTable } = require('./googleSheetSingleService');

async function syncSingleTable(tableName, customSheetId, force = false) {
  if (activeSyncPromise) {
    await activeSyncPromise;
    return {
      table: tableName,
      label: PROD_TABLE_MAP[tableName]?.title || tableName,
      pic: PROD_TABLE_MAP[tableName] ? 'Produksi' : 'QC',
      tower: PROD_TABLE_MAP[tableName]?.tower || 'Tower 1',
      imported: 0,
      duplicates: 0,
      message: 'Tabel telah dimutakhirkan dalam proses sinkronisasi bersama.',
      success: true,
    };
  }
  return runSyncSingleTable(tableName, customSheetId, force, sheetBufferHashes);
}

module.exports = {
  syncUnifiedTables,
  syncAllQcTables: (towerOption, customSheetId) => syncUnifiedTables({ division: 'qc', tower: towerOption, customSheetId }),
  syncAllProdTables,
  syncSingleTable,
  getSyncStatus: () => getSyncStatus(syncState),
  getSpreadsheetId,
  getTableSheetUrl,
  PROD_TABLE_MAP,
  DEFAULT_PROD_SHEETS,
};

