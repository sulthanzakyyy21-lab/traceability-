/**
 * Column definitions for PA (Product Assurance) tables
 * SJA Traceability System - Form F/QC/01.030
 */
const PA_TABLE_COLUMNS_MAP = {
  pa_fwt_t1: [
    'Tanggal & Waktu', 'pH', 'TDS', 'Kekeruhan', 'Kesadahan*', 'Sisa Khlor',
    'Mangan', 'Besi', 'Warna', 'Aluminium', 'E. Coli', 'Total Coliform',
    'Pseudomonas Aeruginosa*', 'Noted'
  ],
  pa_fwt_t2: [
    'Tanggal & Waktu', 'pH', 'TDS', 'Kekeruhan', 'Kesadahan*', 'Sisa Khlor',
    'Mangan', 'Besi', 'Warna', 'Aluminium', 'E. Coli', 'Total Coliform',
    'Pseudomonas Aeruginosa*', 'Noted'
  ],
  pa_cip_t1: [
    'Stamp', 'Tanggal & Waktu', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity',
    'Swab', 'pH in line', 'Start Final Rinse RO', 'Finish Final Rinse RO', 'Keterangan'
  ],
  pa_cip_t2: [
    'Stamp', 'Tanggal', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity',
    'Swab', 'pH in line', 'Start Final Rinse RO', 'Finish Final Rinse RO'
  ],
  pa_emp_t1: [
    'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Team', 'Area', 'Jenis Uji',
    'Indikator E-coli (Negatif)', 'Indikator Coliform (<10)',
    'Indikator Enterobacteriaceae (100)', 'Indikator TPC (<3000)',
    'Spoilage Yeast & Mold (<100)', 'Noted'
  ],
  pa_emp_t2: [
    'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Team', 'Area', 'Jenis Uji',
    'Indikator E-coli (Negatif)', 'Indikator Coliform (<10)',
    'Indikator Enterobacteriaceae (Negatif)', 'Indikator TPC (<3000)',
    'Spoilage Yeast & Mold (<100)', 'Noted'
  ],
  pa_abe_t1: [
    'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Team', 'Area', 'Jenis Uji',
    'TPC', 'Yeast & Mold', 'Noted'
  ],
  pa_abe_t2: [
    'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Team', 'Area', 'Jenis Uji',
    'TPC', 'Yeast & Mold', 'Noted'
  ]
};

module.exports = {
  PA_TABLE_COLUMNS_MAP
};
