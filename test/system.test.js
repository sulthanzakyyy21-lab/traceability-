const { test, describe, after, before } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { TABLE_COLUMNS_MAP, ALLOWED_TABLES, TABLE_METADATA } = require('../server/tableConfig');
const pool = require('../server/db');
const { TraceQuerySchema } = require('../server/schemas/traceSchema');
const { TableNameParamSchema, PicRowsQuerySchema } = require('../server/schemas/importSchema');
const { parseBatch, formatAvg2 } = require('../server/utils/traceHelpers');
const { seedPaBaseline } = require('../server/db/migrations/seedPaBaseline');

describe('Traceability System - Automated Monitoring & Validation', () => {

  before(async () => {
    try {
      await seedPaBaseline();
    } catch {}
  });

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

  // ══════════════════════════════════════════════════════════════
  // Test Case 9: Autentikasi Pengguna & Hak Akses (RBAC)
  // ══════════════════════════════════════════════════════════════
  test('TC-9: Autentikasi Pengguna & Hak Akses (Role-Based Access Control)', async () => {
    const { loginUser } = require('../server/services/authService');
    const { requireRole } = require('../server/middleware/auth');

    // 1. Validasi 4 Akun Default
    const roles = [
      { user: 'admin', pass: 'admin123', expectedRole: 'admin' },
      { user: 'operator.prod', pass: 'prod123', expectedRole: 'produksi' },
      { user: 'analis.qc', pass: 'qc123', expectedRole: 'qc' },
      { user: 'viewer', pass: 'view123', expectedRole: 'viewer' },
    ];

    for (const r of roles) {
      const res = await loginUser(r.user, r.pass);
      assert.ok(res.token, `Token JWT harus digenerate untuk user ${r.user}`);
      assert.strictEqual(res.user.role, r.expectedRole, `Role untuk ${r.user} harus ${r.expectedRole}`);
    }

    // 2. Proteksi Password Salah
    await assert.rejects(
      async () => {
        await loginUser('admin', 'wrong_password_xyz');
      },
      /Username atau password salah/,
      'Password salah harus ditolak'
    );

    // 3. Middleware Role Enforcement Check
    const adminCheck = requireRole('produksi');
    let calledNext = false;
    let errorStatus = null;

    const mockReqAdmin = { user: { role: 'admin' } };
    const mockRes = {
      status: (code) => {
        errorStatus = code;
        return { json: () => {} };
      },
    };

    // Admin selalu lolos
    adminCheck(mockReqAdmin, mockRes, () => { calledNext = true; });
    assert.strictEqual(calledNext, true, 'Role admin harus selalu diizinkan');

    // Viewer ditolak jika butuh role produksi
    calledNext = false;
    errorStatus = null;
    const mockReqViewer = { user: { role: 'viewer' } };
    adminCheck(mockReqViewer, mockRes, () => { calledNext = true; });
    assert.strictEqual(calledNext, false, 'Role viewer tidak boleh lolos ke aksi produksi');
    assert.strictEqual(errorStatus, 403, 'Akses yang tidak diizinkan harus mengembalikan status HTTP 403');
  });

  // ══════════════════════════════════════════════════════════════
  // Test Case 10: Integrasi 8 Tabel PA (Product Assurance)
  // ══════════════════════════════════════════════════════════════
  test('TC-10: Konfigurasi 8 Tabel PA (Product Assurance) & Integrasi Form F/QC/01.030', async () => {
    const requiredPaTables = [
      'pa_fwt_t1', 'pa_fwt_t2',
      'pa_cip_t1', 'pa_cip_t2',
      'pa_emp_t1', 'pa_emp_t2',
      'pa_abe_t1', 'pa_abe_t2',
    ];

    assert.strictEqual(requiredPaTables.length, 8, 'Harus ada tepat 8 tabel PA');

    for (const tbl of requiredPaTables) {
      assert.ok(ALLOWED_TABLES.includes(tbl), `Tabel PA "${tbl}" wajib terdaftar di ALLOWED_TABLES`);
      const cols = TABLE_COLUMNS_MAP[tbl];
      assert.ok(Array.isArray(cols) && cols.length > 0, `Tabel PA "${tbl}" harus memiliki kolom di TABLE_COLUMNS_MAP`);
      assert.ok(TABLE_METADATA[tbl], `Tabel PA "${tbl}" wajib terdaftar di TABLE_METADATA`);
      assert.strictEqual(TABLE_METADATA[tbl].pic, 'PA', `PIC untuk tabel PA "${tbl}" harus bernilai "PA"`);
    }

    const { getWaterProcessFlow, getPaFlow } = require('../server/services/paService');
    const water = await getWaterProcessFlow('Tower 1', '2026-08-22 08:00:00');
    assert.ok(water, 'Water process data harus berhasil ditarik');
    assert.ok(water.waktu_analisa, 'Waktu analisa water process harus tersedia');
    assert.ok(water.ph, 'pH air proses harus tersedia');
    assert.ok(water.tds, 'TDS air proses harus tersedia');
    assert.strictEqual(water.e_coli, 'Negatif', 'E-Coli air proses harus Negatif');
    assert.strictEqual(water.total_coliform, 'Negatif', 'Total Coliform air proses harus Negatif');

    const paFlow = await getPaFlow('370', 2026, 'Tower 1', '2026-08-22 08:00:00', '2026-08-22');
    assert.ok(paFlow, 'getPaFlow harus mengembalikan objek flow PA');
    assert.ok(paFlow.water, 'paFlow harus memuat water process data');
    assert.ok(paFlow.cip, 'paFlow harus memuat objek CIP sanitasi');
    assert.ok(paFlow.cip.extraction, 'paFlow harus memuat CIP ekstraksi');
    assert.ok(paFlow.cip.evaporation, 'paFlow harus memuat CIP evaporasi');
    assert.ok(paFlow.cip.dryer, 'paFlow harus memuat CIP dryer');
    assert.ok(paFlow.cip.rework, 'paFlow harus memuat CIP rework');

    assert.ok(paFlow.extraction_cip_checklist, 'paFlow harus memuat extraction_cip_checklist');
    assert.strictEqual(paFlow.extraction_cip_checklist.totalItems, 57, 'Plant 1 checklist harus berisi 57 titik');
    assert.ok(paFlow.extraction_cip_checklist.recordedItems > 0, 'Plant 1 harus memiliki titik CIP terverifikasi');

    const { getExtractionCipChecklist } = require('../server/services/paCipChecklistService');
    const p2Checklist = await getExtractionCipChecklist(2, '2026-08-28');
    assert.ok(p2Checklist, 'getExtractionCipChecklist Plant 2 harus mengembalikan objek');
    assert.strictEqual(p2Checklist.totalItems, 68, 'Plant 2 checklist harus berisi 68 titik');
    assert.ok(p2Checklist.recordedItems > 0, 'Plant 2 harus memiliki titik CIP terverifikasi');
  });

});



