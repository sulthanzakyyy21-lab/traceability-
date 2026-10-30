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

const EVAPORATOR_CHECKLIST = [
  { no: 1, item: 'Evap K1', floor: 'Lt. 2', swab: '-' },
  { no: 2, item: 'Evap K2', floor: 'Lt. 2', swab: '-' },
  { no: 3, item: 'Evap K3', floor: 'Lt. 2', swab: '-' },
  { no: 4, item: 'Evap K4', floor: 'Lt. 2', swab: '-' },
  { no: 5, item: 'PHE Evap', floor: 'Lt. 2', swab: '-' },
];

async function getEvaporatorCipChecklist(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_cip_t2' : 'pa_cip_t1';
  const dateCol = isT2 ? 'Tanggal' : 'Tanggal & Waktu';
  const cutoff = targetDate
    ? `${String(targetDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`${dateCol}\` <= ? ORDER BY \`${dateCol}\` DESC, id DESC LIMIT 500`,
      [cutoff]
    );

    const evapRows = rows.filter(r => {
      const p = cleanStr(r.Peralatan);
      return EVAPORATOR_CHECKLIST.some(def => cleanStr(def.item) === p);
    });

    if (evapRows.length === 0) {
      return {
        tower: isT2 ? 'Tower 2' : 'Tower 1',
        plantName: isT2 ? 'Plant 2' : 'Plant 1',
        tableName: tbl,
        totalItems: EVAPORATOR_CHECKLIST.length,
        recordedItems: 0,
        latestCipDate: '-',
        averages: null,
        items: EVAPORATOR_CHECKLIST.map(def => ({
          no: def.no,
          item: def.item,
          peralatan: def.item,
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

    const latestEvapRow = evapRows[0];
    const latestDateTime = new Date(latestEvapRow.Stamp || latestEvapRow[dateCol]).getTime();

    const sessionRows = evapRows.filter(r => {
      const dt = new Date(r.Stamp || r[dateCol]).getTime();
      return Math.abs(latestDateTime - dt) <= 36 * 3600 * 1000;
    });

    let recordedCount = 0;
    const items = EVAPORATOR_CHECKLIST.map(def => {
      const matched = sessionRows.filter(r => cleanStr(r.Peralatan) === cleanStr(def.item));
      if (matched.length === 0) {
        return {
          no: def.no,
          item: def.item,
          peralatan: def.item,
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
      const row = matched[0];
      const timeVal = row.Waktu ? String(row.Waktu).slice(0, 5) : '';
      const datePart = formatDmy(row.Stamp || row[dateCol]).slice(0, 10);

      return {
        no: def.no,
        item: def.item,
        peralatan: def.item,
        floor: def.floor,
        tanggal: datePart,
        teamGroup: '-',
        waktu: timeVal || '-',
        waktuCip: timeVal ? `${datePart} ${timeVal}` : datePart,
        samplingKe: '1',
        visual: 'OK',
        phLab: parseFloat(row['pH Lab']) > 0 ? String(row['pH Lab']) : '-',
        conductivity: parseFloat(row.Conductivity) > 0 ? String(row.Conductivity) : '-',
        swabResult: (row.Swab !== null && row.Swab !== undefined && row.Swab !== '' && row.Swab !== '0') ? String(row.Swab) : '-',
        phInline: parseFloat(row['pH in line']) > 0 ? String(row['pH in line']) : '-',
        verifikasiTangki: '-',
        status: 'OK'
      };
    });

    const latestDatePart = formatDmy(latestEvapRow.Stamp || latestEvapRow[dateCol]).slice(0, 10);

    return {
      tower: isT2 ? 'Tower 2' : 'Tower 1',
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      totalItems: EVAPORATOR_CHECKLIST.length,
      recordedItems: recordedCount,
      latestCipDate: latestDatePart,
      averages: null,
      items
    };
  } catch (err) {
    console.error('getEvaporatorCipChecklist error:', err.message);
    return null;
  }
}

module.exports = {
  getEvaporatorCipChecklist,
  EVAPORATOR_CHECKLIST
};
