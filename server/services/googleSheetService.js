const { bulkInsertExcelData } = require('./excelService');

const DEFAULT_QC_SHEET_ID = '1rx6D5Iecd7-3UzZiixLbkko5m1YYfYrQpTdZ60uIKUA';

const QC_TABLES = [
  'qc_grinding_t1',
  'qc_aroma_t1',
  'qc_hydro_t1',
  'qc_pure_aroma_t1',
  'qc_tank_system_t1',
  'qc_evaporasi_t1',
  'qc_final_tank_t1',
  'qc_feed_tank_t1',
  'qc_dryer_t1',
  'qc_mesh_t1',
  'qc_rework_t1',
];

let syncState = {
  lastSyncTime: null,
  isSyncing: false,
  lastSummary: null,
};

function getSpreadsheetId() {
  return process.env.GOOGLE_SHEET_QC_ID || DEFAULT_QC_SHEET_ID;
}

function getExportUrl(sheetId) {
  const id = sheetId || getSpreadsheetId();
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
}

async function fetchGoogleSheetBuffer(sheetId) {
  const url = getExportUrl(sheetId);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh Google Spreadsheet (HTTP ${res.status} ${res.statusText}). Pastikan link berstatus "Anyone with the link can view".`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function syncAllQcTables(sheetId) {
  if (syncState.isSyncing) {
    throw new Error('Proses sinkronisasi sedang berjalan. Harap tunggu sebentar.');
  }

  syncState.isSyncing = true;
  const startTime = Date.now();
  const targetId = sheetId || getSpreadsheetId();

  try {
    const buffer = await fetchGoogleSheetBuffer(targetId);
    const results = [];
    let totalImported = 0;
    let totalDuplicates = 0;

    for (const tbl of QC_TABLES) {
      try {
        const res = await bulkInsertExcelData(tbl, buffer);
        results.push({
          table: tbl,
          imported: res.imported || 0,
          duplicates: res.duplicates || 0,
          message: res.message,
          success: true,
        });
        totalImported += res.imported || 0;
        totalDuplicates += res.duplicates || 0;
      } catch (err) {
        results.push({
          table: tbl,
          imported: 0,
          duplicates: 0,
          message: err.message,
          success: false,
        });
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
      sheetId: targetId,
      totalTables: QC_TABLES.length,
      totalImported,
      totalDuplicates,
      durationSeconds: `${durationSeconds}s`,
      timestamp: new Date().toISOString(),
      results,
    };

    syncState.lastSyncTime = summary.timestamp;
    syncState.lastSummary = summary;
    return summary;
  } finally {
    syncState.isSyncing = false;
  }
}

async function syncSingleTable(tableName, sheetId) {
  const targetId = sheetId || getSpreadsheetId();
  const buffer = await fetchGoogleSheetBuffer(targetId);
  return await bulkInsertExcelData(tableName, buffer);
}

function getSyncStatus() {
  const id = getSpreadsheetId();
  return {
    sheetId: id,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
    exportUrl: getExportUrl(id),
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastSummary: syncState.lastSummary,
    supportedTables: QC_TABLES,
  };
}

module.exports = {
  syncAllQcTables,
  syncSingleTable,
  getSyncStatus,
  getSpreadsheetId,
};
