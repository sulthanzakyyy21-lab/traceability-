const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { TableNameParamSchema, PicRowsQuerySchema, InspectBodySchema } = require('../schemas/importSchema');
const { inspectExcelWorkbook, bulkInsertExcelData } = require('../services/excelService');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

router.post('/inspect', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });

    const bodyValidation = InspectBodySchema.safeParse(req.body);
    const pic = bodyValidation.success ? bodyValidation.data.pic : null;
    const tower = bodyValidation.success ? bodyValidation.data.tower : null;

    const inspection = inspectExcelWorkbook(req.file.buffer, pic, tower);
    res.json(inspection);
  } catch (error) {
    console.error('Inspect error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:tableName', upload.single('file'), async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const { tableName } = paramValidation.data;
    const result = await bulkInsertExcelData(tableName, req.file.buffer);
    res.json(result);
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/import/:tableName/row — Insert single row from web form
router.post('/:tableName/row', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const { tableName } = paramValidation.data;
    const rowData = req.body;
    if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
      return res.status(400).json({ error: 'Data baris tidak boleh kosong.' });
    }
    // Get columns from DB (exclude id)
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    const allowedCols = cols.map(c => c.COLUMN_NAME);
    const filteredData = {};
    for (const col of allowedCols) {
      if (rowData[col] !== undefined && rowData[col] !== '') {
        filteredData[col] = rowData[col];
      }
    }
    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({ error: 'Tidak ada kolom valid yang terisi.' });
    }
    const keys = Object.keys(filteredData);
    const vals = Object.values(filteredData);
    const placeholders = keys.map(() => '?').join(', ');
    const colNames = keys.map(k => `\`${k}\``).join(', ');
    const [result] = await pool.execute(
      `INSERT INTO \`${tableName}\` (${colNames}) VALUES (${placeholders})`,
      vals
    );
    res.json({ success: true, insertId: result.insertId, message: `1 baris berhasil ditambahkan ke ${tableName}.` });
  } catch (error) {
    console.error('Row insert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/import/:tableName/columns — Get table column definitions
router.get('/:tableName/columns', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message });
    }
    const { tableName } = paramValidation.data;
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id'
       ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    res.json({ table: tableName, columns: cols });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.delete('/:tableName', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const { tableName } = paramValidation.data;
    await pool.execute(`TRUNCATE TABLE \`${tableName}\``);
    res.json({ message: `Tabel ${tableName} berhasil dikosongkan.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tableName/count', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const { tableName } = paramValidation.data;
    const [rows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
    res.json({ table: tableName, count: rows[0].cnt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tableName/rows', async (req, res) => {
  try {
    const paramValidation = TableNameParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: paramValidation.error.issues?.[0]?.message || paramValidation.error.message });
    }
    const queryValidation = PicRowsQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return res.status(400).json({ error: queryValidation.error.issues?.[0]?.message || queryValidation.error.message });
    }

    const { tableName } = paramValidation.data;
    const { page, limit, search } = queryValidation.data;
    const offset = (page - 1) * limit;

    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id'
       ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    const columns = cols.map((c) => c.COLUMN_NAME);

    let whereClause = '';
    const params = [];

    if (search) {
      const textCols = columns.filter((c) =>
        ['batch', 'tanggal', 'waktu', 'nama', 'shift', 'team', 'pin', 'mode'].some((k) =>
          c.toLowerCase().includes(k)
        )
      );
      if (textCols.length > 0) {
        whereClause = 'WHERE ' + textCols.map((c) => `\`${c}\` LIKE ?`).join(' OR ');
        textCols.forEach(() => params.push(`%${search}%`));
      }
    }

    const [countRows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\` ${whereClause}`, params);
    const totalRows = countRows[0].cnt;

    const [rows] = await pool.execute(
      `SELECT * FROM \`${tableName}\` ${whereClause} ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json({
      table: tableName,
      columns,
      totalRows,
      page,
      limit,
      totalPages: Math.ceil(totalRows / limit) || 1,
      rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
