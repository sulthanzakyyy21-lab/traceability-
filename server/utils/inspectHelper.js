const xlsx = require('xlsx');
const { TABLE_COLUMNS_MAP, TABLE_METADATA } = require('../tableConfig');
const { normHeader, matchColumns1to1, scoreTableMatch } = require('./headerMatcher');

function excelValueToString(val) {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    let y = val.getFullYear();
    if (y === 1899 || y === 1900) return `${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}`;
    if (y > 2099) {
      const match = String(y).match(/(20[2-3][0-9])/);
      y = match ? parseInt(match[1], 10) : new Date().getFullYear();
    } else if (y < 2000 || y > 2099) y = new Date().getFullYear();
    const mo = pad(val.getMonth() + 1), d = pad(val.getDate());
    const h = pad(val.getHours()), mi = pad(val.getMinutes()), s = pad(val.getSeconds());
    return (h === '00' && mi === '00' && s === '00') ? `${y}-${mo}-${d}` : `${y}-${mo}-${d} ${h}:${mi}:${s}`;
  }

  let str = String(val).trim();
  if (str === '' || str === '1/0/00' || str === '0/0/00' || str.includes('/00/') || str.startsWith('0000-00-00') || str.endsWith('-00')) {
    return null;
  }

  const dateMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(.*)$/);
  if (dateMatch) {
    let p1 = parseInt(dateMatch[1], 10), p2 = parseInt(dateMatch[2], 10), yr = parseInt(dateMatch[3], 10);
    const rest = dateMatch[4] ? dateMatch[4].trim() : '';
    if (yr < 100) yr = 2000 + yr;
    if (yr < 2000 || yr > 2099) yr = new Date().getFullYear();
    const month = (p1 > 12 && p2 <= 12) ? p2 : p1;
    const day = (p1 > 12 && p2 <= 12) ? p1 : p2;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const pad = (n) => String(n).padStart(2, '0');
      const datePart = `${yr}-${pad(month)}-${pad(day)}`;
      return rest ? `${datePart} ${rest}` : datePart;
    }
  }

  if (/^2020\d-/.test(str)) str = str.replace(/^2020(\d)-/, '202$1-');
  return str;
}

function findSheetAndColMapping(workbook, tableName, expectedCols, targetSheetName) {
  let bestSheet = null;
  let bestHeaderRow = 0;
  let bestColMapping = [];
  let bestMatchCount = -1;
  const normExpected = expectedCols.map(normHeader);

  const preferredSheet = targetSheetName || TABLE_METADATA[tableName]?.targetSheet;
  let candidateSheets = workbook.SheetNames;
  if (preferredSheet && workbook.SheetNames.includes(preferredSheet)) {
    candidateSheets = [preferredSheet];
  } else if (preferredSheet) {
    const found = workbook.SheetNames.find(s => s.toLowerCase().trim() === preferredSheet.toLowerCase().trim())
      || workbook.SheetNames.find(s => s.toLowerCase().includes(preferredSheet.toLowerCase()));
    if (found) candidateSheets = [found];
  }

  for (const sName of candidateSheets) {
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
    detected: true, valid: isValid, table: best.table.key, label: best.table.label,
    flow: best.table.flow, pic: best.table.pic, tower: best.table.tower,
    sheetName: best.sheetName, headerRow: best.headerRow, totalRows: best.totalRows,
    colCount: best.rawHeaders.length, expectedColCount: expectedCols.length,
    matchPercentage, matchedCount: matchedCols.length, missingCount: missingCols.length,
    missingColumns: missingCols.slice(0, 8), warning, score: best.score,
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
