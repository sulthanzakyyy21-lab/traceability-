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
      if (!isNaN(num) && (num > 0 || col.toLowerCase().includes('kekeruhan'))) {
        sum += num;
        count++;
      }
    });
    if (count > 0) {
      const avg = sum / count;
      const isPh = col.toLowerCase().includes('ph');
      const isTds = col.toLowerCase().includes('tds');
      avgs[col] = isTds ? String(Math.round(avg)) : (isPh ? avg.toFixed(3) : (avg % 1 === 0 ? String(avg) : avg.toFixed(avg < 1 ? 3 : 2)));
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
      ? ['Tanggal', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity', 'Swab', 'pH in line', 'Start Final Rinse RO', 'Finish Final Rinse RO']
      : ['Tanggal & Waktu', 'Waktu', 'Peralatan', 'pH Lab', 'Conductivity', 'Swab', 'pH in line', 'Start Final Rinse RO', 'Finish Final Rinse RO', 'Keterangan'];

    return {
      tableName: tbl,
      columns,
      rows: sessionRows,
      averages: null,
      sessionDate: formatDmy(matched[dateCol] || matched.Stamp),
    };
  } catch (err) {
    console.error('getSessionCipRows error:', err.message);
    return null;
  }
}

async function getWaterProcessTable(tower, cutoff, extractionDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_fwt_t2' : 'pa_fwt_t1';
  const ymd = extractionDate ? String(extractionDate).slice(0, 10) : String(cutoff).slice(0, 10);
  try {
    const [weeklyRows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` <= ? AND (\`Kesadahan*\` > 0 OR Noted LIKE ? OR \`Mangan\` > 0) ORDER BY \`Tanggal & Waktu\` DESC LIMIT 1`,
      [cutoff, '%mingguan%']
    );
    let [dailyRows] = await pool.query(`SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` LIKE CONCAT(?, '%') ORDER BY \`Tanggal & Waktu\` ASC`, [ymd]);
    if (!dailyRows || dailyRows.length === 0) {
      [dailyRows] = await pool.query(`SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` <= ? ORDER BY \`Tanggal & Waktu\` DESC LIMIT 12`, [cutoff]);
    }
    const validDaily = (dailyRows && dailyRows.length > 8) ? dailyRows.filter(r => String(r['Tanggal & Waktu'] || '').slice(11, 16) >= '02:00') : (dailyRows || []);
    const combinedRows = [];
    if (weeklyRows && weeklyRows.length > 0) combinedRows.push({ ...weeklyRows[0], Kategori: 'Uji Mingguan Lab', _isWeekly: true });
    validDaily.forEach(r => combinedRows.push({ ...r, Kategori: 'Harian Ekstraksi', _isWeekly: false }));

    const columns = ['Kategori', 'Tanggal & Waktu', 'pH', 'TDS', 'Kekeruhan', 'Kesadahan*', 'Sisa Khlor', 'Mangan', 'Besi', 'Warna', 'Aluminium', 'E. Coli', 'Total Coliform'];
    const dailyAvgs = calculateAverages(validDaily, ['pH', 'TDS', 'Kekeruhan']);
    const w = weeklyRows[0] || {};
    const averages = {
      ...dailyAvgs,
      'Kesadahan*': w['Kesadahan*'] !== undefined && w['Kesadahan*'] !== null ? String(w['Kesadahan*']) : '-',
      'Sisa Khlor': w['Sisa Khlor'] !== undefined && w['Sisa Khlor'] !== null ? String(w['Sisa Khlor']) : '-',
      Mangan: w.Mangan !== undefined && w.Mangan !== null ? String(w.Mangan) : '-',
      Besi: w.Besi !== undefined && w.Besi !== null ? String(w.Besi) : '-',
      Warna: w.Warna !== undefined && w.Warna !== null ? String(w.Warna) : '-',
      Aluminium: w.Aluminium !== undefined && w.Aluminium !== null ? String(w.Aluminium) : '-',
      'E. Coli': (!w['E. Coli'] || w['E. Coli'] === '0') ? 'Negatif' : String(w['E. Coli']),
      'Total Coliform': (!w['Total Coliform'] || w['Total Coliform'] === '0') ? 'Negatif' : String(w['Total Coliform']),
    };
    return { tableName: tbl, columns, rows: combinedRows, averages };
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

    return {
      tableName: tbl,
      columns,
      rows,
      averages: null,
    };
  } catch (err) {
    console.error('getPackingEmpTable error:', err.message);
    return null;
  }
}

async function getPackingAbeTable(tower, cutoff) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_abe_t2' : 'pa_abe_t1';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE Area LIKE '%Packing%' AND Tanggal <= ? ORDER BY Tanggal DESC, id DESC LIMIT 15`,
      [cutoff]
    );

    const columns = [
      'Tanggal', 'Waktu Analisa', 'Titik Uji', 'Team', 'Area', 'Jenis Uji',
      'TPC', 'Yeast & Mold', 'Noted'
    ];

    return {
      tableName: tbl,
      columns,
      rows,
      averages: null,
    };
  } catch (err) {
    console.error('getPackingAbeTable error:', err.message);
    return null;
  }
}

module.exports = {
  calculateAverages,
  getSessionCipRows,
  getWaterProcessTable,
  getPackingEmpTable,
  getPackingAbeTable,
};
