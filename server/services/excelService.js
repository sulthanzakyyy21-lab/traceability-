const xlsx = require('xlsx');
const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { excelValueToString, findSheetAndColMapping } = require('../utils/inspectHelper');

function sanitizePackingRow(rowVals) {
  const parsedBatch = parseInt(rowVals[6]);
  if (isNaN(parsedBatch) && !rowVals[8] && !rowVals[3]) return null;
  rowVals[6] = !isNaN(parsedBatch) ? parsedBatch : null;
  rowVals[7] = rowVals[7] && !isNaN(parseInt(rowVals[7])) ? parseInt(rowVals[7]) : null;
  for (let c = 9; c <= 16; c++) {
    const p = parseFloat(String(rowVals[c]).replace(',', '.'));
    rowVals[c] = !isNaN(p) ? p : 0;
  }
  for (let c = 18; c <= 22; c++) {
    if (rowVals[c] !== null && rowVals[c] !== undefined) {
      const clean = String(rowVals[c]).replace(',', '.').replace(/[^0-9.-]/g, '');
      const p = parseFloat(clean);
      rowVals[c] = !isNaN(p) ? p : null;
    } else {
      rowVals[c] = null;
    }
  }
  return rowVals;
}

function isMeaningfulRow(rowVals) {
  let meaningful = 0;
  for (const v of rowVals) {
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (
      s === '' ||
      s === '0' ||
      s === '00:00:00' ||
      s.startsWith('1899') ||
      s.startsWith('1900') ||
      s.startsWith('30/12/1899') ||
      s.startsWith('12/30/1899')
    ) {
      continue;
    }
    meaningful++;
  }
  return meaningful >= 3; // Naikkan threshold: min 3 kolom berisi data bermakna
}

function excelCellToString(cell) {
  if (!cell) return null;
  if (cell.w && typeof cell.w === 'string' && cell.w.trim() !== '') {
    const w = cell.w.trim();
    if (w === '1/0/00' || w === '0/0/00' || w.includes('/00/') || w.startsWith('0000-00-00')) {
      return null;
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(w)) {
      const tp = w.split(':');
      return `${tp[0].padStart(2, '0')}:${tp[1].padStart(2, '0')}:${(tp[2] || '00').padStart(2, '0')}`;
    }
    const parsed = excelValueToString(w);
    if (parsed) return parsed;
  }
  return excelValueToString(cell.v);
}

async function bulkInsertExcelData(tableName, bufferOrWorkbook, customSheetName) {
  const columns = TABLE_COLUMNS_MAP[tableName];
  const workbook = bufferOrWorkbook && bufferOrWorkbook.SheetNames
    ? bufferOrWorkbook
    : xlsx.read(bufferOrWorkbook, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
  const { sheet, headerRow, colMapping } = findSheetAndColMapping(workbook, tableName, columns, customSheetName);

  if (!sheet || !sheet['!ref']) {
    return { imported: 0, duplicates: 0, message: 'Sheet atau kolom tabel tidak ditemukan dalam file.' };
  }

  const range = xlsx.utils.decode_range(sheet['!ref']);
  if (range.e.r <= headerRow) {
    return { imported: 0, duplicates: 0, message: 'File hanya memiliki baris header tanpa data.' };
  }

  // Baca seluruh baris dari headerRow + 1 sampai baris akhir data (jangan diskip agar data real-time lengkap)
  const startRow = headerRow + 1;
  const isPacking = tableName.startsWith('packing_');
  const isExtraction = tableName.startsWith('extraction_');
  const incomingRows = [];

  for (let R = startRow; R <= range.e.r; R++) {
    let hasData = false;
    let rowVals = columns.map((_, colIdx) => {
      const fileCol = colMapping[colIdx];
      if (fileCol === -1 || fileCol === undefined) return null;
      const cell = sheet[xlsx.utils.encode_cell({ r: R, c: fileCol })];
      const val = cell ? excelCellToString(cell) : null;
      if (val !== null && val !== '') hasData = true;
      return val;
    });

    rowVals = rowVals.map((val, idx) => {
      const colName = columns[idx]?.toLowerCase();
      if (colName === 'stamp') {
        if (!val || /^\d{1,2}:\d{2}(:\d{2})?$/.test(String(val)) || String(val).startsWith('1899')) {
          return null;
        }
      }
      if (typeof val === 'string') {
        if (/^\d{4}-00(-00)?/.test(val) || /-00-/.test(val) || val.endsWith('-00') || val.startsWith('0000-00-00')) {
          return null;
        }
      }
      return val;
    });

    if (!hasData || !isMeaningfulRow(rowVals)) continue;
    if (isExtraction && (!rowVals[0] || String(rowVals[0]).trim() === '')) continue;
    if (isPacking) {
      rowVals = sanitizePackingRow(rowVals);
      if (!rowVals) continue;
      // Validasi: packing harus punya batch (kolom index 6)
      const batchVal = rowVals[6];
      if (batchVal === null || batchVal === undefined || String(batchVal).trim() === '') continue;
    }
    incomingRows.push(rowVals);
  }

  if (incomingRows.length === 0) {
    return { imported: 0, duplicates: 0, table: tableName, message: 'Data sudah paling mutakhir di database.' };
  }

  const escapedCols = columns.map((c) => `\`${c}\``).join(', ');
  const nonKeys = columns.filter((c) => c !== 'id' && c !== 'ID_No');
  const onDupClause = nonKeys.map((c) => `\`${c}\` = COALESCE(VALUES(\`${c}\`), \`${c}\`)`).join(', ');

  const CHUNK_SIZE = 500;
  const conn = await pool.getConnection();
  let totalAffected = 0;

  try {
    await conn.beginTransaction();
    for (let i = 0; i < incomingRows.length; i += CHUNK_SIZE) {
      const chunk = incomingRows.slice(i, i + CHUNK_SIZE);
      const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;
      const allPlaceholders = chunk.map(() => rowPlaceholders).join(', ');
      const sql = `INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${allPlaceholders} ON DUPLICATE KEY UPDATE ${onDupClause}`;
      const [res] = await conn.execute(sql, chunk.flat());
      totalAffected += res.affectedRows || 0;
    }
    await conn.commit();

    const msg = `Berhasil: ${incomingRows.length.toLocaleString()} baris data diproses dengan sistem Native UPSERT (${totalAffected} rekaman diperbarui/ditambahkan).`;

    return {
      imported: incomingRows.length,
      updated: totalAffected,
      duplicates: 0,
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
  bulkInsertExcelData,
};
