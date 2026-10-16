const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { TABLE_COLUMNS_MAP, ALLOWED_TABLES, TABLE_METADATA } = require('../server/tableConfig');
const pool = require('../server/db');
const { TraceQuerySchema } = require('../server/schemas/traceSchema');
const { TableNameParamSchema, PicRowsQuerySchema } = require('../server/schemas/importSchema');
const { parseBatch } = require('../server/utils/traceHelpers');

describe('Traceability System - Automated Monitoring & Validation', () => {

  after(async () => {
    try {
      await pool.end();
    } catch {}
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 1: Konfigurasi 9 Tabel Produksi
  // ══════════════════════════════════════════════════════════════
  test('TC-1: Konfigurasi 9 Tabel Produksi Lengkap & Valid', () => {
    const requiredTables = [
      'packing_tower_1',
      'packing_tower_2',
      'dryer_tower_1',
      'dryer_tower_2',
      'evaporation_tower_1',
      'evaporation_tower_2',
      'extraction_tower_1',
      'extraction_tower_2',
      'roasting_probat'
    ];

    assert.strictEqual(requiredTables.length, 9, 'Harus ada 9 tabel produksi');

    for (const tableName of requiredTables) {
      assert.ok(
        ALLOWED_TABLES.includes(tableName),
        `Tabel "${tableName}" wajib terdaftar di ALLOWED_TABLES`
      );

      const columns = TABLE_COLUMNS_MAP[tableName];
      assert.ok(
        Array.isArray(columns) && columns.length > 0,
        `Tabel "${tableName}" harus memiliki daftar kolom di TABLE_COLUMNS_MAP`
      );

      for (const col of columns) {
        assert.ok(
          typeof col === 'string' && col.trim().length > 0,
          `Nama kolom di tabel "${tableName}" tidak boleh kosong`
        );
      }
    }

    assert.strictEqual(TABLE_COLUMNS_MAP.packing_tower_1.length, 24, 'packing_tower_1 harus memiliki 24 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.packing_tower_2.length, 24, 'packing_tower_2 harus memiliki 24 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.dryer_tower_1.length, 38, 'dryer_tower_1 harus memiliki 38 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.dryer_tower_2.length, 44, 'dryer_tower_2 harus memiliki 44 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.extraction_tower_1.length, 23, 'extraction_tower_1 harus memiliki 23 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.extraction_tower_2.length, 24, 'extraction_tower_2 harus memiliki 24 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.evaporation_tower_1.length, 20, 'evaporation_tower_1 harus memiliki 20 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.evaporation_tower_2.length, 19, 'evaporation_tower_2 harus memiliki 19 kolom');
    assert.strictEqual(TABLE_COLUMNS_MAP.roasting_probat.length, 31, 'roasting_probat harus memiliki 31 kolom');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 2: Logika Kalkulasi Traceability
  // ══════════════════════════════════════════════════════════════
  test('TC-2: Verifikasi Formula Kalkulasi Traceability (Yield & Rasio IC)', () => {
    const boxCount = 205;
    const kgPerBox = 30;
    const totalOutputKg = boxCount * kgPerBox;
    assert.strictEqual(totalOutputKg, 6150, 'Konversi 205 box * 30 kg harus bernilai 6150 kg');

    const beratKopiMatang = 11607.8;
    const beratKopiMentah = 13285.8;
    const rawYield = (beratKopiMatang / beratKopiMentah) * 100;
    const yieldFormatted = rawYield.toFixed(2);
    assert.strictEqual(yieldFormatted, '87.37', 'Yield Roasting harus bernilai 87.37');
    assert.strictEqual(`${yieldFormatted}%`, '87.37%', 'Yield Roasting berformat persentase harus 87.37%');

    const rawRasioIC = beratKopiMentah / totalOutputKg;
    const rasioICFormatted = rawRasioIC.toFixed(2);
    assert.strictEqual(rasioICFormatted, '2.16', 'Rasio IC (13285.8 / 6150) harus bernilai 2.16');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 3: Koneksi Database MySQL
  // ══════════════════════════════════════════════════════════════
  test('TC-3: Koneksi Database Pool MySQL Aktif & Respon Kueri', async () => {
    const [rows] = await pool.query('SELECT 1 as connected, NOW() as server_time');
    assert.ok(rows && rows.length > 0, 'Query database harus mengembalikan baris hasil');
    assert.strictEqual(rows[0].connected, 1, 'Koneksi database pool harus merespon SELECT 1');
    assert.ok(rows[0].server_time, 'Database server harus mengembalikan server_time');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 4: Zod Validation Contracts on API Boundaries
  // ══════════════════════════════════════════════════════════════
  test('TC-4: Zod Schema Contracts Validasi Input & Anti-Halusinasi', () => {
    // 1. Valid TraceQuery
    const validTrace = TraceQuerySchema.safeParse({
      noBatchFull: 'A370/26',
      tower: '1',
      totalOutput: '6150',
    });
    assert.strictEqual(validTrace.success, true);
    assert.strictEqual(validTrace.data.noBatchFull, 'A370/26');
    assert.strictEqual(validTrace.data.tower, '1');
    assert.strictEqual(validTrace.data.totalOutput, 6150);

    // 2. Invalid Tower value
    const invalidTower = TraceQuerySchema.safeParse({
      noBatchFull: 'A370/26',
      tower: '3',
    });
    assert.strictEqual(invalidTower.success, false);

    // 3. Batch parser helper
    const parsed = parseBatch('A370/26');
    assert.strictEqual(parsed.batch, 370);
    assert.strictEqual(parsed.tahun, 2026);

    // 4. Allowed tables schema check
    const validTable = TableNameParamSchema.safeParse({ tableName: 'dryer_tower_1' });
    assert.strictEqual(validTable.success, true);

    const invalidTable = TableNameParamSchema.safeParse({ tableName: 'fake_table_injected' });
    assert.strictEqual(invalidTable.success, false);

    // 5. PIC query bounds check
    const validPagination = PicRowsQuerySchema.safeParse({ page: '2', limit: '50' });
    assert.strictEqual(validPagination.success, true);
    assert.strictEqual(validPagination.data.page, 2);
    assert.strictEqual(validPagination.data.limit, 50);
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 5: Modular Code Quality (<200 baris/file mandate)
  // ══════════════════════════════════════════════════════════════
  test('TC-5: Kepatuhan Standar Modularitas & Batasan Baris Kode (<200 baris/file)', () => {
    const serverDir = path.resolve(__dirname, '../server');
    function checkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          assert.ok(
            lines <= 200,
            `File ${path.relative(serverDir, fullPath)} memiliki ${lines} baris, melebihi batas 200 baris!`
          );
        }
      }
    }
    checkDir(serverDir);
  });

});
