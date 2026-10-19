const { bulkInsertExcelData } = require('./excelService');
const { QC_TABLE_COLUMNS_MAP_T1 } = require('../config/qcColumnsT1');
const { QC_TABLE_COLUMNS_MAP_T2 } = require('../config/qcColumnsT2');

const DEFAULT_QC_SHEETS = {
  '1': process.env.GOOGLE_SHEET_QC_T1_ID || process.env.GOOGLE_SHEET_QC_ID || '1rx6D5Iecd7-3UzZiixLbkko5m1YYfYrQpTdZ60uIKUA',
  '2': process.env.GOOGLE_SHEET_QC_T2_ID || '1I_n0gmzWSZAkjZD-Hsdz-OVNmreo90dEwS3btq7KxY0',
};

const GDRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1hRgNzF2I5Q3AB22pd8xZDOexzoPUZP95';

const QC_TABLES_BY_TOWER = {
  '1': Object.keys(QC_TABLE_COLUMNS_MAP_T1),
  '2': Object.keys(QC_TABLE_COLUMNS_MAP_T2),
};

let syncState = {
  lastSyncTime: null,
  isSyncing: false,
  lastSummary: null,
};

function getSpreadsheetId(tower = '1') {
  return DEFAULT_QC_SHEETS[String(tower)] || DEFAULT_QC_SHEETS['1'];
}

function getExportUrl(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
}

async function fetchGoogleSheetBuffer(sheetId) {
  const url = getExportUrl(sheetId);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    redirect: 'follow',
  });

  if (!res.ok) {
    throw new Error(`Gagal mengunduh Google Spreadsheet (${sheetId}, HTTP ${res.status}). Pastikan link berstatus "Anyone with the link can view".`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function syncTowerTables(towerKey, customSheetId) {
  const targetId = customSheetId || getSpreadsheetId(towerKey);
  const tables = QC_TABLES_BY_TOWER[towerKey] || [];
  const buffer = await fetchGoogleSheetBuffer(targetId);
  const results = [];
  let imported = 0;
  let duplicates = 0;

  for (const tbl of tables) {
    try {
      const res = await bulkInsertExcelData(tbl, buffer);
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

async function syncAllQcTables(towerOption = '1', customSheetId = null) {
  if (syncState.isSyncing) {
    throw new Error('Proses sinkronisasi sedang berjalan. Harap tunggu sebentar.');
  }

  syncState.isSyncing = true;
  const startTime = Date.now();
  const towersToSync = towerOption === 'all' || towerOption === 'both' ? ['1', '2'] : [String(towerOption)];

  try {
    let allResults = [];
    let totalImported = 0;
    let totalDuplicates = 0;

    for (const t of towersToSync) {
      const { results, imported, duplicates } = await syncTowerTables(t, towersToSync.length === 1 ? customSheetId : null);
      allResults = allResults.concat(results);
      totalImported += imported;
      totalDuplicates += duplicates;
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
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

async function syncSingleTable(tableName, customSheetId) {
  const isT2 = tableName.endsWith('_t2');
  const targetId = customSheetId || (isT2 ? getSpreadsheetId('2') : getSpreadsheetId('1'));
  const buffer = await fetchGoogleSheetBuffer(targetId);
  return await bulkInsertExcelData(tableName, buffer);
}

function getSyncStatus() {
  const t1Id = getSpreadsheetId('1');
  const t2Id = getSpreadsheetId('2');
  return {
    folderUrl: `https://drive.google.com/drive/folders/${GDRIVE_FOLDER_ID}`,
    sheetId: t1Id,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${t1Id}/edit`,
    towers: {
      '1': {
        tower: 'Tower 1',
        sheetId: t1Id,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${t1Id}/edit`,
        tableCount: QC_TABLES_BY_TOWER['1'].length,
        tables: QC_TABLES_BY_TOWER['1'],
      },
      '2': {
        tower: 'Tower 2',
        sheetId: t2Id,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${t2Id}/edit`,
        tableCount: QC_TABLES_BY_TOWER['2'].length,
        tables: QC_TABLES_BY_TOWER['2'],
      },
    },
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastSummary: syncState.lastSummary,
  };
}

module.exports = {
  syncAllQcTables,
  syncSingleTable,
  getSyncStatus,
  getSpreadsheetId,
};
