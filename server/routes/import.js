const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { ALLOWED_TABLES } = require('../tableConfig');
const { TableNameParamSchema, PicRowsQuerySchema, InspectBodySchema } = require('../schemas/importSchema');
const { inspectExcelWorkbook, bulkInsertExcelData } = require('../services/excelService');
const { verifyToken, requireRole } = require('../middleware/auth');
const { recordAuditLog } = require('../services/auditLogService');
const { getTableEquipments, getTableRows } = require('../services/importQueryService');

function validateExcelMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;
  // ZIP / OpenXML (XLSX, XLSM): 50 4B 03 04
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  // OLE2 Compound File (XLS): D0 CF 11 E0
  const isOle = buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0;
  return isZip || isOle;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, f, cb) => {
    const ok = ['xlsx', 'xls', 'xlsm'].includes(f.originalname.split('.').pop().toLowerCase());
    cb(ok ? null : new Error('Hanya format file Excel (.xlsx, .xls) yang diizinkan.'), ok);
  },
});

router.post('/inspect', verifyToken, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diunggah.' });
    if (!validateExcelMagicBytes(req.file.buffer)) {
      return res.status(400).json({ error: 'File biner tidak valid: Magic bytes bukan format arsip Excel resmi (.xlsx/.xls).' });
    }
    const b = InspectBodySchema.safeParse(req.body);
    res.json(inspectExcelWorkbook(req.file.buffer, b.success ? b.data.pic : null, b.success ? b.data.tower : null));
  } catch (err) {
    console.error('[Import Inspect Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat inspeksi file Excel.' });
  }
});

router.post('/:tableName', verifyToken, requireRole('admin'), upload.single('file'), async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    if (!validateExcelMagicBytes(req.file.buffer)) {
      return res.status(400).json({ error: 'File biner tidak valid: Magic bytes bukan format arsip Excel resmi (.xlsx/.xls).' });
    }
    const result = await bulkInsertExcelData(v.data.tableName, req.file.buffer);
    await recordAuditLog({
      userId: req.user?.id, username: req.user?.username, role: req.user?.role,
      action: 'BULK_IMPORT', tableName: v.data.tableName, reason: `Upload ${req.file.originalname}`,
      afterData: { insertedRows: result?.insertedRows, totalRows: result?.totalRows }
    });
    res.json(result);
  } catch (err) {
    console.error('[Import Bulk Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat impor data Excel ke database.' });
  }
});

router.post('/:tableName/row', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const { tableName } = v.data;
    const rowData = req.body;
    if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
      return res.status(400).json({ error: 'Data baris tidak boleh kosong.' });
    }
    const [cols] = await pool.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`, [tableName]);
    const filtered = {};
    cols.forEach(c => { if (rowData[c.COLUMN_NAME] !== undefined && rowData[c.COLUMN_NAME] !== '') filtered[c.COLUMN_NAME] = rowData[c.COLUMN_NAME]; });
    if (Object.keys(filtered).length === 0) return res.status(400).json({ error: 'Tidak ada kolom valid yang terisi.' });
    const keys = Object.keys(filtered);
    const [result] = await pool.execute(`INSERT INTO \`${tableName}\` (${keys.map(k => `\`${k}\``).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, Object.values(filtered));
    await recordAuditLog({
      userId: req.user?.id, username: req.user?.username, role: req.user?.role,
      action: 'INSERT', tableName, recordId: result.insertId, afterData: filtered, reason: 'Manual row insert'
    });
    res.json({ success: true, insertId: result.insertId, message: `1 baris berhasil ditambahkan ke ${tableName}.` });
  } catch (err) {
    console.error('[Import Row Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menambahkan baris data.' });
  }
});

router.get('/:tableName/columns', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const [cols] = await pool.query(`SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`, [v.data.tableName]);
    res.json({ table: v.data.tableName, columns: cols });
  } catch (err) {
    console.error('[Import Columns Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat membaca kolom tabel.' });
  }
});

router.delete('/all/clear-all', verifyToken, requireRole('admin'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const tbl of ALLOWED_TABLES) {
      try { await conn.execute(`TRUNCATE TABLE \`${tbl}\``); }
      catch { await conn.execute(`DELETE FROM \`${tbl}\``); await conn.execute(`ALTER TABLE \`${tbl}\` AUTO_INCREMENT = 1`); }
    }
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    await recordAuditLog({
      userId: req.user?.id, username: req.user?.username, role: req.user?.role,
      action: 'CLEAR_DATA', tableName: 'ALL_TABLES', reason: 'Admin truncate all tables'
    });
    res.json({ success: true, count: ALLOWED_TABLES.length, message: `Seluruh data pada ${ALLOWED_TABLES.length} tabel database berhasil dikosongkan.` });
  } catch (err) {
    try { await conn.execute('SET FOREIGN_KEY_CHECKS = 1'); } catch {}
    console.error('[Import Clear Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat mengosongkan data.' });
  } finally {
    conn.release();
  }
});

router.delete('/:tableName/row/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const rowId = parseInt(req.params.id, 10);
    if (!rowId || isNaN(rowId)) return res.status(400).json({ error: 'ID baris tidak valid.' });
    const [existing] = await pool.execute(`SELECT * FROM \`${v.data.tableName}\` WHERE id = ? LIMIT 1`, [rowId]);
    const [result] = await pool.execute(`DELETE FROM \`${v.data.tableName}\` WHERE id = ?`, [rowId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Baris data tidak ditemukan.' });
    await recordAuditLog({
      userId: req.user?.id, username: req.user?.username, role: req.user?.role,
      action: 'DELETE', tableName: v.data.tableName, recordId: rowId, beforeData: existing[0] || null, reason: 'Admin row delete'
    });
    res.json({ success: true, message: `Baris data ID ${rowId} berhasil dihapus dari ${v.data.tableName}.` });
  } catch (err) {
    console.error('[Import Row Delete Error]:', err);
    res.status(500).json({ error: 'Terjadi kesalahan internal saat menghapus baris data.' });
  }
});

router.delete('/:tableName', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    try { await pool.execute(`TRUNCATE TABLE \`${v.data.tableName}\``); }
    catch { await pool.execute(`DELETE FROM \`${v.data.tableName}\``); await pool.execute(`ALTER TABLE \`${v.data.tableName}\` AUTO_INCREMENT = 1`); }
    await recordAuditLog({
      userId: req.user?.id, username: req.user?.username, role: req.user?.role,
      action: 'CLEAR_DATA', tableName: v.data.tableName, reason: 'Admin truncate table'
    });
    res.json({ message: `Tabel ${v.data.tableName} berhasil dikosongkan.` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:tableName/count', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const [rows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${v.data.tableName}\``);
    res.json({ table: v.data.tableName, count: rows[0].cnt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:tableName/equipments', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    res.json(await getTableEquipments(v.data.tableName));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:tableName/rows', async (req, res) => {
  try {
    const v = TableNameParamSchema.safeParse(req.params);
    if (!v.success) return res.status(400).json({ error: v.error.issues?.[0]?.message });
    const q = PicRowsQuerySchema.safeParse(req.query);
    if (!q.success) return res.status(400).json({ error: q.error.issues?.[0]?.message });
    res.json(await getTableRows(v.data.tableName, q.data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
