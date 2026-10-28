const pool = require('../db');
const { PLANT1_CHECKLIST, PLANT2_CHECKLIST } = require('./paCipDefinitions');

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

async function getExtractionCipChecklist(tower, extractionDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_cip_t2' : 'pa_cip_t1';
  const dateCol = isT2 ? 'Tanggal' : 'Tanggal & Waktu';
  const defs = isT2 ? PLANT2_CHECKLIST : PLANT1_CHECKLIST;

  const cutoff = extractionDate
    ? `${String(extractionDate).slice(0, 10)} 23:59:59`
    : new Date().toISOString().slice(0, 10) + ' 23:59:59';

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`${dateCol}\` <= ? ORDER BY \`${dateCol}\` DESC, id DESC`,
      [cutoff]
    );

    let recordedCount = 0;
    const items = defs.map(def => {
      const matched = rows.find(r => {
        const p = cleanStr(r.Peralatan);
        if (p === cleanStr(def.item)) return true;
        if (def.aliases && def.aliases.some(a => cleanStr(a) === p)) return true;
        return false;
      });

      if (!matched) {
        return {
          no: def.no,
          item: def.item,
          floor: def.floor,
          swabTarget: def.swab || '-',
          waktuCip: '-',
          phLab: '',
          conductivity: '',
          swabResult: '',
          phInline: '',
          rinse: '',
          status: 'Belum tercatat'
        };
      }

      recordedCount++;
      const timeVal = matched.Waktu ? String(matched.Waktu).slice(0, 5) : '';
      const datePart = formatDmy(matched[dateCol] || matched.Stamp).slice(0, 10);
      const cipTime = timeVal ? `${datePart} ${timeVal}` : datePart;

      return {
        no: def.no,
        item: def.item,
        floor: def.floor,
        swabTarget: def.swab || '-',
        waktuCip: cipTime,
        phLab: matched['pH Lab'] || '',
        conductivity: matched.Conductivity || '',
        swabResult: matched.Swab !== null && matched.Swab !== undefined ? String(matched.Swab) : '',
        phInline: matched['pH in line'] || '',
        rinse: (matched['Start Final Rinse RO'] && matched['Finish Final Rinse RO'] && matched['Start Final Rinse RO'] !== '0')
          ? `${matched['Start Final Rinse RO']} - ${matched['Finish Final Rinse RO']}`
          : '',
        status: 'OK'
      };
    });

    const validDates = items.filter(i => i.waktuCip !== '-').map(i => i.waktuCip.slice(0, 10));
    const latestDate = validDates[0] || '-';

    return {
      tower: isT2 ? 2 : 1,
      plantName: isT2 ? 'Plant 2' : 'Plant 1',
      tableName: tbl,
      totalItems: defs.length,
      recordedItems: recordedCount,
      latestCipDate: latestDate,
      items
    };
  } catch (err) {
    console.error('getExtractionCipChecklist error:', err.message);
    return null;
  }
}

module.exports = {
  getExtractionCipChecklist
};
