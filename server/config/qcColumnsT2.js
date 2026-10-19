/**
 * Column definitions for QC Tower 2 tables
 */
const QC_TABLE_COLUMNS_MAP_T2 = {
  qc_rework_t2: [
    'Tanggal Rework', 'Lokasi Sampling', 'Batch Finished Good', 'Produk Finished Good', 'Produk',
    'Batch', 'No Pack', 'Total berat Bahan rework', 'Verifikasi', 'Tanggal Analisa',
    'Visual / Foreign Matter', 'Brix (°brix) / TS (%)', 'pH / Suhu (°C)', 'Cuptest Wangi',
    'Cuptest Pahit', 'Cuptest Asam', 'Viscosity (cP)', 'Density (g/L)', 'Torque', 'Suhu',
    'Spindle / RPM', 'Level Rework', 'Screening Test', 'Transfer ke-', 'Status',
    'Di Analisa Oleh', 'Formula', 'Target TS',
  ],

  qc_dryer_t2: [
    'Stamp', 'Produk', 'Mode', 'Final Tank', 'Batch', 'Tanggal', 'Nomor Box', 'Jam',
    'Kadar Air (%)', 'Density (g/L)', 'FM', 'Vis', 'Warna', 'Brix (°brix)', 'Ph',
    'Floating Particles', 'Fluidity', 'Solubility (s)', 'Cup Test Wangi', 'Cup Test Pahit',
    'Cup Test Asam', 'Cup Test Body', 'Cup Test Sepet', 'Status', 'Keterangan', 'TTD',
  ],

  qc_feed_tank_t2: [
    'Stamp', 'Produk', 'Final Tank', 'Batch', 'Tanggal', 'Jam', 'Vis/FM', 'Brix (°brix)',
    'TS (%)', 'pH', 'Cup Test Wangi', 'Cup Test Pahit', 'Cup Test Asam', 'Keterangan', 'TTD',
  ],

  qc_final_tank_t2: [
    'Stamp', 'Produk', 'Final Tank', 'Batch', 'Pure Aroma (kg)', 'Tanggal', 'Jam', 'Level',
    'T (°C)', 'Vis/FM', 'Viskositas Spindel', 'Viskositas RPM', 'Viskositas Suhu (°C)',
    'Viskositas %Torq', 'Viskositas cP', 'Density (g/L)', 'Brix (°brix)', 'TS (%)', 'pH',
    'Screening Test', 'Cup Test Wangi', 'Cup Test Pahit', 'Cup Test Asam', 'Keterangan', 'TTD',
  ],

  qc_evaporasi_t2: [
    'Stamp', 'Produk', 'Final Tank', 'Batch', 'Tanggal', 'Jam', 'Tank Sistem', 'Vis/FM',
    'Viskositas Spindel', 'Viskositas RPM', 'Viskositas Suhu (°C)', 'Viskositas %Torq', 'Viskositas cP',
    'Density (g/L)', 'Brix (°brix)', 'TS (%)', 'pH', 'Screening Test', 'Cup Test Wangi',
    'Cup Test Pahit', 'Cup Test Asam', 'Keterangan', 'TTD',
  ],

  qc_tank_system_t2: [
    'Stamp', 'Batch', 'Produk', 'Tanggal', 'Tank System', 'Level (%)', 'Jam',
    'Separasi dari Tank System', 'Vis/FM', 'Brix (°brix)', 'TS (%)', 'pH',
    'Cup Test Wangi', 'Cup Test Pahit', 'Cup Test Asam', 'Screening Test', 'Keterangan', 'TTD',
  ],

  qc_pure_aroma_t2: [
    'Stamp', 'Tanggal', 'Jam', 'Nama Produk', 'Batch', 'Vis/FM', 'T (°C)', 'Brix (°brix)',
    'TS (%)', 'pH', 'Cup Test', 'Keterangan', 'TTD',
  ],

  qc_hydro_t2: [
    'Stamp', 'Produk', 'Mode Ekstraksi', 'Batch', 'Tanggal', 'Silo Degassing', 'Percolator',
    'Jam', 'Vis/FM', 'Brix (°brix)', 'TS (%)', 'pH', 'Cup Test Wangi', 'Cup Test Pahit',
    'Cup Test Asam', 'T (°C)', 'Keterangan', 'TTD',
  ],

  qc_aroma_t2: [
    'Stamp', 'Produk', 'Mode Ekstraksi', 'Batch', 'Tanggal', 'Silo Degassing', 'Percolator',
    'Jam', 'Vis/FM', 'Brix (°brix)', 'TS (%)', 'pH', 'Cup Test Wangi', 'Cup Test Pahit',
    'Cup Test Asam', 'T (°C)', 'Keterangan', 'PIC',
  ],

  qc_grinding_t2: [
    'Stamp', 'Jenis Perco', 'Produk', 'Feeder (%)', 'Tanggal', 'Jam', 'Batch',
    'Silo Degassing', 'Percolatotor', 'FM', '<850', '850-<1000', '1000-<2350', '2350-<3350',
    '3350-<4000', '4000-<5600', '5600-<6300', '>6300', 'Kadar air (%)', 'Density (gr/L)',
    'RGA/RGB', 'Berat Mesh (gram)', 'Keterangan', 'TTD', 'Mesh <1000', 'Mesh >4000',
  ],

  qc_mesh_t2: [
    'Stamp', 'Produk', 'Tanggal', 'Jam', 'Batch', 'Nomor Box',
    'Mesh Test (gram) > 600', 'Mesh Test (gram) 425-600', 'Mesh Test (gram) 300-425',
    'Mesh Test (gram) 250-300', 'Mesh Test (gram) 212-250', 'Mesh Test (gram) 180-212',
    'Mesh Test (gram) 150-180', 'Mesh Test (gram) <150', 'Keterangan', 'TTD',
    'Mesh <180', 'Mesh 180 - 425', 'Mesh >425',
  ],
};

module.exports = { QC_TABLE_COLUMNS_MAP_T2 };
