const pool = require('../db');

function formatDmy(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const pad = n => String(n).padStart(2, '0');
  if (dt.getHours() === 23 && dt.getMinutes() >= 55) {
    const nextDay = new Date(dt.getTime() + 5 * 60 * 1000);
    return `${pad(nextDay.getDate())}/${pad(nextDay.getMonth() + 1)}/${nextDay.getFullYear()}`;
  }
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

function formatIndoFullDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  let target = dt;
  if (dt.getHours() === 23 && dt.getMinutes() >= 55) {
    target = new Date(dt.getTime() + 5 * 60 * 1000);
  }
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayName = days[target.getDay()];
  const pad = n => String(n).padStart(2, '0');
  return `${dayName}, ${pad(target.getDate())} ${months[target.getMonth()]} ${target.getFullYear()}`;
}

async function getEmpInternalChecklist(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_emp_t2' : 'pa_emp_t1';
  const cutoff = targetDate
    ? `${String(targetDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE Area LIKE '%Packing%' AND \`Jenis Uji\` = 'EMP Zona 1' AND Tanggal <= ? ORDER BY Tanggal DESC, id ASC LIMIT 50`,
      [cutoff]
    );

    if (rows.length === 0) return null;

    const latestDate = rows[0].Tanggal;
    const sessionRows = rows.filter(r => new Date(r.Tanggal).getTime() === new Date(latestDate).getTime());
    const sessionDate = formatDmy(latestDate);
    const sessionDateIndo = formatIndoFullDate(latestDate);

    const items = sessionRows.map((r, idx) => ({
      no: idx + 1,
      tanggal: sessionDate,
      tanggalIndo: sessionDateIndo,
      jam: String(r['Waktu Analisa'] || '').slice(0, 5).replace(':', '.'),
      titikUji: r['Titik Uji'],
      team: r.Team || '-',
      area: r.Area || 'Packing',
      zona: r['Jenis Uji'] || 'EMP Zona 1',
      ecoli: !r['Indikator E-coli (Negatif)'] || r['Indikator E-coli (Negatif)'] === '0' ? 'Negatif' : String(r['Indikator E-coli (Negatif)']),
      coliform: String(r['Indikator Coliform (<10)'] ?? '0'),
      entero: !r['Indikator Enterobacteriaceae (100)'] || r['Indikator Enterobacteriaceae (100)'] === '0' || r['Indikator Enterobacteriaceae (Negatif)'] === '0' ? 'Negatif' : String(r['Indikator Enterobacteriaceae (100)'] || r['Indikator Enterobacteriaceae (Negatif)']),
      tpc: String(r['Indikator TPC (<3000)'] ?? '0'),
      ym: String(r['Spoilage Yeast & Mold (<100)'] ?? '0'),
      noted: r.Noted || '-',
      status: 'OK'
    }));

    return {
      tower: isT2 ? 'Tower 2' : 'Tower 1',
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      refForm: 'Form F/QC.2.35',
      sessionDate,
      sessionDateIndo,
      totalItems: items.length,
      items
    };
  } catch (err) {
    console.error('getEmpInternalChecklist error:', err.message);
    return null;
  }
}

async function getEmpExternalChecklist(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_emp_t2' : 'pa_emp_t1';
  const cutoff = targetDate
    ? `${String(targetDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE Area LIKE '%Packing%' AND (\`Jenis Uji\` = 'EMP Zona 1' OR \`Jenis Uji\` = 'EMP Zona 2') AND Tanggal <= ? ORDER BY Tanggal DESC, id ASC LIMIT 100`,
      [cutoff]
    );

    if (rows.length === 0) return null;

    const grouped = {};
    rows.forEach(r => {
      const d = new Date(r.Tanggal).toISOString().slice(0, 10);
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(r);
    });

    const targetKey = Object.keys(grouped).find(k => grouped[k].length === 15) || Object.keys(grouped)[0];
    const sessionRows = grouped[targetKey] || [];
    if (sessionRows.length === 0) return null;

    const sessionDate = formatDmy(sessionRows[0].Tanggal);
    const sessionDateIndo = formatIndoFullDate(sessionRows[0].Tanggal);

    const items = sessionRows.map((r, idx) => ({
      no: idx + 1,
      tanggal: sessionDate,
      tanggalIndo: sessionDateIndo,
      jam: String(r['Waktu Analisa'] || '').slice(0, 5).replace(':', '.'),
      titikUji: r['Titik Uji'],
      team: r.Team || '-',
      area: r.Area || 'Packing',
      zona: r['Jenis Uji'] || '-',
      tanggalUji: sessionDate,
      salmonella: 'Negative',
      sAureus: 'Negative',
      status: 'OK'
    }));

    return {
      tower: isT2 ? 'Tower 2' : 'Tower 1',
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      refForm: 'Form Patogen Eksternal',
      sessionDate,
      sessionDateIndo,
      totalItems: items.length,
      items
    };
  } catch (err) {
    console.error('getEmpExternalChecklist error:', err.message);
    return null;
  }
}

module.exports = {
  getEmpInternalChecklist,
  getEmpExternalChecklist
};
