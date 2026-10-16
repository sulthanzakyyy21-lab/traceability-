const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const pool = require('../db');
const { TABLE_COLUMNS_MAP, ALLOWED_TABLES } = require('../tableConfig');

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
    if (h === '00' && mi === '00' && s === '00') return `${y}-${mo}-${d}`;
    return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
  }

  return String(val).trim();
}

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
