const RMW_TABLE_METADATA = {
  gbb_penerimaan: {
    title: 'Penerimaan Biji Kopi (Inbound)',
    flow: 'INCOMING BAHAN',
    pic: 'RMW',
    tower: 'Non-Tower',
    description: 'Data Kedatangan Truk & Biji Kopi Mentah dari Supplier (Form F/SC/01.06)',
  },
  gbb_transaksi_keluar: {
    title: 'Pengeluaran ke UPBM (Outbound)',
    flow: 'INCOMING BAHAN',
    pic: 'RMW',
    tower: 'Non-Tower',
    description: 'Data Serah Terima Pengeluaran Biji Kopi Mentah dari GBB ke Silo UPBM (Form F/SC/01.05)',
  },
};

module.exports = { RMW_TABLE_METADATA };

