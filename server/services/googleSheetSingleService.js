const crypto = require('crypto');
const pool = require('../db');
const { bulkInsertExcelData } = require('./excelService');
const {
  PROD_TABLE_MAP, PA_TABLE_METADATA, DEFAULT_PA_SHEET_ID,
  getSpreadsheetId, fetchGoogleSheetBuffer,
} = require('../config/sheetConfig');

async function syncSingleTable(tableName, customSheetId, force = false, sheetBufferHashes = {}) {
  const isProd = Boolean(PROD_TABLE_MAP[tableName]);
  const isPa = Boolean(PA_TABLE_METADATA[tableName]);

  let targetId = customSheetId;
  let label = tableName;
  let pic = 'QC';
  let tower = 'Tower 1';
  let sheetName = null;

  if (isProd) {
    targetId = targetId || PROD_TABLE_MAP[tableName].sheetId;
    label = PROD_TABLE_MAP[tableName].title;
    pic = 'Produksi';
    tower = PROD_TABLE_MAP[tableName].tower;
    sheetName = PROD_TABLE_MAP[tableName].sheetName;
  } else if (isPa) {
    targetId = targetId || DEFAULT_PA_SHEET_ID;
    label = PA_TABLE_METADATA[tableName].title;
    pic = 'PA';
    tower = PA_TABLE_METADATA[tableName].tower;
    sheetName = PA_TABLE_METADATA[tableName].sheetName;
  } else {
    targetId = targetId || (tableName.endsWith('_t2') ? getSpreadsheetId('2') : getSpreadsheetId('1'));
    tower = tableName.endsWith('_t2') ? 'Tower 2' : 'Tower 1';
  }

  const [cntRows] = await pool.query(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
  const isDbEmpty = cntRows.length === 0;

  const buffer = await fetchGoogleSheetBuffer(targetId, { isQc: pic === 'QC' || pic === 'PA' });
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  const cacheKey = `${targetId}:${tableName}`;
  const unchanged = !force && !isDbEmpty && sheetBufferHashes[cacheKey] === hash;
  sheetBufferHashes[cacheKey] = hash;

  const res = unchanged
    ? { imported: 0, duplicates: 0, message: 'Data tabel mutakhir (tidak ada perubahan).' }
    : await bulkInsertExcelData(tableName, buffer, sheetName);

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

module.exports = {
  syncSingleTable,
};
