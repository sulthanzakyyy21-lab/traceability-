const XLSX = require('xlsx');
const pool = require('../db');
const { fetchGbbSheetBuffer } = require('./gbbGoogleAuthService');

const DEFAULT_GBB_SHEET_ID = process.env.GOOGLE_SHEET_GBB_ID || '12-KuVWk_kfvv9aM10y8BXrMuPJPiEcEAl8BSaKmHPxk';

function excelDateToISO(serial) {
  if (!serial) return null;
  if (typeof serial === 'string' && serial.includes('-')) return serial.split('T')[0];
  const num = parseFloat(serial);
  if (isNaN(num)) return null;
  const utc_days = Math.floor(num - 25569);
  const date_info = new Date(utc_days * 86400 * 1000);
  return date_info.toISOString().split('T')[0];
}

async function syncGbbData(sheetId = DEFAULT_GBB_SHEET_ID) {
  const buf = await fetchGbbSheetBuffer(sheetId);
  const wb = XLSX.read(buf, { type: 'buffer' });

  let insertedPenerimaan = 0;
  let insertedKeluar = 0;

  // 1. Sync INPUT_PENERIMAAN_KOPI
  if (wb.Sheets['INPUT_PENERIMAAN_KOPI']) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['INPUT_PENERIMAAN_KOPI'], { header: 1 });
    const batchData = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      batchData.push([
        String(r[0]).trim(),
        excelDateToISO(r[1]),
        r[2] ? String(r[2]).trim() : null,
        r[3] ? String(r[3]).trim() : null,
        r[4] ? String(r[4]).trim() : null,
        r[5] ? String(r[5]).trim() : null,
        r[6] ? String(r[6]).trim() : null,
        r[7] ? String(r[7]).trim() : null,
        r[8] ? String(r[8]).trim() : null,
        r[9] ? String(r[9]).trim() : null,
        parseInt(String(r[11] || '').replace(/[^0-9]/g, ''), 10) || null,
        parseFloat(String(r[12] || '').replace(',', '.')) || null,
        parseFloat(String(r[13] || '').replace(',', '.')) || null,
        r[14] ? String(r[14]).trim() : null,
        r[15] ? String(r[15]).trim() : null,
        r[16] ? String(r[16]).trim() : '100%',
      ]);
    }

    const chunkSize = 400;
    for (let i = 0; i < batchData.length; i += chunkSize) {
      const chunk = batchData.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flat = chunk.flat();
      await pool.execute(
        `INSERT INTO \`gbb_penerimaan\`
          (id_lot, tanggal_masuk, gudang, id_lokasi, no_lot, jenis_kopi, kadar_air, no_pol, supplier, no_palet, karung_masuk, berat_bruto, berat_netto, no_po, surat_jalan, status_mutu)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
          tanggal_masuk=VALUES(tanggal_masuk), gudang=VALUES(gudang), id_lokasi=VALUES(id_lokasi), no_lot=VALUES(no_lot),
          jenis_kopi=VALUES(jenis_kopi), kadar_air=VALUES(kadar_air), no_pol=VALUES(no_pol), supplier=VALUES(supplier),
          no_palet=VALUES(no_palet), karung_masuk=VALUES(karung_masuk), berat_bruto=VALUES(berat_bruto),
          berat_netto=VALUES(berat_netto), no_po=VALUES(no_po), surat_jalan=VALUES(surat_jalan), status_mutu=VALUES(status_mutu)`,
        flat
      );
      insertedPenerimaan += chunk.length;
    }
  }

  // 2. Sync INPUT_TRANSAKSI_KELUAR
  if (wb.Sheets['INPUT_TRANSAKSI_KELUAR']) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['INPUT_TRANSAKSI_KELUAR'], { header: 1 });
    const batchData = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      batchData.push([
        String(r[0]).trim(),
        r[1] ? String(r[1]).trim() : null,
        excelDateToISO(r[2]),
        r[3] ? String(r[3]).trim() : null,
        r[4] ? String(r[4]).trim() : null,
        r[5] ? String(r[5]).trim() : null,
        r[7] ? String(r[7]).trim() : null,
        r[8] ? String(r[8]).trim() : null,
        parseFloat(r[10]) || null,
        r[12] ? String(r[12]).trim() : null,
      ]);
    }

    const chunkSize = 400;
    for (let i = 0; i < batchData.length; i += chunkSize) {
      const chunk = batchData.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const flat = chunk.flat();
      await pool.execute(
        `INSERT INTO \`gbb_transaksi_keluar\`
          (id_keluar, id_permintaan, tanggal_keluar, jam_keluar, shift_keluar, id_lot, no_palet, jenis_kopi, kg_keluar, tujuan)
         VALUES ${placeholders}
         ON DUPLICATE KEY UPDATE
          id_permintaan=VALUES(id_permintaan), tanggal_keluar=VALUES(tanggal_keluar), jam_keluar=VALUES(jam_keluar),
          shift_keluar=VALUES(shift_keluar), id_lot=VALUES(id_lot), no_palet=VALUES(no_palet),
          jenis_kopi=VALUES(jenis_kopi), kg_keluar=VALUES(kg_keluar), tujuan=VALUES(tujuan)`,
        flat
      );
      insertedKeluar += chunk.length;
    }
  }

  return { success: true, insertedPenerimaan, insertedKeluar };
}

module.exports = { syncGbbData, DEFAULT_GBB_SHEET_ID };
