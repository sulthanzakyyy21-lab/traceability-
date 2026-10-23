const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { TABLE_COLUMNS_MAP, ALLOWED_TABLES, TABLE_METADATA } = require('../server/tableConfig');
const pool = require('../server/db');
const { TraceQuerySchema } = require('../server/schemas/traceSchema');
const { TableNameParamSchema, PicRowsQuerySchema } = require('../server/schemas/importSchema');
const { parseBatch, formatAvg2 } = require('../server/utils/traceHelpers');

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
  test('TC-2: Verifikasi Formula Kalkulasi Traceability (Yield & Rasio IC) & formatAvg2', () => {
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

    // formatAvg2 helper validation
    assert.strictEqual(formatAvg2([3.5555]), '3,56', '3.5555 harus diformat menjadi "3,56"');
    assert.strictEqual(formatAvg2([3.10, 3.50]), '3,30', 'Rata-rata 3.10 dan 3.50 harus "3,30"');
    assert.strictEqual(formatAvg2(['3,1', '3,5']), '3,30', 'String dengan koma harus didukung');
    assert.strictEqual(formatAvg2([0, -1, 4.222]), '4,22', 'Nilai <= 0 harus diabaikan');
    assert.strictEqual(formatAvg2([]), '-', 'Array kosong harus mengembalikan "-"');
    assert.strictEqual(formatAvg2([0, -5]), '-', 'Array tanpa nilai > 0 harus mengembalikan "-"');
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

  // ══════════════════════════════════════════════════════════════
  // Test Case 6: Proteksi Anti-Duplikasi Data (Deduplication Safeguard)
  // ══════════════════════════════════════════════════════════════
  test('TC-6: Proteksi Anti-Duplikasi Data Excel (Deduplication Safeguard)', async () => {
    const { filterDuplicateRows } = require('../server/utils/dedupHelper');
    const columns = ['Tanggal', 'Jam', 'Batch', 'Nomor Box', 'Kadar Air (%)'];
    const fakeIncoming = [
      ['2026-03-01', '08:00', 'B999', 'Box 1', '3.10'],
      ['2026-03-01', '08:00', 'B999', 'Box 1', '3.10'], // internal duplicate
      ['2026-03-01', '08:30', 'B999', 'Box 2', '3.40'],
    ];

    const mockPoolEmpty = { query: async () => [[]] };
    const res1 = await filterDuplicateRows('test_tbl', columns, fakeIncoming, mockPoolEmpty);
    assert.strictEqual(res1.totalIncoming, 3);
    assert.strictEqual(res1.duplicateCount, 1, 'Duplikat internal harus ditolak');
    assert.strictEqual(res1.newRows.length, 2, 'Hanya 2 baris unik yang lolos');

    const mockPoolExisting = {
      query: async () => [[
        { Tanggal: '2026-03-01', Jam: '08:00', Batch: 'B999', 'Nomor Box': 'Box 1', 'Kadar Air (%)': '3.10' }
      ]],
    };
    const res2 = await filterDuplicateRows('test_tbl', columns, fakeIncoming, mockPoolExisting);
    assert.strictEqual(res2.duplicateCount, 2, 'Baris existing di DB + duplikat internal harus ditolak');
    assert.strictEqual(res2.newRows.length, 1, 'Hanya Box 2 yang lolos sebagai baris baru');

    // 3. Smart UPSERT: Baris existing di DB belum lengkap lalu diperbarui di file
    const mockPoolIncomplete = {
      query: async () => [[
        { id: 42, Tanggal: '2026-03-01', Jam: '08:00', Batch: 'B999', 'Nomor Box': 'Box 1', 'Kadar Air (%)': null }
      ]],
    };
    const res3 = await filterDuplicateRows('test_tbl', columns, fakeIncoming, mockPoolIncomplete);
    assert.strictEqual(res3.updateRows.length, 1, 'Baris yang awalnya kosong harus masuk ke updateRows (UPSERT)');
    assert.strictEqual(res3.updateRows[0].id, 42);
    assert.strictEqual(res3.updateRows[0].updates['Kadar Air (%)'], '3.10');
    assert.strictEqual(res3.newRows.length, 1, 'Hanya Box 2 yang masuk ke newRows');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 7: Validasi Kolom Excel Otomatis & Peringatan Kolom
  // ══════════════════════════════════════════════════════════════
  test('TC-7: Validasi Kolom Excel Otomatis & Peringatan Ketidakcocokan Kolom', () => {
    const xlsx = require('xlsx');
    const { inspectExcelWorkbook } = require('../server/utils/inspectHelper');

    // 1. Valid workbook for dryer_tower_1 (Produksi Tower 1)
    const validHeaders = TABLE_COLUMNS_MAP.dryer_tower_1;
    const sampleRow = validHeaders.map((_, i) => `val_${i}`);
    const wb1 = xlsx.utils.book_new();
    const ws1 = xlsx.utils.aoa_to_sheet([validHeaders, sampleRow]);
    xlsx.utils.book_append_sheet(wb1, ws1, 'DRYER T1');
    const validBuf = xlsx.write(wb1, { type: 'buffer', bookType: 'xlsx' });

    const resValid = inspectExcelWorkbook(validBuf, 'Produksi', 'Tower 1');
    assert.strictEqual(resValid.detected, true, 'Harus terdeteksi sebagai tabel');
    assert.strictEqual(resValid.valid, true, 'File dengan kolom lengkap harus valid');
    assert.strictEqual(resValid.table, 'dryer_tower_1');
    assert.strictEqual(resValid.missingCount, 0, 'Tidak boleh ada kolom wajib yang kurang');

    // 2. Mismatched workbook (e.g. arbitrary non-matching columns)
    const badHeaders = ['Nama Siswa', 'Nilai Ujian', 'Mata Pelajaran', 'Kelas'];
    const wb2 = xlsx.utils.book_new();
    const ws2 = xlsx.utils.aoa_to_sheet([badHeaders, ['Budi', '90', 'Matematika', '10A']]);
    xlsx.utils.book_append_sheet(wb2, ws2, 'Data Siswa');
    const badBuf = xlsx.write(wb2, { type: 'buffer', bookType: 'xlsx' });

    const resBad = inspectExcelWorkbook(badBuf, 'Produksi', 'Tower 1');
    assert.strictEqual(resBad.valid, false, 'File dengan kolom tidak cocok harus tidak valid (valid: false)');
    assert.ok(resBad.warning && resBad.warning.length > 0, 'Harus memberikan teks peringatan ketidakcocokan kolom');

    // 3. Partial columns (<40% match) -> should trigger mismatch warning
    const partialHeaders = ['Final Tank', 'Level Final Tank', 'TS Final Tank'];
    const wb3 = xlsx.utils.book_new();
    const ws3 = xlsx.utils.aoa_to_sheet([partialHeaders, ['FT1', '50%', '30']]);
    xlsx.utils.book_append_sheet(wb3, ws3, 'DRYER T1');
    const partialBuf = xlsx.write(wb3, { type: 'buffer', bookType: 'xlsx' });

    const resPartial = inspectExcelWorkbook(partialBuf, 'Produksi', 'Tower 1');
    assert.strictEqual(resPartial.valid, false, 'Kesesuaian kolom < 40% harus ditolak');
    assert.ok(resPartial.warning.includes('Peringatan: Kolom tidak cocok'), 'Peringatan harus menginformasikan ketidakcocokan kolom');
    assert.ok(resPartial.missingColumns.length > 0, 'Daftar kolom yang hilang harus terisi');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 8: Konektor Google Spreadsheet QC & Produksi
  // ══════════════════════════════════════════════════════════════
  test('TC-8: Verifikasi Konektor Google Spreadsheet QC & Produksi (file_penghubung)', () => {
    const { getQcConnectorStatus } = require('../server/services/qcGoogleAuthService');
    const { getProdConnectorStatus } = require('../server/services/prodGoogleAuthService');
    const { isQcSheet, DEFAULT_QC_SHEETS } = require('../server/config/sheetConfig');

    // 1. QC Connector
    const qcStatus = getQcConnectorStatus();
    assert.strictEqual(qcStatus.active, true, 'Konektor QC harus aktif (file_penghubung/qc.json tersedia)');
    assert.strictEqual(qcStatus.keyFile, 'file_penghubung/qc.json');
    assert.strictEqual(qcStatus.clientEmail, 'checklist-qc@traceability-512303.iam.gserviceaccount.com');

    // 2. Produksi Connector
    const prodStatus = getProdConnectorStatus();
    assert.strictEqual(prodStatus.active, true, 'Konektor Produksi harus aktif (file_penghubung/produksi.json tersedia)');
    assert.strictEqual(prodStatus.keyFile, 'file_penghubung/produksi.json');
    assert.strictEqual(prodStatus.clientEmail, 'cheklist-produksi@traceability-512303.iam.gserviceaccount.com');

    // 3. Routing Identification
    assert.strictEqual(isQcSheet(DEFAULT_QC_SHEETS['1']), true, 'Sheet ID QC Tower 1 harus dikenali sebagai QC');
    assert.strictEqual(isQcSheet(DEFAULT_QC_SHEETS['2']), true, 'Sheet ID QC Tower 2 harus dikenali sebagai QC');
    assert.strictEqual(isQcSheet('random_other_sheet'), false, 'Sheet non-QC tidak boleh dikenali sebagai QC');
  });

});


