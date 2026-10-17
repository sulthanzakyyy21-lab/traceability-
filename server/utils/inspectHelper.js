const xlsx = require('xlsx');
const { TABLE_COLUMNS_MAP, TABLE_METADATA } = require('../tableConfig');

function normHeader(h) {
  if (!h) return '';
  return String(h)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[°%()\/_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

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

function findSheetAndColMapping(workbook, tableName, expectedCols) {
  let bestSheet = null;
  let bestHeaderRow = 0;
  let bestColMapping = [];
  let bestMatchCount = -1;

  for (const sName of workbook.SheetNames.slice(0, 5)) {
    const sheet = workbook.Sheets[sName];
    if (!sheet || !sheet['!ref']) continue;
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const maxR = Math.min(range.e.r, range.s.r + 10);

    for (let R = range.s.r; R <= maxR; R++) {
      const fileHeaders = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
        fileHeaders.push({ col: C, text: cell ? String(cell.v).trim() : '' });
      }

      const mapping = expectedCols.map((exp) => {
        const expNorm = normHeader(exp);
        const match = fileHeaders.find((fh) => {
          const fNorm = normHeader(fh.text);
          return fNorm === expNorm || (fNorm.length > 3 && (expNorm.includes(fNorm) || fNorm.includes(expNorm)));
        });
        return match ? match.col : -1;
      });

      const matchedCount = mapping.filter((c) => c !== -1).length;
      if (matchedCount > bestMatchCount) {
        bestMatchCount = matchedCount;
        bestSheet = sheet;
        bestHeaderRow = R;
        bestColMapping = mapping;
      }
    }
  }

  return { sheet: bestSheet, headerRow: bestHeaderRow, colMapping: bestColMapping, matchedCount: bestMatchCount };
}

function inspectExcelWorkbook(buffer, pic, tower) {
  const workbook = xlsx.read(buffer, { type: 'buffer', sheetRows: 30, cellDates: true, cellNF: false, cellText: false });
  const candidates = Object.values(TABLE_METADATA);
  const activePic = pic && pic !== 'Semua' ? String(pic).toLowerCase() : null;
  const activeTower = tower && tower !== 'Semua' && tower !== 'Non-Tower' && tower !== 'Non-Tower / Semua' ? String(tower).toLowerCase() : null;

  let best = { table: null, score: -1, sheetName: '', headerRow: 0, rawHeaders: [], totalRows: 0 };

  for (const sName of workbook.SheetNames.slice(0, 5)) {
    const sheet = workbook.Sheets[sName];
    if (!sheet || !sheet['!ref']) continue;
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const fullRange = sheet['!fullref'] ? xlsx.utils.decode_range(sheet['!fullref']) : range;
    const sheetLower = sName.toLowerCase();
    const maxR = Math.min(range.e.r, range.s.r + 10);

    for (let R = range.s.r; R <= maxR; R++) {
      const headers = [];
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = sheet[xlsx.utils.encode_cell({ r: R, c: C })];
        headers.push(cell ? String(cell.v).trim() : '');
      }
      const normHeaders = headers.map(normHeader);
      const combined = normHeaders.join(' ');

      for (const cand of candidates) {
        let score = 0;
        if (cand.sheetKeyword && sheetLower.includes(cand.sheetKeyword)) score += 6;
        if (cand.tower === 'Tower 1' && (sheetLower.includes('t1') || sheetLower.includes('tower 1') || combined.includes('sapuan'))) score += 3;
        if (cand.tower === 'Tower 2' && (sheetLower.includes('t2') || sheetLower.includes('tower 2') || combined.includes('over size'))) score += 3;
        if (activePic && cand.pic.toLowerCase() === activePic) score += 2;
        if (activeTower && cand.tower.toLowerCase() === activeTower) score += 2;

        const expectedCols = TABLE_COLUMNS_MAP[cand.key] || [];
        let matched = 0;
        for (const exp of expectedCols) {
          const expNorm = normHeader(exp);
          if (normHeaders.some((h) => h === expNorm || (h.length > 3 && (expNorm.includes(h) || h.includes(expNorm))))) {
            matched++;
          }
        }
        score += matched * 3;

        if (score > best.score) {
          best = { table: cand, score, sheetName: sName, headerRow: R, rawHeaders: headers, totalRows: Math.max(0, fullRange.e.r - R) };
        }
      }
    }
  }

  if (!best.table || best.score < 8) {
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
  const normHeaders = best.rawHeaders.map(normHeader);
  const matchedCols = [];
  const missingCols = [];

  for (const exp of expectedCols) {
    const expNorm = normHeader(exp);
    const found = normHeaders.some((h) => h === expNorm || (h.length > 3 && (expNorm.includes(h) || h.includes(expNorm))));
    if (found) matchedCols.push(exp);
    else missingCols.push(exp);
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
