const xlsx = require('xlsx');
const pool = require('../db');
const { TABLE_COLUMNS_MAP, TABLE_METADATA } = require('../tableConfig');

function excelValueToString(val) {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    const y = val.getFullYear();
    const mo = pad(val.getMonth() + 1);
    const d = pad(val.getDate());
    const h = pad(val.getHours());
    const mi = pad(val.getMinutes());
    const s = pad(val.getSeconds());
    if (y === 1899 || y === 1900) return `${pad(h)}:${pad(mi)}:${pad(s)}`;
    if (h === 0 && mi === 0 && s === 0) return `${y}-${mo}-${d}`;
    return `${y}-${mo}-${d} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  }
  return String(val).trim();
}

function inspectExcelWorkbook(buffer, pic, tower) {
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet['!ref']) throw new Error('Sheet pertama kosong.');

  const range = xlsx.utils.decode_range(sheet['!ref']);
  const totalSheetRows = range.e.r - range.s.r + 1;
  const headerCols = [];

  for (let C = range.s.c; C <= range.e.c; C++) {
    const cellAddr = xlsx.utils.encode_cell({ r: range.s.r, c: C });
    const cell = sheet[cellAddr];
    headerCols.push(cell ? String(cell.v).toLowerCase().trim() : '');
  }

  const sheetLower = String(sheetName).toLowerCase();
  const headersCombined = headerCols.join(' ');

  let candidates = Object.values(TABLE_METADATA);
  if (pic) candidates = candidates.filter((t) => t.pic.toLowerCase() === String(pic).toLowerCase());
  if (tower && tower !== 'Semua' && tower !== 'Non-Tower') {
    const towerNorm = String(tower).toLowerCase();
    candidates = candidates.filter((t) => t.tower.toLowerCase() === towerNorm || t.tower === 'Non-Tower');
  }

  let bestTable = null;
  let bestScore = -1;

  for (const cand of candidates) {
    let score = 0;
    if (cand.sheetKeyword && sheetLower.includes(cand.sheetKeyword)) score += 5;
    if (cand.tower === 'Tower 1' && (sheetLower.includes('t1') || sheetLower.includes('tower 1') || headersCombined.includes('sapuan'))) score += 3;
    if (cand.tower === 'Tower 2' && (sheetLower.includes('t2') || sheetLower.includes('tower 2') || headersCombined.includes('over size'))) score += 3;
    for (const kw of cand.keywords) {
      if (headersCombined.includes(kw.toLowerCase())) score += 2;
    }
    const expectedCols = TABLE_COLUMNS_MAP[cand.key] || [];
    if (expectedCols.length > 0 && Math.abs(expectedCols.length - headerCols.length) <= 2) score += 3;

    if (score > bestScore) {
      bestScore = score;
      bestTable = cand;
    }
  }

  if (!bestTable || bestScore <= 1) {
    return {
      detected: false,
      message: 'Format file tidak cocok dengan data tabel manapun untuk PIC ' + (pic || 'terpilih') + '.',
      sheetName,
      totalRows: totalSheetRows - 1,
      colCount: headerCols.length,
    };
  }

  return {
    detected: true,
    table: bestTable.key,
    label: bestTable.label,
    flow: bestTable.flow,
    pic: bestTable.pic,
    tower: bestTable.tower,
    sheetName,
    totalRows: totalSheetRows - 1,
    colCount: headerCols.length,
    score: bestScore,
    message: `Terdeteksi Flow ${bestTable.flow} (${bestTable.label})`,
  };
}

async function bulkInsertExcelData(tableName, buffer) {
  const columns = TABLE_COLUMNS_MAP[tableName];
  const colCount = columns.length;
  const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet['!ref']) return { imported: 0, message: 'Sheet kosong.' };

  const range = xlsx.utils.decode_range(sheet['!ref']);
  const totalSheetRows = range.e.r - range.s.r + 1;
  if (totalSheetRows < 2) return { imported: 0, message: 'File hanya memiliki baris header.' };

  const CHUNK_SIZE = 500;
  const escapedCols = columns.map((c) => `\`${c}\``).join(', ');
  const conn = await pool.getConnection();
  let importedCount = 0;

  try {
    await conn.beginTransaction();
    let chunk = [];

    const flushChunk = async () => {
      if (chunk.length === 0) return;
      const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;
      const allPlaceholders = chunk.map(() => rowPlaceholders).join(', ');
      await conn.execute(`INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${allPlaceholders}`, chunk.flat());
      importedCount += chunk.length;
      chunk = [];
    };

    const isPacking = tableName.startsWith('packing_');

    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      const rowVals = [];
      let hasData = false;

      for (let C = 0; C < colCount; C++) {
        const cellAddr = xlsx.utils.encode_cell({ r: R, c: range.s.c + C });
        const cell = sheet[cellAddr];
        const val = cell ? excelValueToString(cell.v) : null;
        if (val !== null && val !== '') hasData = true;
        rowVals.push(val);
      }

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

      chunk.push(rowVals);
      if (chunk.length >= CHUNK_SIZE) await flushChunk();
    }

    await flushChunk();
    await conn.commit();
    return {
      imported: importedCount,
      table: tableName,
      message: `Berhasil: ${importedCount.toLocaleString()} baris diimpor dari ${totalSheetRows - 1} baris di sheet.`,
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
