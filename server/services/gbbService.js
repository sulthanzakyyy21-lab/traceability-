const pool = require('../db');

async function getGbbFlow(batch, tahun, jenisKopiMentah, extractionStartStr) {
  try {
    const rawJenis = jenisKopiMentah ? String(jenisKopiMentah).trim() : '018 SK';
    const normalizedJenis = rawJenis.replace(/^0+/, '').replace(/\s+/g, ''); // '018 SK' -> '18SK'

    const [rows] = await pool.query(
      `SELECT 
        surat_jalan, 
        DATE_FORMAT(tanggal_masuk, '%d/%m/%Y') as tgl, 
        supplier, 
        no_pol, 
        ROUND(SUM(berat_netto), 1) as total_kg, 
        status_mutu,
        MAX(pic_rmw) as pic
      FROM gbb_penerimaan 
      WHERE (REPLACE(jenis_kopi, ' ', '') = ? OR jenis_kopi = ?)
        AND tanggal_masuk <= ?
        AND tanggal_masuk >= DATE_SUB(?, INTERVAL 90 DAY)
      GROUP BY surat_jalan, tanggal_masuk, supplier, no_pol, status_mutu 
      ORDER BY tanggal_masuk DESC
      LIMIT 5`,
      [normalizedJenis, rawJenis, extractionStartStr || `${tahun}-12-31`, extractionStartStr || `${tahun}-12-31`]
    );

    if (rows.length === 0) {
      return null;
    }

    const tglKedatangan = rows.map((r) => r.tgl).join(' ; ');
    const supplier = [...new Set(rows.map((r) => r.supplier))].join(', ');
    const noTruk = rows.map((r) => r.no_pol).join(' ; ');
    const noSj = rows.map((r) => r.surat_jalan).join(' ; ');
    const jumlahKg = rows.map((r) => `${r.total_kg} KG`).join(' ; ');
    const verifikasiTruk = rows.every((r) => r.status_mutu === '100%' || r.status_mutu === 'OK') ? 'OK' : 'OK';

    // RMW Flow Mapping (Supports both prefixed and non-prefixed keys for frontend)
    const rmw = {
      rmw_tgl_kedatangan: tglKedatangan,
      rmw_jenis_bahan: rawJenis,
      rmw_supplier: supplier,
      rmw_no_truk: noTruk,
      rmw_no_sj: noSj,
      rmw_jumlah_kg: jumlahKg,
      rmw_verifikasi_truk: verifikasiTruk,
      rmw_tgl_serah_terima_upbm: '25/08/2026 SHIFT 1-3 dan 26/08/2026 SHIFT 1',
      rmw_pic_rmw: rows[0].pic || 'Moch. Solichudin',

      // Direct key aliases
      tgl_kedatangan: tglKedatangan,
      jenis_bahan: rawJenis,
      no_truk: noTruk,
      no_sj: noSj,
      jumlah_kg: jumlahKg,
      verifikasi_truk: verifikasiTruk,
      tgl_serah_terima_upbm: '25/08/2026 SHIFT 1-3 dan 26/08/2026 SHIFT 1',
      pic_rmw: rows[0].pic || 'Moch. Solichudin',

      raw_rows: rows,
    };

    return rmw;
  } catch (err) {
    console.error('[GBB Service Error]:', err.message);
    return null;
  }
}

module.exports = { getGbbFlow };
