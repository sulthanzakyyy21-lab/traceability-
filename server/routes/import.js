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
    const b = InspectBodySchema.safeParse(req.body);
    res.json(inspectExcelWorkbook(req.file.buffer, b.success ? b.data.pic : null, b.success ? b.data.tower : null));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:tableName', upload.single('file'), async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    res.json(await bulkInsertExcelData(v.data.tableName, req.file.buffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:tableName/row', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const { tableName } = v.data;
    const rowData = req.body;
    if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
      return res.status(400).json({ error: 'Data baris tidak boleh kosong.' });
    }
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    const filteredData = {};
    for (const c of cols.map(c => c.COLUMN_NAME)) {
      if (rowData[c] !== undefined && rowData[c] !== '') filteredData[c] = rowData[c];
    }
    if (Object.keys(filteredData).length === 0) return res.status(400).json({ error: 'Tidak ada kolom valid yang terisi.' });
    const keys = Object.keys(filteredData);
    const [result] = await pool.execute(
      `INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      Object.values(filteredData)
    );
    res.json({ success: true, insertId: result.insertId, message: `1 baris berhasil ditambahkan ke ${tableName}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tableName/columns', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const [cols] = await pool.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`,
      [v.data.tableName]
    );
    res.json({ table: v.data.tableName, columns: cols });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:tableName/row/:id', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const rowId = parseInt(req.params.id, 10);
    if (!rowId || isNaN(rowId)) return res.status(400).json({ error: 'ID baris tidak valid.' });
    const [result] = await pool.execute(`DELETE FROM \`${v.data.tableName}\` WHERE id = ?`, [rowId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Baris data tidak ditemukan.' });
    res.json({ success: true, message: `Baris data ID ${rowId} berhasil dihapus dari ${v.data.tableName}.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:tableName', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    await pool.execute(`TRUNCATE TABLE \`${v.data.tableName}\``);
    res.json({ message: `Tabel ${v.data.tableName} berhasil dikosongkan.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tableName/count', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const [rows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${v.data.tableName}\``);
    res.json({ table: v.data.tableName, count: rows[0].cnt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:tableName/rows', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const q = PicRowsQuerySchema.safeParse(req.query);
    if (!q.success) return res.status(400).json({ error: q.error.issues?.[0]?.message });

    const { tableName } = v.data;
    const { page, limit, search, year, month } = q.data;
    const offset = (page - 1) * limit;

    const [cols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    const columns = cols.map((c) => c.COLUMN_NAME);
    const whereClauses = [];
    const params = [];

    if (search) {
      const isRoasting = tableName.toLowerCase().startsWith('roasting');
      const cleanSearch = search.trim();
      const noSpaceSearch = cleanSearch.replace(/\s+/g, '');
      const textCols = columns.filter((c) => {
        const low = c.toLowerCase();
        if (isRoasting) {
          return low.includes('jenis') || low.includes('kopi') || low.includes('mentah') || low.includes('biji') || low.includes('mode') || low.includes('nama');
        }
        return ['batch', 'tanggal', 'waktu', 'nama', 'shift', 'team', 'pin', 'mode', 'produk', 'jenis'].some((k) => low.includes(k));
      });
      if (textCols.length > 0) {
        whereClauses.push('(' + textCols.map((c) => `(\`${c}\` LIKE ? OR REPLACE(\`${c}\`, ' ', '') LIKE ?)`).join(' OR ') + ')');
        textCols.forEach(() => params.push(`%${cleanSearch}%`, `%${noSpaceSearch}%`));
      }
    }

    const dateCol = columns.find((c) => {
      const low = c.toLowerCase();
      return low === 'tanggal' || low.includes('tanggal') || low === 'date' || low.includes('date');
    }) || columns.find((c) => {
      const low = c.toLowerCase();
      return low === 'stamp' || low.includes('stamp');
    });

    if (dateCol) {
      const mStr = month ? String(month).padStart(2, '0') : '';
      if (year && mStr) {
        whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
        params.push(`%${year}-${mStr}%`, `%/${mStr}/${year}%`, `%${year}/${mStr}%`);
      } else if (year) {
        whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
        params.push(`%${year}-%`, `%/${year}%`);
      } else if (mStr) {
        whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
        params.push(`%-${mStr}-%`, `%/${mStr}/%`);
      }
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

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
