const pool = require('../db');

function formatDmy(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const pad = n => String(n).padStart(2, '0');
  const dmy = `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
  const hrs = pad(dt.getHours());
  const mins = pad(dt.getMinutes());
  return (hrs !== '00' || mins !== '00') ? `${dmy} ${hrs}:${mins}` : dmy;
}

function cleanStr(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const PLANT1_FINAL_TANKS = [
  { no: 1, item: 'Final Tank 1 (Final Rinse)', targetTank: 'Final Tank 1', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 2, item: 'Final Tank 2 (Final Rinse)', targetTank: 'Final Tank 2', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 3, item: 'Final Tank 3 (Final Rinse)', targetTank: 'Final Tank 3', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 4, item: 'Final Tank 1 (Swab ATP)', targetTank: 'Final Tank 1', stage: 'Swab ATP', floor: 'Lt. 1' },
  { no: 5, item: 'Final Tank 2 (Swab ATP)', targetTank: 'Final Tank 2', stage: 'Swab ATP', floor: 'Lt. 1' },
  { no: 6, item: 'Final Tank 3 (Swab ATP)', targetTank: 'Final Tank 3', stage: 'Swab ATP', floor: 'Lt. 1' }
];

const PLANT2_FINAL_TANKS = [
  { no: 1, item: 'Final Tank 100 (Final Rinse)', targetTank: 'Final Tank 100', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 2, item: 'Final Tank 200 (Final Rinse)', targetTank: 'Final Tank 200', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 3, item: 'Final Tank 300 (Final Rinse)', targetTank: 'Final Tank 300', stage: 'Final Rinse', floor: 'Lt. 1' },
  { no: 4, item: 'Final Tank 100 (Swab ATP)', targetTank: 'Final Tank 100', stage: 'Swab ATP', floor: 'Lt. 1' },
  { no: 5, item: 'Final Tank 200 (Swab ATP)', targetTank: 'Final Tank 200', stage: 'Swab ATP', floor: 'Lt. 1' },
  { no: 6, item: 'Final Tank 300 (Swab ATP)', targetTank: 'Final Tank 300', stage: 'Swab ATP', floor: 'Lt. 1' }
];

async function getFinalTankCipChecklist(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_cip_t2' : 'pa_cip_t1';
  const dateCol = isT2 ? 'Tanggal' : 'Tanggal & Waktu';
  const defs = isT2 ? PLANT2_FINAL_TANKS : PLANT1_FINAL_TANKS;
  const cutoff = targetDate
    ? `${String(targetDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`${dateCol}\` <= ? ORDER BY \`${dateCol}\` DESC, id DESC LIMIT 500`,
      [cutoff]
    );

    const cipRows = rows.filter(r => {
      const p = cleanStr(r.Peralatan);
      const isFt = defs.some(def => cleanStr(def.targetTank) === p);
      if (!isFt) return false;
      return parseFloat(r['pH Lab']) > 0 || parseFloat(r.Conductivity) > 0 || (r.Swab && r.Swab !== '0' && r.Swab !== '');
    });

    if (cipRows.length === 0) {
      return {
        tower: isT2 ? 'Tower 2' : 'Tower 1',
        plantName: isT2 ? 'Plant 2' : 'Plant 1',
        tableName: tbl,
        totalItems: defs.length,
        recordedItems: 0,
        latestCipDate: '-',
        averages: null,
        items: defs.map(def => ({
          no: def.no,
          item: def.item,
          peralatan: def.targetTank,
          stage: def.stage,
          floor: def.floor,
          tanggal: '-',
          teamGroup: '-',
          waktu: '-',
          waktuCip: '-',
          samplingKe: '1',
          visual: 'OK',
          phLab: '-',
          conductivity: '-',
          swabResult: '-',
          phInline: '-',
          verifikasiTangki: '-',
          status: 'Belum tercatat'
        }))
      };
    }

    const latestCipRow = cipRows[0];
    const latestDateTime = new Date(latestCipRow.Stamp || latestCipRow[dateCol]).getTime();

    const sessionRows = rows.filter(r => {
      const p = cleanStr(r.Peralatan);
      const isFt = defs.some(def => cleanStr(def.targetTank) === p);
      if (!isFt) return false;
      const dt = new Date(r.Stamp || r[dateCol]).getTime();
      return Math.abs(latestDateTime - dt) <= 48 * 3600 * 1000;
    });

    let recordedCount = 0;
    const sessionDates = [];
    const items = defs.map(def => {
      const equipRows = sessionRows.filter(r => cleanStr(r.Peralatan) === cleanStr(def.targetTank));
      let row = null;
      if (def.stage === 'Final Rinse') {
        row = equipRows.find(r => parseFloat(r['pH Lab']) > 0 || parseFloat(r.Conductivity) > 0);
      } else {
        row = equipRows.find(r => r.Swab !== null && r.Swab !== undefined && r.Swab !== '' && r.Swab !== '0');
      }

      if (!row) {
        return {
          no: def.no,
          item: def.item,
          peralatan: def.targetTank,
          stage: def.stage,
          floor: def.floor,
          tanggal: '-',
          teamGroup: '-',
          waktu: '-',
          waktuCip: '-',
          samplingKe: '1',
          visual: 'OK',
          phLab: '-',
          conductivity: '-',
          swabResult: '-',
          phInline: '-',
          verifikasiTangki: '-',
          status: 'Belum tercatat'
        };
      }

      recordedCount++;
      const timeVal = row.Waktu ? String(row.Waktu).slice(0, 5) : '';
      const datePart = formatDmy(row.Stamp || row[dateCol]).slice(0, 10);
      sessionDates.push(datePart);

      const phVal = def.stage === 'Final Rinse' && parseFloat(row['pH Lab']) > 0 ? String(row['pH Lab']) : '-';
      const condVal = def.stage === 'Final Rinse' && parseFloat(row.Conductivity) > 0 ? String(row.Conductivity) : '-';
      const swabVal = def.stage === 'Swab ATP' && (row.Swab !== null && row.Swab !== undefined && row.Swab !== '' && row.Swab !== '0') ? String(row.Swab) : '-';

      return {
        no: def.no,
        item: def.item,
        peralatan: def.targetTank,
        stage: def.stage,
        floor: def.floor,
        tanggal: datePart,
        teamGroup: '-',
        waktu: timeVal || '-',
        waktuCip: timeVal ? `${datePart} ${timeVal}` : datePart,
        samplingKe: '1',
        visual: 'OK',
        phLab: phVal,
        conductivity: condVal,
        swabResult: swabVal,
        phInline: parseFloat(row['pH in line']) > 0 ? String(row['pH in line']) : '-',
        verifikasiTangki: def.stage === 'Swab ATP' ? 'OK' : '-',
        status: 'OK'
      };
    });

    const uniqueDates = [...new Set(sessionDates.filter(Boolean))].sort();
    const latestCipDate = uniqueDates.length > 1
      ? `${uniqueDates[0].slice(0, 2)}-${uniqueDates[uniqueDates.length - 1]}`
      : (uniqueDates[0] || formatDmy(latestCipRow.Stamp || latestCipRow[dateCol]).slice(0, 10));

    return {
      tower: isT2 ? 'Tower 2' : 'Tower 1',
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      totalItems: defs.length,
      recordedItems: recordedCount,
      latestCipDate,
      averages: null,
      items
    };
  } catch (err) {
    console.error('getFinalTankCipChecklist error:', err.message);
    return null;
  }
}

module.exports = { getFinalTankCipChecklist, PLANT1_FINAL_TANKS, PLANT2_FINAL_TANKS };
