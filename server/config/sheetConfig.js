const { QC_TABLE_COLUMNS_MAP_T1 } = require('./qcColumnsT1');
const { QC_TABLE_COLUMNS_MAP_T2 } = require('./qcColumnsT2');

const DEFAULT_QC_SHEETS = {
  '1': process.env.GOOGLE_SHEET_QC_T1_ID || process.env.GOOGLE_SHEET_QC_ID || '1rx6D5Iecd7-3UzZiixLbkko5m1YYfYrQpTdZ60uIKUA',
  '2': process.env.GOOGLE_SHEET_QC_T2_ID || '1I_n0gmzWSZAkjZD-Hsdz-OVNmreo90dEwS3btq7KxY0',
};

const DEFAULT_PROD_SHEETS = {
  roasting: process.env.GOOGLE_SHEET_ROASTING_ID || '1PcdJp5v44Jjmy_gsjMLvAiGjtUqXBfmMfZszLCamRNg',
  extraction_t1: process.env.GOOGLE_SHEET_EXT_T1_ID || '1TNxgBuWR_5E7EYJFltHYGWZUFjJZ_9QrejEAiYW9ilQ',
  evaporation_t1: process.env.GOOGLE_SHEET_EVAP_T1_ID || process.env.GOOGLE_SHEET_EXT_T1_ID || '1TNxgBuWR_5E7EYJFltHYGWZUFjJZ_9QrejEAiYW9ilQ',
  extraction_t2: process.env.GOOGLE_SHEET_EXT_T2_ID || '1DILvtmlL4zIzOeMusV7AHAiIn5v2jckpuD4eLzdFFFM',
  evaporation_t2: process.env.GOOGLE_SHEET_EVAP_T2_ID || process.env.GOOGLE_SHEET_EXT_T2_ID || '1DILvtmlL4zIzOeMusV7AHAiIn5v2jckpuD4eLzdFFFM',
  dryer_t1: process.env.GOOGLE_SHEET_DRYER_T1_ID || '19J2qf2d4lKGfPZ4SeY6w7ZW1BIv4SoVC3MVS7WP1QCo',
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
    title: 'Roasting Probat',
    sheetName: 'Checklist Hasil Produksi Roasti',
    tower: 'Non-Tower',
    flow: 'ROASTING',
  },
  roasting_scolari_1: {
    sheetId: DEFAULT_PROD_SHEETS.roasting,
    title: 'Roasting Scolari 1',
    sheetName: 'Sheet56',
    tower: 'Non-Tower',
    flow: 'ROASTING',
  },
  roasting_scolari_2: {
    sheetId: DEFAULT_PROD_SHEETS.roasting,
    title: 'Roasting Scolari 2',
    sheetName: 'Sheet57',
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
    sheetId: DEFAULT_PROD_SHEETS.evaporation_t1,
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
    sheetId: DEFAULT_PROD_SHEETS.evaporation_t2,
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

const { fetchQcSheetBuffer } = require('../services/qcGoogleAuthService');
const { fetchProdSheetBuffer } = require('../services/prodGoogleAuthService');

function getExportUrl(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
}

function isQcSheet(sheetId) {
  return sheetId === DEFAULT_QC_SHEETS['1'] || sheetId === DEFAULT_QC_SHEETS['2'];
}

async function fetchGoogleSheetBuffer(sheetId, options = {}) {
  if (options.isQc || isQcSheet(sheetId)) {
    return fetchQcSheetBuffer(sheetId);
  }
  return fetchProdSheetBuffer(sheetId);
}

module.exports = {
  DEFAULT_QC_SHEETS,
  DEFAULT_PROD_SHEETS,
  GDRIVE_FOLDER_ID,
  QC_TABLES_BY_TOWER,
  PROD_TABLE_MAP,
  getSpreadsheetId,
  getTableSheetUrl,
  getExportUrl,
  isQcSheet,
  fetchGoogleSheetBuffer,
  fetchQcSheetBuffer,
  fetchProdSheetBuffer,
};
