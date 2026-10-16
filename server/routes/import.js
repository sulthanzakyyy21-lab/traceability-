const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const pool = require('../db');
const { TABLE_COLUMNS_MAP, ALLOWED_TABLES, TABLE_METADATA } = require('../tableConfig');

// Memory storage for uploaded files
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

/**
 * Convert Excel cell value to a storable string
 */
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
    // Time-only stored in Excel as year 1899 or 1900
    if (y === 1899 || y === 1900) {
      return `${pad(h)}:${pad(mi)}:${pad(s)}`;
    }
    if (h === 0 && mi === 0 && s === 0) return `${y}-${mo}-${d}`;
    return `${y}-${mo}-${d} ${pad(h)}:${pad(mi)}:${pad(s)}`;
  }

  return String(val).trim();
}

/**
 * POST /api/import/inspect
 * Inspect an uploaded Excel file and auto-detect target table based on:
 * - pic (req.body.pic)
 * - tower (req.body.tower, optional)
 * - header column names & sheet name matching TABLE_METADATA
 */
router.post('/inspect', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    }

    const { pic, tower } = req.body;

    const workbook = xlsx.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) {
      return res.status(400).json({ error: 'Sheet pertama kosong.' });
    }

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
    if (pic) {
      candidates = candidates.filter(t => t.pic.toLowerCase() === String(pic).toLowerCase());
    }

    if (tower && tower !== 'Semua' && tower !== 'Non-Tower') {
      const towerNorm = String(tower).toLowerCase();
      candidates = candidates.filter(t => t.tower.toLowerCase() === towerNorm || t.tower === 'Non-Tower');
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
      return res.status(200).json({
        detected: false,
        message: 'Format file tidak cocok dengan data tabel manapun untuk PIC ' + (pic || 'terpilih') + '.',
        sheetName,
        totalRows: totalSheetRows - 1,
        colCount: headerCols.length,
      });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('Inspect error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/import/:tableName
 * Accepts a .xlsx file and bulk-inserts ALL rows (no 1000-row cap).
 * Uses true multi-value bulk INSERT per chunk of 500 rows for performance.
 */
router.post('/:tableName', upload.single('file'), async (req, res) => {
  try {
    const { tableName } = req.params;

    if (!ALLOWED_TABLES.includes(tableName)) {
      return res.status(400).json({ error: `Table "${tableName}" not allowed.` });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const columns = TABLE_COLUMNS_MAP[tableName];
    const colCount = columns.length;

    // Parse workbook from buffer
    const workbook = xlsx.read(req.file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: false,
      cellText: false,
    });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet['!ref']) {
      return res.status(200).json({ imported: 0, message: 'Sheet kosong.' });
    }

    const range = xlsx.utils.decode_range(sheet['!ref']);
    const totalSheetRows = range.e.r - range.s.r + 1;

    if (totalSheetRows < 2) {
      return res.status(200).json({ imported: 0, message: 'File hanya memiliki baris header.' });
    }

    // ── Collect all data rows (skip row 0 = header) ──────────────
    const CHUNK_SIZE = 500; // rows per bulk INSERT
    const escapedCols = columns.map(c => `\`${c}\``).join(', ');

    const conn = await pool.getConnection();
    let importedCount = 0;

    try {
      await conn.beginTransaction();

      let chunk = [];

      const flushChunk = async () => {
        if (chunk.length === 0) return;
        // Build multi-value INSERT: INSERT INTO t (c1,c2,...) VALUES (?,?,...),(?,?,...)
        const rowPlaceholders = `(${columns.map(() => '?').join(', ')})`;
        const allPlaceholders = chunk.map(() => rowPlaceholders).join(', ');
        const flatValues = chunk.flat();
        await conn.execute(
          `INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${allPlaceholders}`,
          flatValues
        );
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

        if (!hasData) continue; // skip fully empty rows

        if (isPacking) {
          const parsedBatch = parseInt(rowVals[6]);
          // Skip header repeats, notes like "Packing Off", and blank trailing rows
          if (isNaN(parsedBatch) && !rowVals[8] && !rowVals[3]) continue;

          rowVals[6] = !isNaN(parsedBatch) ? parsedBatch : null;
          rowVals[7] = rowVals[7] && !isNaN(parseInt(rowVals[7])) ? parseInt(rowVals[7]) : null;

          // Sanitize stamp
          if (rowVals[0]) {
            const d = new Date(rowVals[0]);
            if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 1970) {
              rowVals[0] = null;
            }
          }

          // Sanitize tanggal
          if (rowVals[1]) {
            const d = new Date(rowVals[1]);
            if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 1970) {
              rowVals[1] = null;
            } else {
              const pad = (n) => String(n).padStart(2, '0');
              rowVals[1] = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            }
          }

          // Box & Waste cols: index 9 to 16
          for (let c = 9; c <= 16; c++) {
            const p = parseFloat(String(rowVals[c]).replace(',', '.'));
            rowVals[c] = !isNaN(p) ? p : 0;
          }

          // Environmental measurements: index 18 to 22 (temp, rh, bibir karton)
          for (let c = 18; c <= 22; c++) {
            const p = parseFloat(String(rowVals[c]).replace(',', '.'));
            rowVals[c] = !isNaN(p) ? p : null;
          }
        }

        chunk.push(rowVals);

        if (chunk.length >= CHUNK_SIZE) {
          await flushChunk();
        }
      }

      await flushChunk(); // flush remaining rows
      await conn.commit();

      res.json({
        imported: importedCount,
        table: tableName,
        message: `Berhasil: ${importedCount.toLocaleString()} baris diimpor dari ${totalSheetRows - 1} baris di sheet.`,
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/import/:tableName  — Truncate table
 */
router.delete('/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    if (!ALLOWED_TABLES.includes(tableName)) {
      return res.status(400).json({ error: `Table "${tableName}" not allowed.` });
    }
    await pool.execute(`TRUNCATE TABLE \`${tableName}\``);
    res.json({ message: `Tabel ${tableName} berhasil dikosongkan.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/import/:tableName/count
 */
router.get('/:tableName/count', async (req, res) => {
  try {
    const { tableName } = req.params;
    if (!ALLOWED_TABLES.includes(tableName)) {
      return res.status(400).json({ error: `Table "${tableName}" not allowed.` });
    }
    const [rows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
    res.json({ table: tableName, count: rows[0].cnt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
