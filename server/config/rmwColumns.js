const RMW_TABLE_COLUMNS_MAP = {
  gbb_penerimaan: [
    'id_lot',
    'tanggal_masuk',
    'gudang',
    'id_lokasi',
    'no_lot',
    'jenis_kopi',
    'kadar_air',
    'no_pol',
    'supplier',
    'no_palet',
    'karung_masuk',
    'berat_bruto',
    'berat_netto',
    'no_po',
    'surat_jalan',
    'status_mutu',
    'pic_rmw',
  ],
  gbb_transaksi_keluar: [
    'id_keluar',
    'id_permintaan',
    'tanggal_keluar',
    'jam_keluar',
    'shift_keluar',
    'id_lot',
    'no_palet',
    'jenis_kopi',
    'kg_keluar',
    'tujuan',
  ],
};

module.exports = { RMW_TABLE_COLUMNS_MAP };

