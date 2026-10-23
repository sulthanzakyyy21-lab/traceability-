const {
  DEFAULT_QC_SHEETS,
  DEFAULT_PROD_SHEETS,
  GDRIVE_FOLDER_ID,
  QC_TABLES_BY_TOWER,
  PROD_TABLE_MAP,
  getSpreadsheetId,
  getTableSheetUrl,
} = require('../config/sheetConfig');
const { getQcConnectorStatus } = require('./qcGoogleAuthService');
const { getProdConnectorStatus } = require('./prodGoogleAuthService');

function getSyncStatus(syncState = {}) {
  const t1Id = getSpreadsheetId('1');
  const t2Id = getSpreadsheetId('2');
  const tableUrls = {};
  for (const t of Object.keys(PROD_TABLE_MAP)) tableUrls[t] = getTableSheetUrl(t);
  for (const t of QC_TABLES_BY_TOWER['1']) tableUrls[t] = getTableSheetUrl(t);
  for (const t of QC_TABLES_BY_TOWER['2']) tableUrls[t] = getTableSheetUrl(t);

  const prodFiles = [
    {
      id: DEFAULT_PROD_SHEETS.roasting,
      title: 'Cheklist UPBM Roasting',
      url: `https://docs.google.com/spreadsheets/d/${DEFAULT_PROD_SHEETS.roasting}/edit`,
      tables: ['roasting_probat', 'roasting_scolari_1', 'roasting_scolari_2'],
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
    qcConnector: getQcConnectorStatus(),
    prodConnector: getProdConnectorStatus(),
    isSyncing: syncState.isSyncing || false,
    lastSyncTime: syncState.lastSyncTime || null,
    lastSummary: syncState.lastSummary || null,
  };
}

module.exports = { getSyncStatus };
