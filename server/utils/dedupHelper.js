/**
 * Helper utility to detect and reject duplicate rows before database insertion.
 */

function normalizeVal(val) {
  if (val === null || val === undefined) return '';
  if (val instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    const y = val.getFullYear();
    const mo = pad(val.getMonth() + 1);
    const d = pad(val.getDate());
    const h = val.getHours();
    const mi = val.getMinutes();
    const s = val.getSeconds();
    val = h === 0 && mi === 0 && s === 0 ? `${y}-${mo}-${d}` : `${y}-${mo}-${d} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  }
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

function findBatchAndDateColumns(columns) {
  const batchCols = [];
  const dateCols = [];

  columns.forEach((col, idx) => {
    const lower = col.toLowerCase();
    if (lower.includes('batch')) {
      batchCols.push({ name: col, index: idx });
    }
    if (['tanggal', 'date', 'stamp', 'waktu'].some((k) => lower.includes(k))) {
      dateCols.push({ name: col, index: idx });
    }
  });

  return { batchCols, dateCols };
}

async function filterDuplicateRows(tableName, columns, incomingRows, pool) {
  if (!incomingRows || incomingRows.length === 0) {
    return { newRows: [], duplicateCount: 0, totalIncoming: 0 };
  }

  const { batchCols, dateCols } = findBatchAndDateColumns(columns);
  let existingRows = [];

  try {
    if (batchCols.length > 0) {
      for (const bCol of batchCols) {
        const batchVals = [
          ...new Set(
            incomingRows
              .map((r) => r[bCol.index])
              .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
          ),
        ];

        if (batchVals.length > 0) {
          const CHUNK = 500;
          for (let i = 0; i < batchVals.length; i += CHUNK) {
            const chunk = batchVals.slice(i, i + CHUNK);
            const placeholders = chunk.map(() => '?').join(', ');
            const [rows] = await pool.query(
              `SELECT * FROM \`${tableName}\` WHERE \`${bCol.name}\` IN (${placeholders})`,
              chunk
            );
            existingRows.push(...rows);
          }
        }
      }

      // Check rows without any batch value using date columns
      const rowsWithoutBatch = incomingRows.filter((r) => !batchCols.some((b) => r[b.index]));
      if (rowsWithoutBatch.length > 0 && dateCols.length > 0) {
        const dCol = dateCols[0];
        const dates = [
          ...new Set(
            rowsWithoutBatch
              .map((r) => r[dCol.index])
              .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
          ),
        ];
        if (dates.length > 0) {
          const placeholders = dates.map(() => '?').join(', ');
          const [rows] = await pool.query(
            `SELECT * FROM \`${tableName}\` WHERE \`${dCol.name}\` IN (${placeholders})`,
            dates
          );
          existingRows.push(...rows);
        }
      }
    } else if (dateCols.length > 0) {
      const dCol = dateCols[0];
      const dates = [
        ...new Set(
          incomingRows
            .map((r) => r[dCol.index])
            .filter((v) => v !== null && v !== undefined && String(v).trim() !== '')
        ),
      ];
      if (dates.length > 0) {
        const placeholders = dates.map(() => '?').join(', ');
        const [rows] = await pool.query(
          `SELECT * FROM \`${tableName}\` WHERE \`${dCol.name}\` IN (${placeholders})`,
          dates
        );
        existingRows.push(...rows);
      }
    } else {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 25000`);
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
