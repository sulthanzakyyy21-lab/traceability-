/**
 * Helper utility to detect duplicates and support Smart UPSERT before database operations.
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
  const qualifiers = ['jam', 'waktu', 'start', 'shift', 'nomor box', 'box', 'perculator', 'percolator', 'start tank', 'masakan ke'];
  const qualifierCols = [];

  columns.forEach((col, idx) => {
    const lower = col.toLowerCase();
    if (['batch', 'no_batch', 'nomor batch', 'kode_batch', 'id_no'].some((k) => lower.includes(k))) {
      batchCols.push({ name: col, index: idx });
    }
    if (['tanggal', 'date', 'stamp', 'waktu'].some((k) => lower.includes(k))) {
      dateCols.push({ name: col, index: idx });
    }
    if (qualifiers.some((q) => lower === q || lower.startsWith(q))) {
      qualifierCols.push({ name: col, index: idx });
    }
  });

  const uniqueQualifiers = qualifierCols.filter(
    (q) => !batchCols.some((b) => b.index === q.index) && !dateCols.some((d) => d.index === q.index)
  );

  return { batchCols, dateCols, keyCols: [...dateCols, ...uniqueQualifiers, ...batchCols] };
}

function buildIdentityKey(keyCols, rowData) {
  if (!keyCols || keyCols.length === 0) return null;
  const isArr = Array.isArray(rowData);
  const parts = keyCols.map((k) => normalizeVal(isArr ? rowData[k.index] : rowData[k.name]));
  if (parts.every((p) => p === '')) return null;
  return parts.join('###');
}

async function fetchExistingRows(tableName, columns, incomingRows, pool) {
  const { batchCols, dateCols } = findBatchAndDateColumns(columns);
  let existingRows = [];

  try {
    if (batchCols.length > 0) {
      for (const bCol of batchCols) {
        const batchVals = [...new Set(incomingRows.map((r) => r[bCol.index]).filter((v) => v !== null && v !== undefined && String(v).trim() !== ''))];
        if (batchVals.length > 0) {
          const CHUNK = 500;
          for (let i = 0; i < batchVals.length; i += CHUNK) {
            const chunk = batchVals.slice(i, i + CHUNK);
            const placeholders = chunk.map(() => '?').join(', ');
            const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${bCol.name}\` IN (${placeholders})`, chunk);
            existingRows.push(...rows);
          }
        }
      }
      const rowsWithoutBatch = incomingRows.filter((r) => !batchCols.some((b) => r[b.index]));
      if (rowsWithoutBatch.length > 0 && dateCols.length > 0) {
        const dCol = dateCols[0];
        const dates = [...new Set(rowsWithoutBatch.map((r) => r[dCol.index]).filter((v) => v !== null && v !== undefined && String(v).trim() !== ''))];
        if (dates.length > 0) {
          const placeholders = dates.map(() => '?').join(', ');
          const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${dCol.name}\` IN (${placeholders})`, dates);
          existingRows.push(...rows);
        }
      }
    } else if (dateCols.length > 0) {
      const dCol = dateCols[0];
      const dates = [...new Set(incomingRows.map((r) => r[dCol.index]).filter((v) => v !== null && v !== undefined && String(v).trim() !== ''))];
      if (dates.length > 0) {
        const placeholders = dates.map(() => '?').join(', ');
        const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${dCol.name}\` IN (${placeholders})`, dates);
        existingRows.push(...rows);
      }
    } else {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` LIMIT 25000`);
      existingRows = rows;
    }
  } catch (err) {
    console.warn(`[DEDUP] Warning checking existing rows in ${tableName}:`, err.message);
  }

  return existingRows;
}

async function filterDuplicateRows(tableName, columns, incomingRows, pool) {
  if (!incomingRows || incomingRows.length === 0) {
    return { newRows: [], updateRows: [], duplicateCount: 0, totalIncoming: 0 };
  }

  const { keyCols } = findBatchAndDateColumns(columns);
  const existingRows = await fetchExistingRows(tableName, columns, incomingRows, pool);

  const existingFullSignatures = new Set();
  const existingByIdentity = new Map();

  for (const row of existingRows) {
    existingFullSignatures.add(buildSignature(columns, row));
    const idKey = buildIdentityKey(keyCols, row);
    if (idKey && !existingByIdentity.has(idKey)) {
      existingByIdentity.set(idKey, row);
    }
  }

  const newRows = [];
  const updateRows = [];
  let duplicateCount = 0;
  const seenIncoming = new Set();

  for (const row of incomingRows) {
    const fullSig = buildSignature(columns, row);
    if (existingFullSignatures.has(fullSig) || seenIncoming.has(fullSig)) {
      duplicateCount++;
      continue;
    }

    const idKey = buildIdentityKey(keyCols, row);
    if (idKey && existingByIdentity.has(idKey)) {
      const existingDbRow = existingByIdentity.get(idKey);
      const updates = {};
      let hasMeaningfulUpdate = false;

      columns.forEach((col, idx) => {
        const incomingVal = row[idx];
        const existingVal = existingDbRow[col];
        if (incomingVal !== null && incomingVal !== undefined && String(incomingVal).trim() !== '') {
          if (normalizeVal(incomingVal) !== normalizeVal(existingVal)) {
            updates[col] = incomingVal;
            hasMeaningfulUpdate = true;
          }
        }
      });

      if (hasMeaningfulUpdate && existingDbRow.id) {
        updateRows.push({ id: existingDbRow.id, updates });
        seenIncoming.add(fullSig);
        continue;
      }
    }

    seenIncoming.add(fullSig);
    newRows.push(row);
  }

  return {
    newRows,
    updateRows,
    duplicateCount,
    totalIncoming: incomingRows.length,
  };
}

module.exports = {
  normalizeVal,
  buildSignature,
  buildIdentityKey,
  findBatchAndDateColumns,
  filterDuplicateRows,
};
