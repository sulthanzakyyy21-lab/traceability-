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

const STANDARD_ABE_POINTS = [
  { room: 'Room Hygiene 1', code: 'RH1', defaultName: 'Area Setelah Air Shower (RH1)' },
  { room: 'Room Hygiene 2', code: 'RH2', defaultName: 'Area Meja Kerja Operator (RH2)' },
  { room: 'Room Hygiene 3', code: 'RH3', defaultName: 'Area Dekat Belt Conveyor Perbatasan Transit (RH3)' },
  { room: 'Room Hygiene 4', code: 'RH4', defaultName: 'Area Akses Keluar (RH4)' },
  { room: 'Room Hygiene 5', code: 'RH5', defaultName: 'Area Pengemasan (RH5)' },
  { room: 'Room Hygiene 6', code: 'RH6', defaultName: 'Air Shower (RH6)' },
  { room: 'Lab Mikrobiologi', code: 'RH7', defaultName: 'Lab Mikrobiologi (RH7)' },
  { room: 'Lab Mikrobiologi', code: 'RH8', defaultName: 'LAF (RH8)' },
  { room: 'Lab Mikrobiologi', code: 'RH9', defaultName: 'Meja Preparasi Mikrobiologi (RH9)' },
];

async function getAbeChecklist(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_abe_t2' : 'pa_abe_t1';
  const cutoff = targetDate
    ? `${String(targetDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const items = await Promise.all(STANDARD_ABE_POINTS.map(async (pt, idx) => {
      let [rows] = await pool.query(
        `SELECT * FROM \`${tbl}\` 
         WHERE Tanggal <= ? 
           AND (\`Titik Uji\` LIKE ? OR \`Titik Uji\` LIKE ?)
           AND TPC IS NOT NULL AND TPC != '-'
         ORDER BY Tanggal DESC, id DESC LIMIT 1`,
        [cutoff, `%${pt.code}%`, `%RH ${pt.code.slice(2)}%`]
      );

      if (rows.length === 0 && isT2 && pt.room.includes('Lab')) {
        [rows] = await pool.query(
          `SELECT * FROM \`pa_abe_t1\` 
           WHERE Tanggal <= ? 
             AND (\`Titik Uji\` LIKE ? OR \`Titik Uji\` LIKE ?)
             AND TPC IS NOT NULL AND TPC != '-'
           ORDER BY Tanggal DESC, id DESC LIMIT 1`,
          [cutoff, `%${pt.code}%`, `%RH ${pt.code.slice(2)}%`]
        );
      }

      if (rows.length === 0) {
        [rows] = await pool.query(
          `SELECT * FROM \`${tbl}\` 
           WHERE (\`Titik Uji\` LIKE ? OR \`Titik Uji\` LIKE ?)
             AND TPC IS NOT NULL AND TPC != '-'
           ORDER BY Tanggal DESC, id DESC LIMIT 1`,
          [`%${pt.code}%`, `%RH ${pt.code.slice(2)}%`]
        );
      }

      const match = rows[0] || null;
      const tpcVal = match ? String(match.TPC ?? '-') : '-';
      const ymVal = match ? String(match['Yeast & Mold'] ?? '-') : '-';
      const pointTime = match && match['Waktu Analisa'] ? String(match['Waktu Analisa']).slice(0, 5) : '-';
      const pointTeam = match && match.Team ? match.Team : '-';
      const pointDate = match ? formatDmy(match.Tanggal) : '-';

      const tpcNum = parseFloat(tpcVal);
      const ymNum = parseFloat(ymVal);
      let status = 'Sesuai Standar';
      if (!match) {
        status = 'Data tidak ditemukan';
      } else if (!isNaN(tpcNum) && tpcNum > 1000) {
        status = 'TPC Melebihi Standar';
      } else if (!isNaN(ymNum) && ymNum > 1000) {
        status = 'YM Melebihi Standar';
      } else if (tpcVal === '-' && ymVal === '-') {
        status = 'Data tidak ditemukan';
      }

      return {
        no: idx + 1,
        room: pt.room,
        code: pt.code,
        titikUji: match ? (match['Titik Uji'] || pt.defaultName) : pt.defaultName,
        area: match?.Area || (pt.code.startsWith('RH7') || pt.code.startsWith('RH8') || pt.code.startsWith('RH9') ? 'QC' : 'Packing'),
        tanggal: pointDate,
        waktu: pointTime,
        team: pointTeam,
        waktuTeam: pointTime !== '-' ? `${pointTime} (${pointTeam})` : '-',
        tpc: tpcVal,
        tpcStandard: '1000 CFU/m³',
        ym: ymVal,
        ymStandard: '1000 CFU/m³',
        status,
        noted: match?.Noted || '-'
      };
    }));

    const distinctDates = [...new Set(items.map(it => it.tanggal).filter(t => t !== '-'))];
    const distinctWaktuTeams = [...new Set(items.map(it => it.waktuTeam).filter(w => w !== '-'))];

    return {
      tower: isT2 ? 'Tower 2' : 'Tower 1',
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      refForm: 'Form F/QC.2.5',
      sessionDate: distinctDates.join(' & ') || '-',
      sessionTime: items.find(it => it.waktu !== '-')?.waktu || '-',
      team: items.find(it => it.team !== '-')?.team || '-',
      waktuTeam: distinctWaktuTeams.join(' & ') || '-',
      totalItems: items.length,
      items
    };
  } catch (err) {
    console.error('getAbeChecklist error:', err.message);
    return null;
  }
}

module.exports = {
  getAbeChecklist
};
