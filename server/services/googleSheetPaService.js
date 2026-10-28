const crypto = require('crypto');
const xlsx = require('xlsx');
const pool = require('../db');
const { bulkInsertExcelData } = require('./excelService');
const { DEFAULT_PA_SHEET_ID, PA_TABLE_METADATA, fetchGoogleSheetBuffer } = require('../config/sheetConfig');

async function syncAllPaTables(options = {}) {
  const { tower = 'all', force = false, customSheetId = null } = options;
  const targetId = customSheetId || DEFAULT_PA_SHEET_ID;

  const targetTables = Object.keys(PA_TABLE_METADATA).filter(tbl => {
    if (tower === 'all' || tower === 'both') return true;
    const meta = PA_TABLE_METADATA[tbl];
    if (tower === '1' && meta.tower === 'Tower 1') return true;
    if (tower === '2' && meta.tower === 'Tower 2') return true;
    return false;
  });

  const buffer = await fetchGoogleSheetBuffer(targetId, { isQc: true });
  const wb = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });

  const results = [];
  let totalImported = 0;
  let totalDuplicates = 0;

  for (const tbl of targetTables) {
    const meta = PA_TABLE_METADATA[tbl];
    try {
      const res = await bulkInsertExcelData(tbl, wb, meta.sheetName);
      results.push({
        table: tbl,
        label: meta.label,
        tower: meta.tower,
        sheetName: meta.sheetName,
        imported: res.imported || 0,
        duplicates: res.duplicates || 0,
        message: res.message || 'OK',
        success: true,
      });
      totalImported += res.imported || 0;
      totalDuplicates += res.duplicates || 0;
    } catch (err) {
      results.push({
        table: tbl,
        label: meta.label,
        tower: meta.tower,
        sheetName: meta.sheetName,
        imported: 0,
        duplicates: 0,
        message: err.message,
        success: false,
      });
    }
  }

  return {
    division: 'pa',
    sheetId: targetId,
    totalTables: targetTables.length,
    imported: totalImported,
    duplicates: totalDuplicates,
    results,
    success: results.some(r => r.success),
  };
}

module.exports = {
  syncAllPaTables,
};
