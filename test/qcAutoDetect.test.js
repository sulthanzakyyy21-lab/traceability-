const test = require('node:test');
const assert = require('node:assert');
const xlsx = require('xlsx');
const { QC_TABLE_COLUMNS_MAP } = require('../server/config/qcColumns');
const { inspectExcelWorkbook } = require('../server/utils/inspectHelper');
const { filterDuplicateRows } = require('../server/utils/dedupHelper');

test('QC Tower 1 - Akurasi Auto-Deteksi 10 Tabel & Anti-Salah Sasaran', () => {
  for (const [tblKey, cols] of Object.entries(QC_TABLE_COLUMNS_MAP)) {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet([cols, cols.map((_, i) => 'val_' + i)]);
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const expectedTower = tblKey.endsWith('_t2') ? 'Tower 2' : 'Tower 1';
    const res = inspectExcelWorkbook(buf, 'QC', expectedTower);
    assert.strictEqual(res.detected, true, `Tabel ${tblKey} harus terdeteksi`);
    assert.strictEqual(res.table, tblKey, `Deteksi ${tblKey} tidak boleh salah sasaran (dapat: ${res.table})`);
    assert.strictEqual(res.valid, true, `Tabel ${tblKey} harus valid (100% cocok)`);
    assert.strictEqual(res.missingCount, 0, `Tabel ${tblKey} tidak boleh ada missing columns`);
  }
});

test('QC Tower 1 - Proteksi Anti-Duplikasi Data (Deduplication Safeguard)', async () => {
  const cols = QC_TABLE_COLUMNS_MAP.qc_feed_tank_t1;
  const mockRows = [
    ['STAMP-01', 'PROD-A', 'FT-01', 'BATCH-100', '2026-10-13', '08:00', 'OK', '10.5', '12.0', '5.2', 'OK', 'OK', 'OK', 'Ket', 'PIC-A'],
    ['STAMP-01', 'PROD-A', 'FT-01', 'BATCH-100', '2026-10-13', '08:00', 'OK', '10.5', '12.0', '5.2', 'OK', 'OK', 'OK', 'Ket', 'PIC-A'],
  ];

  const mockPool = {
    query: async () => [
      [
        {
          Stamp: 'STAMP-01',
          Produk: 'PROD-A',
          'Final Tank': 'FT-01',
          Batch: 'BATCH-100',
          Tanggal: '2026-10-13',
          Jam: '08:00',
          'Vis/FM': 'OK',
          'Brix (°brix)': '10.5',
          'TS (%)': '12.0',
          pH: '5.2',
          'Cup Test Wangi': 'OK',
          'Cup Test Pahit': 'OK',
          'Cup Test Asam': 'OK',
          Keterangan: 'Ket',
          TTD: 'PIC-A',
        },
      ],
    ],
  };

  const res = await filterDuplicateRows('qc_feed_tank_t1', cols, mockRows, mockPool);
  assert.strictEqual(res.duplicateCount, 2, 'Kedua baris harus ditolak sebagai duplikat (1 di db, 1 kembar di file)');
  assert.strictEqual(res.newRows.length, 0, 'Tidak boleh ada baris duplikat yang lolos ke database');
});
