const pool = require('../db');

function formatDmy(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

function calculateAverages(rows, numericColumns) {
  const avgs = {};
  if (!rows || rows.length === 0) return avgs;

  numericColumns.forEach(col => {
    let sum = 0, count = 0;
    rows.forEach(r => {
      const val = r[col];
      if (val === null || val === undefined || val === '' || val === '-') return;
      const num = parseFloat(String(val).replace(',', '.'));
      if (!isNaN(num)) {
        sum += num;
        count++;
      }
    });
    if (count > 0) {
      const avg = sum / count;
      avgs[col] = avg % 1 === 0 ? String(avg) : avg.toFixed(avg < 1 ? 3 : 2);
    }
  });
  return avgs;
}

async function getSessionCipRows(tower, equipKeywords, cutoff, excludeKeywords = []) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_cip_t2' : 'pa_cip_t1';
  const dateCol = isT2 ? 'Tanggal' : 'Tanggal & Waktu';

  try {
    const [cipRows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`${dateCol}\` <= ? ORDER BY id DESC LIMIT 500`,
      [cutoff]
    );

    const matched = cipRows.find(r => {
      const alat = (r.Peralatan || '').toLowerCase();
      if (excludeKeywords.some(ex => alat.includes(ex.toLowerCase()))) return false;
      return equipKeywords.some(kw => alat.includes(kw.toLowerCase()));
    });

    if (!matched) return null;

    const mDate = String(matched[dateCol] || matched.Stamp).slice(0, 10);
    const mTime = new Date(mDate).getTime();

    // Ambil semua baris pada sesi CIP terkait (toleransi 1.5 hari untuk pencucian lintas hari)
    const sessionRows = cipRows.filter(r => {
      const d = String(r[dateCol] || r.Stamp).slice(0, 10);
      const diffDays = Math.abs(new Date(d).getTime() - mTime) / (1000 * 3600 * 24);
      const alat = (r.Peralatan || '').toLowerCase();
      if (excludeKeywords.some(ex => alat.includes(ex.toLowerCase()))) return false;
      return equipKeywords.some(kw => alat.includes(kw.toLowerCase())) && diffDays <= 1.5;
    });

    const columns = isT2
      ? ['Tanggal', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity', 'Swab', 'pH in line']
      : ['Tanggal & Waktu', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity', 'Swab', 'pH in line'];

    const numCols = ['pH Lab', 'Conductivity', 'Swab'];
    return {
      tableName: tbl,
      columns,
      rows: sessionRows,
      averages: calculateAverages(sessionRows, numCols),
      sessionDate: formatDmy(matched[dateCol] || matched.Stamp),
    };
  } catch (err) {
    console.error('getSessionCipRows error:', err.message);
    return null;
  }
}

async function getWaterProcessTable(tower, cutoff) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_fwt_t2' : 'pa_fwt_t1';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` <= ? ORDER BY \`Tanggal & Waktu\` DESC LIMIT 24`,
      [cutoff]
    );

    const columns = [
      'Tanggal & Waktu', 'pH', 'TDS', 'Kekeruhan', 'Kesadahan*', 'Sisa Khlor',
      'Mangan', 'Besi', 'Warna', 'Aluminium', 'E. Coli', 'Total Coliform'
    ];

    const numCols = ['pH', 'TDS', 'Kekeruhan', 'Kesadahan*', 'Sisa Khlor', 'Mangan', 'Besi', 'Warna', 'Aluminium'];
    return {
      tableName: tbl,
      columns,
      rows,
      averages: calculateAverages(rows, numCols),
    };
  } catch (err) {
    console.error('getWaterProcessTable error:', err.message);
    return null;
  }
}

async function getPackingEmpTable(tower, cutoff) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_emp_t2' : 'pa_emp_t1';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE Area LIKE '%Packing%' AND Tanggal <= ? ORDER BY Tanggal DESC, id DESC LIMIT 15`,
      [cutoff]
    );

    const columns = [
      'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Area', 'Jenis Uji',
      'Indikator E-coli (Negatif)', 'Indikator Coliform (<10)',
      'Indikator TPC (<3000)', 'Spoilage Yeast & Mold (<100)'
    ];

    const numCols = ['Indikator Coliform (<10)', 'Indikator TPC (<3000)', 'Spoilage Yeast & Mold (<100)'];
    return {
      tableName: tbl,
      columns,
      rows,
      averages: calculateAverages(rows, numCols),
    };
  } catch (err) {
    console.error('getPackingEmpTable error:', err.message);
    return null;
  }
}

module.exports = {
  calculateAverages,
  getSessionCipRows,
  getWaterProcessTable,
  getPackingEmpTable,
};
