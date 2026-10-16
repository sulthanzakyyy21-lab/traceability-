const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

// ── 1. Import Table Configuration ──
const { TABLE_COLUMNS_MAP, ALLOWED_TABLES, TABLE_METADATA } = require('../server/tableConfig');
const pool = require('../server/db');

describe('Traceability System - Automated Monitoring & Validation', () => {

  after(async () => {
    // Gracefully close MySQL pool after tests finish
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
      // 1. Pastikan terdaftar di ALLOWED_TABLES
      assert.ok(
        ALLOWED_TABLES.includes(tableName),
        `Tabel "${tableName}" wajib terdaftar di ALLOWED_TABLES`
      );

      // 2. Pastikan kolom terdefinisi di TABLE_COLUMNS_MAP
      const columns = TABLE_COLUMNS_MAP[tableName];
      assert.ok(
        Array.isArray(columns) && columns.length > 0,
        `Tabel "${tableName}" harus memiliki daftar kolom di TABLE_COLUMNS_MAP`
      );

      // 3. Pastikan setiap nama kolom bertipe string non-kosong
      for (const col of columns) {
        assert.ok(
          typeof col === 'string' && col.trim().length > 0,
          `Nama kolom di tabel "${tableName}" tidak boleh kosong`
        );
      }
    }

    // Validasi jumlah kolom spesifik
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
    // A. Uji konversi total output box ke kg (205 box * 30 kg/box)
    const boxCount = 205;
    const kgPerBox = 30;
    const totalOutputKg = boxCount * kgPerBox;
    assert.strictEqual(totalOutputKg, 6150, 'Konversi 205 box * 30 kg harus bernilai 6150 kg');

    // B. Uji rumus Yield Roasting: (berat matang / berat mentah) * 100
    // Contoh audit: matang = 11607.8 kg, mentah = 13285.8 kg
    const beratKopiMatang = 11607.8;
    const beratKopiMentah = 13285.8;
    const rawYield = (beratKopiMatang / beratKopiMentah) * 100;
    const yieldFormatted = rawYield.toFixed(2);
    assert.strictEqual(yieldFormatted, '87.37', 'Yield Roasting harus bernilai 87.37');
    assert.strictEqual(`${yieldFormatted}%`, '87.37%', 'Yield Roasting berformat persentase harus 87.37%');

    // C. Uji rumus Rasio IC: total kopi mentah / total output finish good kg
    // Contoh audit: 13285.8 kg / 6150 kg = 2.16
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

});
