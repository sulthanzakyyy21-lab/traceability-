/**
 * Helper utility to detect and reject duplicate rows before database insertion.
 */

function normalizeVal(val) {
  if (val === null || val === undefined) return '';
  let s = String(val).trim();
  if (s === '' || s === '-' || s === 'null' || s === 'undefined') return '';
  s = s.replace('T', ' ').replace(/\.000Z?$/, '');
  const numStr = s.replace(',', '.');
  if (/^-?\d+(\.\d+)?$/.test(numStr)) {
    const n = parseFloat(numStr);
    if (!isNaN(n)) return String(n);
  }
  return s.toLowerCase();
}

function buildSignature(columns, rowData) {
  if (Array.isArray(rowData)) {
    return columns.map((_, i) => normalizeVal(rowData[i])).join('|||');
  }
  return columns.map((c) => normalizeVal(rowData[c])).join('|||');
}

function findColumn(columns, candidates) {
  const lowerCols = columns.map((c) => c.toLowerCase());
  for (const cand of candidates) {
    const idx = lowerCols.indexOf(cand);
    if (idx !== -1) return { name: columns[idx], index: idx };
  }
  for (const cand of candidates) {
    const idx = lowerCols.findIndex((c) => c.includes(cand));
    if (idx !== -1) return { name: columns[idx], index: idx };
  }
  return null;
}

/**
 * Filter incoming rows to exclude duplicates already existing in database or within the file
 */
async function filterDuplicateRows(tableName, columns, incomingRows, pool) {
  if (!incomingRows || incomingRows.length === 0) {
    return { newRows: [], duplicateCount: 0, totalIncoming: 0 };
  }

  const batchInfo = findColumn(columns, ['batch', 'batch finished good', 'no batch']);
  const dateInfo = findColumn(columns, ['tanggal', 'tanggal analisa', 'date', 'stamp', 'waktu inload']);

  let existingRows = [];

  try {
    if (batchInfo) {
      const batchVals = [
        ...new Set(
          incomingRows
            .map((r) => r[batchInfo.index])
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
        ),
      ];

      if (batchVals.length > 0) {
        const BATCH_CHUNK = 500;
        for (let i = 0; i < batchVals.length; i += BATCH_CHUNK) {
          const chunk = batchVals.slice(i, i + BATCH_CHUNK);
          const placeholders = chunk.map(() => '?').join(', ');
          const [rows] = await pool.query(
            `SELECT * FROM \`${tableName}\` WHERE \`${batchInfo.name}\` IN (${placeholders})`,
            chunk
          );
          existingRows.push(...rows);
        }
      }

      // Check rows without batch using date if available
      const rowsWithoutBatch = incomingRows.filter((r) => !r[batchInfo.index]);
      if (rowsWithoutBatch.length > 0 && dateInfo) {
        const noBatchDates = [
          ...new Set(
            rowsWithoutBatch
              .map((r) => r[dateInfo.index])
              .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
          ),
        ];
        if (noBatchDates.length > 0) {
          const placeholders = noBatchDates.map(() => '?').join(', ');
          const [rows] = await pool.query(
            `SELECT * FROM \`${tableName}\` WHERE \`${dateInfo.name}\` IN (${placeholders})`,
            noBatchDates
          );
          existingRows.push(...rows);
        }
      }
    } else if (dateInfo) {
      const dateVals = [
        ...new Set(
          incomingRows
            .map((r) => r[dateInfo.index])
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
        ),
      ];
      if (dateVals.length > 0) {
        const placeholders = dateVals.map(() => '?').join(', ');
        const [rows] = await pool.query(
          `SELECT * FROM \`${tableName}\` WHERE \`${dateInfo.name}\` IN (${placeholders})`,
          dateVals
        );
        existingRows.push(...rows);
      }
    } else {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 10000`);
      existingRows = rows;
    }
  } catch (err) {
    console.warn(`[DEDUP] Warning checking existing rows in ${tableName}:`, err.message);
  }

  const existingSet = new Set();
  for (const row of existingRows) {
    existingSet.add(buildSignature(columns, row));
  }

  const newRows = [];
  let duplicateCount = 0;
  const seenIncoming = new Set();

  for (const row of incomingRows) {
    const sig = buildSignature(columns, row);
    if (existingSet.has(sig) || seenIncoming.has(sig)) {
      duplicateCount++;
    } else {
      seenIncoming.add(sig);
      newRows.push(row);
    }
  }

  return {
    newRows,
    duplicateCount,
    totalIncoming: incomingRows.length,
  };
}

module.exports = {
  normalizeVal,
  buildSignature,
  filterDuplicateRows,
};
