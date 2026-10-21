const { bulkInsertExcelData } = require('./excelService');
const { QC_TABLE_COLUMNS_MAP_T1 } = require('../config/qcColumnsT1');
const { QC_TABLE_COLUMNS_MAP_T2 } = require('../config/qcColumnsT2');

const DEFAULT_QC_SHEETS = {
  '1': process.env.GOOGLE_SHEET_QC_T1_ID || process.env.GOOGLE_SHEET_QC_ID || '1rx6D5Iecd7-3UzZiixLbkko5m1YYfYrQpTdZ60uIKUA',
  '2': process.env.GOOGLE_SHEET_QC_T2_ID || '1I_n0gmzWSZAkjZD-Hsdz-OVNmreo90dEwS3btq7KxY0',
};

const DEFAULT_PROD_SHEETS = {
  roasting: process.env.GOOGLE_SHEET_ROASTING_ID || '1PcdJp5v44Jjmy_gsjMLvAiGjtUqXBfmMfZszLCamRNg',
  extraction_t1: process.env.GOOGLE_SHEET_EXT_T1_ID || '1TNxgBuWR_5E7EYJFltHYGWZUFjJZ_9QrejEAiYW9ilQ',
  extraction_t2: process.env.GOOGLE_SHEET_EXT_T2_ID || '1GHO6q1iota0YrpUxklBj0_5ssTbSYZvpOG1NtCwxy0k',
  dryer_t1: process.env.GOOGLE_SHEET_DRYER_T1_ID || '1o9Q613gXAgnn5DQ_AQC-XG9e2DGJl7RG_W6y7A1_ctg',
  dryer_t2: process.env.GOOGLE_SHEET_DRYER_T2_ID || '1-UHi2pXHCyaR73Ws4wHJiXaBZ_CuIDCbhKMaLYqO_7U',
};

const GDRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1fNUUqJSoE1JesqkkmKZ6PU4dDP5MEswn';

const QC_TABLES_BY_TOWER = {
  '1': Object.keys(QC_TABLE_COLUMNS_MAP_T1),
  '2': Object.keys(QC_TABLE_COLUMNS_MAP_T2),
};

const PROD_TABLE_MAP = {
  roasting_probat: {
    sheetId: DEFAULT_PROD_SHEETS.roasting,
    title: 'Cheklist UPBM Roasting',
    sheetName: 'Checklist Hasil Produksi Roasti',
    tower: 'Non-Tower',
    flow: 'ROASTING',
  },
  extraction_tower_1: {
    sheetId: DEFAULT_PROD_SHEETS.extraction_t1,
    title: 'Checklist Tower 1 (Ekstraksi)',
    sheetName: 'Checklist Hasil Ekstraksi',
    tower: 'Tower 1',
    flow: 'EXTRACTION',
  },
  evaporation_tower_1: {
    sheetId: DEFAULT_PROD_SHEETS.extraction_t1,
    title: 'Checklist Tower 1 (Ekstraksi - Evaporasi)',
    sheetName: 'Checklist Hasil Evaporasi',
    tower: 'Tower 1',
    flow: 'EVAPORATION',
  },
  extraction_tower_2: {
    sheetId: DEFAULT_PROD_SHEETS.extraction_t2,
    title: 'Checklist Tower 2 (Ekstraksi)',
    sheetName: 'Checklist Hasil Ekstraksi',
    tower: 'Tower 2',
    flow: 'EXTRACTION',
  },
  evaporation_tower_2: {
    sheetId: DEFAULT_PROD_SHEETS.extraction_t2,
    title: 'Checklist Tower 2 (Ekstraksi - Evaporasi)',
    sheetName: 'Checklist Hasil Evaporasi',
    tower: 'Tower 2',
    flow: 'EVAPORATION',
  },
  dryer_tower_1: {
    sheetId: DEFAULT_PROD_SHEETS.dryer_t1,
    title: 'Checklist Dryer - Tower 1',
    sheetName: 'Checklist Scada Dryer - T1',
    tower: 'Tower 1',
    flow: 'DRYER',
  },
  packing_tower_1: {
    sheetId: DEFAULT_PROD_SHEETS.dryer_t1,
    title: 'Checklist Dryer - Tower 1 (Packing)',
    sheetName: 'Laporan Hasil Produksi - T1',
    tower: 'Tower 1',
    flow: 'PACKING',
  },
  dryer_tower_2: {
    sheetId: DEFAULT_PROD_SHEETS.dryer_t2,
    title: 'Checklist Dryer - Tower 2',
    sheetName: 'Checklist Scada Dryer - T2',
    tower: 'Tower 2',
    flow: 'DRYER',
  },
  packing_tower_2: {
    sheetId: DEFAULT_PROD_SHEETS.dryer_t2,
    title: 'Checklist Dryer - Tower 2 (Packing)',
    sheetName: 'Laporan Hasil Produksi - T2',
    tower: 'Tower 2',
    flow: 'PACKING',
  },
};

