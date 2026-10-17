const xlsx = require('xlsx');
const pool = require('../db');
const { TABLE_COLUMNS_MAP, TABLE_METADATA } = require('../tableConfig');
const { filterDuplicateRows } = require('../utils/dedupHelper');

const { excelValueToString, inspectExcelWorkbook, findSheetAndColMapping } = require('../utils/inspectHelper');

async function bulkInsertExcelData(tableName, buffer) {
  const columns = TABLE_COLUMNS_MAP[tableName];
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
  const { sheet, headerRow, colMapping } = findSheetAndColMapping(workbook, tableName, columns);

  if (!sheet || !sheet['!ref']) {
    return { imported: 0, duplicates: 0, message: 'Sheet atau kolom tabel tidak ditemukan dalam file.' };
  }

  const range = xlsx.utils.decode_range(sheet['!ref']);
  if (range.e.r <= headerRow) {
    return { imported: 0, duplicates: 0, message: 'File hanya memiliki baris header tanpa data.' };
  }

  const isPacking = tableName.startsWith('packing_');
  const incomingRows = [];

  for (let R = headerRow + 1; R <= range.e.r; R++) {
    let hasData = false;
    const rowVals = columns.map((_, colIdx) => {
      const fileCol = colMapping[colIdx];
      if (fileCol === -1 || fileCol === undefined) return null;
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: fileCol })];
      const val = cell ? excelValueToString(cell.v) : null;
      if (val !== null && val !== '') hasData = true;
      return val;
    });

    if (!hasData) continue;

    if (isPacking) {
      const parsedBatch = parseInt(rowVals[6]);
      if (isNaN(parsedBatch) && !rowVals[8] && !rowVals[3]) continue;
      rowVals[6] = !isNaN(parsedBatch) ? parsedBatch : null;
      rowVals[7] = rowVals[7] && !isNaN(parseInt(rowVals[7])) ? parseInt(rowVals[7]) : null;
      for (let c = 9; c <= 16; c++) {
        const p = parseFloat(String(rowVals[c]).replace(',', '.'));
        rowVals[c] = !isNaN(p) ? p : 0;
      }
    }

    incomingRows.push(rowVals);
  }

  if (incomingRows.length === 0) {
    return { imported: 0, duplicates: 0, table: tableName, message: 'Tidak ada baris data valid untuk diimpor.' };
  }

  // Deduplikasi terhadap database dan baris ganda di file
  const { newRows, duplicateCount } = await filterDuplicateRows(tableName, columns, incomingRows, pool);

  if (newRows.length === 0) {
    return {
      imported: 0,
      duplicates: duplicateCount,
      table: tableName,
      message: `Semua ${duplicateCount.toLocaleString()} baris data sudah ada di database (duplikat ditolak). Tidak ada data baru yang diimpor.`,
    };
  }

  const CHUNK_SIZE = 500;
  const escapedCols = columns.map((c) => `\`${c}\``).join(', ');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    for (let i = 0; i < newRows.length; i += CHUNK_SIZE) {
      const chunk = newRows.slice(i, i + CHUNK_SIZE);
      const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;
      const allPlaceholders = chunk.map(() => rowPlaceholders).join(', ');
      await conn.execute(`INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${allPlaceholders}`, chunk.flat());
    }

    await conn.commit();

    const msg = duplicateCount > 0
      ? `Berhasil: ${newRows.length.toLocaleString()} baris baru diimpor. ${duplicateCount.toLocaleString()} baris duplikat ditolak.`
      : `Berhasil: ${newRows.length.toLocaleString()} baris diimpor ke tabel ${tableName}.`;

    return {
      imported: newRows.length,
      duplicates: duplicateCount,
      table: tableName,
      message: msg,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  excelValueToString,
  inspectExcelWorkbook,
  bulkInsertExcelData,
};

