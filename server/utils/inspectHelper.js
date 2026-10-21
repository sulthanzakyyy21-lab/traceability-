const xlsx = require('xlsx');
const { TABLE_COLUMNS_MAP, TABLE_METADATA } = require('../tableConfig');
const { normHeader, matchColumns1to1, scoreTableMatch } = require('./headerMatcher');

function excelValueToString(val) {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    let y = val.getFullYear();
    if (y > 2099 && String(y).startsWith('2020')) {
      y = parseInt(String(y).replace(/^2020/, '202'), 10);
    }
    const mo = pad(val.getMonth() + 1);
    const d = pad(val.getDate());
    const h = pad(val.getHours());
    const mi = pad(val.getMinutes());
    const s = pad(val.getSeconds());
    if (y === 1899 || y === 1900) return `${pad(h)}:${pad(mi)}:${pad(s)}`;
    if (h === 0 && mi === 0 && s === 0) return `${y}-${mo}-${d}`;
    return `${y}-${mo}-${d} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  }
  let str = String(val).trim();
  if (/^2020\d-/.test(str)) {
    str = str.replace(/^2020(\d)-/, '202$1-');
  }
  return str;
}

function findSheetAndColMapping(workbook, tableName, expectedCols) {
  let bestSheet = null;
  let bestHeaderRow = 0;
  let bestColMapping = [];
  let bestMatchCount = -1;
  const normExpected = expectedCols.map(normHeader);

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    if (!sheet || !sheet['!ref']) continue;
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const maxR = Math.min(range.e.r, range.s.r + 15);

    for (let R = range.s.r; R <= maxR; R++) {
      const fileHeaders = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
        fileHeaders.push({ col: C, norm: normHeader(cell ? String(cell.v).trim() : '') });
      }

      const normFile = fileHeaders.map((h) => h.norm);
      const { mapping, totalMatched } = matchColumns1to1(normExpected, normFile);

      // Translate file index back to absolute column C
      const colMapping = mapping.map((fIdx) => (fIdx !== -1 ? fileHeaders[fIdx].col : -1));

      if (totalMatched > bestMatchCount) {
        bestMatchCount = totalMatched;
        bestSheet = sheet;
        bestHeaderRow = R;
        bestColMapping = colMapping;
      }
    }
  }

  return { sheet: bestSheet, headerRow: bestHeaderRow, colMapping: bestColMapping, matchedCount: bestMatchCount };
}

function inspectExcelWorkbook(buffer, pic, tower) {
  const workbook = xlsx.read(buffer, { type: 'buffer', sheetRows: 40, cellDates: true, cellNF: false, cellText: false });
  const candidates = Object.values(TABLE_METADATA);
  const activePic = pic && pic !== 'Semua' ? String(pic).toLowerCase() : null;
  const activeTower = tower && tower !== 'Semua' && tower !== 'Non-Tower' && tower !== 'Non-Tower / Semua' ? String(tower).toLowerCase() : null;

  let best = { table: null, score: -999, sheetName: '', headerRow: 0, rawHeaders: [], totalRows: 0 };

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    if (!sheet || !sheet['!ref']) continue;
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const fullRange = sheet['!fullref'] ? xlsx.utils.decode_range(sheet['!fullref']) : range;
    const maxR = Math.min(range.e.r, range.s.r + 15);

    for (let R = range.s.r; R <= maxR; R++) {
      const headers = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
        headers.push(cell ? String(cell.v).trim() : '');
      }
      const normHeaders = headers.map(normHeader);
      if (normHeaders.filter(Boolean).length === 0) continue;

      for (const cand of candidates) {
        const expectedCols = TABLE_COLUMNS_MAP[cand.key] || [];
        const matchResult = scoreTableMatch(cand, expectedCols, normHeaders, sName, activePic, activeTower);

        if (matchResult.score > best.score) {
          best = {
            table: cand,
            score: matchResult.score,
            matchPercentage: matchResult.matchPercentage,
            matchedCount: matchResult.totalMatched,
            missingCount: matchResult.missingCount,
            sheetName: sName,
            headerRow: R,
            rawHeaders: headers,
            totalRows: Math.max(0, fullRange.e.r - R),
          };
        }
      }
    }
  }

  if (!best.table || best.score < 10) {
    return {
      detected: false,
      valid: false,
      message: 'Format file tidak cocok dengan data tabel manapun.',
      warning: 'Peringatan: Struktur kolom tidak dikenali. Pastikan file sesuai format template PIC Santos Jaya Abadi.',
      sheetName: workbook.SheetNames[0] || '',
      totalRows: 0,
      colCount: 0,
      headers: [],
    };
  }

  const expectedCols = TABLE_COLUMNS_MAP[best.table.key] || [];
  const normExpected = expectedCols.map(normHeader);
  const normHeaders = best.rawHeaders.map(normHeader);
  const { mapping } = matchColumns1to1(normExpected, normHeaders);

  const matchedCols = [];
  const missingCols = [];
  for (let i = 0; i < expectedCols.length; i++) {
    if (mapping[i] !== -1) matchedCols.push(expectedCols[i]);
    else missingCols.push(expectedCols[i]);
  }

  const matchPercentage = expectedCols.length > 0 ? Math.round((matchedCols.length / expectedCols.length) * 100) : 0;
  let warning = null;
  let isValid = true;

  if (matchPercentage < 40) {
    isValid = false;
    warning = `Peringatan: Kolom tidak cocok (${matchPercentage}% kesesuaian). ${missingCols.length} kolom wajib tidak ditemukan.`;
  } else if (missingCols.length > 0) {
    const sample = missingCols.slice(0, 4).join(', ');
    const more = missingCols.length > 4 ? ` (+${missingCols.length - 4} kolom lainnya)` : '';
    warning = `Peringatan: ${missingCols.length} kolom tidak ditemukan: ${sample}${more}`;
  }

  return {
    detected: true,
    valid: isValid,
    table: best.table.key,
    label: best.table.label,
    flow: best.table.flow,
    pic: best.table.pic,
    tower: best.table.tower,
    sheetName: best.sheetName,
    headerRow: best.headerRow,
    totalRows: best.totalRows,
    colCount: best.rawHeaders.length,
    expectedColCount: expectedCols.length,
    matchPercentage,
    matchedCount: matchedCols.length,
    missingCount: missingCols.length,
    missingColumns: missingCols.slice(0, 8),
    warning,
    score: best.score,
    message: isValid
      ? `Terdeteksi ${best.table.pic} (${best.table.tower}) - ${best.table.label} [${matchPercentage}% cocok]`
      : `Format kolom tidak sesuai dengan ${best.table.label} (${matchPercentage}% cocok)`,
  };
}

module.exports = {
  excelValueToString,
  inspectExcelWorkbook,
  findSheetAndColMapping,
  normHeader,
};