let syncState = {
  lastSyncTime: null,
  isSyncing: false,
  lastSummary: null,
};

function getSpreadsheetId(tower = '1') {
  return DEFAULT_QC_SHEETS[String(tower)] || DEFAULT_QC_SHEETS['1'];
}

function getTableSheetUrl(tableName) {
  if (PROD_TABLE_MAP[tableName]) {
    return `https://docs.google.com/spreadsheets/d/${PROD_TABLE_MAP[tableName].sheetId}/edit`;
  }
  if (QC_TABLE_COLUMNS_MAP_T2[tableName]) {
    return `https://docs.google.com/spreadsheets/d/${DEFAULT_QC_SHEETS['2']}/edit`;
  }
  if (QC_TABLE_COLUMNS_MAP_T1[tableName]) {
    return `https://docs.google.com/spreadsheets/d/${DEFAULT_QC_SHEETS['1']}/edit`;
  }
  return null;
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

async function syncAllProdTables() {
  if (syncState.isSyncing) {
    throw new Error('Proses sinkronisasi sedang berjalan. Harap tunggu sebentar.');
  }

  syncState.isSyncing = true;
  const startTime = Date.now();
  const results = [];
  let totalImported = 0;
  let totalDuplicates = 0;
  const bufferCache = {};

  try {
    for (const [tblKey, config] of Object.entries(PROD_TABLE_MAP)) {
      try {
        if (!bufferCache[config.sheetId]) {
          bufferCache[config.sheetId] = await fetchGoogleSheetBuffer(config.sheetId);
        }
        const buffer = bufferCache[config.sheetId];
        const res = await bulkInsertExcelData(tblKey, buffer);
        results.push({
          table: tblKey,
          label: config.title,
          tower: config.tower,
          imported: res.imported || 0,
          duplicates: res.duplicates || 0,
          message: res.message,
          success: true,
        });
        totalImported += res.imported || 0;
        totalDuplicates += res.duplicates || 0;
      } catch (err) {
        results.push({
          table: tblKey,
          label: config.title,
          tower: config.tower,
          imported: 0,
          duplicates: 0,
          message: err.message,
          success: false,
        });
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
      division: 'Produksi',
      totalTables: results.length,
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

async function syncUnifiedTables({ division = 'all', tower = 'all', customSheetId = null } = {}) {
  if (syncState.isSyncing) {
    throw new Error('Proses sinkronisasi sedang berjalan. Harap tunggu sebentar.');
  }

  syncState.isSyncing = true;
  const startTime = Date.now();
  let allResults = [];
  let totalImported = 0;
  let totalDuplicates = 0;

  try {
    // 1. Sync Produksi if requested
    if (division === 'all' || division === 'produksi') {
      const bufferCache = {};
      for (const [tblKey, config] of Object.entries(PROD_TABLE_MAP)) {
        if (tower === '1' && config.tower === 'Tower 2') continue;
        if (tower === '2' && config.tower === 'Tower 1') continue;

        try {
          if (!bufferCache[config.sheetId]) {
            bufferCache[config.sheetId] = await fetchGoogleSheetBuffer(config.sheetId);
          }
          const buffer = bufferCache[config.sheetId];
          const res = await bulkInsertExcelData(tblKey, buffer);
          const r = {
            table: tblKey,
            label: config.title,
            pic: 'Produksi',
            tower: config.tower,
            imported: res.imported || 0,
            duplicates: res.duplicates || 0,
            message: res.message,
            success: true,
          };
          allResults.push(r);
          totalImported += r.imported;
          totalDuplicates += r.duplicates;
        } catch (err) {
          allResults.push({
            table: tblKey,
            label: config.title,
            pic: 'Produksi',
            tower: config.tower,
            imported: 0,
            duplicates: 0,
            message: err.message,
            success: false,
          });
        }
      }
    }

    // 2. Sync QC if requested
    if (division === 'all' || division === 'qc') {
      const towersToSync = (tower === 'all' || tower === 'both') ? ['1', '2'] : [String(tower)];
      for (const t of towersToSync) {
        const { results, imported, duplicates } = await syncTowerTables(t, towersToSync.length === 1 ? customSheetId : null);
        results.forEach(r => {
          r.pic = 'QC';
          r.label = r.table;
        });
        allResults = allResults.concat(results);
        totalImported += imported;
        totalDuplicates += duplicates;
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    const summary = {
      division,
      tower,
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
  let targetId = customSheetId;
  let label = tableName;
  let pic = 'QC';
  let tower = 'Tower 1';

  if (PROD_TABLE_MAP[tableName]) {
    targetId = targetId || PROD_TABLE_MAP[tableName].sheetId;
    label = PROD_TABLE_MAP[tableName].title;
    pic = 'Produksi';
    tower = PROD_TABLE_MAP[tableName].tower;
  } else if (tableName.endsWith('_t2')) {
    targetId = targetId || getSpreadsheetId('2');
    tower = 'Tower 2';
  } else {
    targetId = targetId || getSpreadsheetId('1');
    tower = 'Tower 1';
  }

  const buffer = await fetchGoogleSheetBuffer(targetId);
  const res = await bulkInsertExcelData(tableName, buffer);
  return {
    table: tableName,
    label,
    pic,
    tower,
    imported: res.imported || 0,
    duplicates: res.duplicates || 0,
    message: res.message,
    success: true,
  };
}

function getSyncStatus() {
  const t1Id = getSpreadsheetId('1');
  const t2Id = getSpreadsheetId('2');

  const tableUrls = {};
  for (const t of Object.keys(PROD_TABLE_MAP)) {
    tableUrls[t] = getTableSheetUrl(t);
  }
  for (const t of QC_TABLES_BY_TOWER['1']) {
    tableUrls[t] = getTableSheetUrl(t);
  }
  for (const t of QC_TABLES_BY_TOWER['2']) {
    tableUrls[t] = getTableSheetUrl(t);
  }

  const prodFiles = [
    {
      id: DEFAULT_PROD_SHEETS.roasting,
      title: 'Cheklist UPBM Roasting',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.roasting}/edit`,
      tables: ['roasting_probat'],
      tower: 'Non-Tower',
    },
    {
      id: DEFAULT_PROD_SHEETS.extraction_t1,
      title: 'Checklist Tower 1 (Ekstraksi & Evaporasi)',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.extraction_t1}/edit`,
      tables: ['extraction_tower_1', 'evaporation_tower_1'],
      tower: 'Tower 1',
    },
    {
      id: DEFAULT_PROD_SHEETS.extraction_t2,
      title: 'Checklist Tower 2 (Ekstraksi & Evaporasi)',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.extraction_t2}/edit`,
      tables: ['extraction_tower_2', 'evaporation_tower_2'],
      tower: 'Tower 2',
    },
    {
      id: DEFAULT_PROD_SHEETS.dryer_t1,
      title: 'Checklist Dryer & Packing - Tower 1',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.dryer_t1}/edit`,
      tables: ['dryer_tower_1', 'packing_tower_1'],
      tower: 'Tower 1',
    },
    {
      id: DEFAULT_PROD_SHEETS.dryer_t2,
      title: 'Checklist Dryer & Packing - Tower 2',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.dryer_t2}/edit`,
      tables: ['dryer_tower_2', 'packing_tower_2'],
      tower: 'Tower 2',
    },
  ];

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
    prodFiles,
    prodTables: PROD_TABLE_MAP,
    tableUrls,
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastSummary: syncState.lastSummary,
  };
}

module.exports = {
  syncUnifiedTables,
  syncAllQcTables,
  syncAllProdTables,
  syncSingleTable,
  getSyncStatus,
  getSpreadsheetId,
  getTableSheetUrl,
  PROD_TABLE_MAP,
  DEFAULT_PROD_SHEETS,
};
