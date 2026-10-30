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
      `SELECT * FROM \`${tbl}\` WHERE (COALESCE(\`Stamp\`, \`${dateCol}\`) <= ? OR \`${dateCol}\` <= ?) ORDER BY COALESCE(\`Stamp\`, \`${dateCol}\`) DESC, id DESC`,
      [cutoff, cutoff]
    );

    let recordedCount = 0;
    const getRowDate = (r) => (!isT2 && r && r.Stamp) ? r.Stamp : (r[dateCol] || r.Stamp);

    const items = defs.map(def => {
      const matched = rows.filter(r => {
        const p = cleanStr(r.Peralatan);
        if (p === cleanStr(def.item)) return true;
        if (def.aliases && def.aliases.some(a => cleanStr(a) === p)) return true;
        return false;
      });

      if (matched.length === 0) {
        return {
          no: def.no,
          item: def.item,
          floor: def.floor,
          swabTarget: def.swab || '-',
          waktuCip: '-',
          phLab: '-',
          conductivity: '-',
          swabResult: '-',
          phInline: '-',
          rinse: '-',
          status: 'Belum tercatat'
        };
      }

      recordedCount++;
      const latestRow = matched[0];
      const latestDateTime = new Date(getRowDate(latestRow)).getTime();

      const sessionRows = matched.filter(r => {
        const dt = new Date(getRowDate(r)).getTime();
        return Math.abs(latestDateTime - dt) <= 48 * 3600 * 1000;
      });

      const labRow = sessionRows.find(r => parseFloat(r['pH Lab']) > 0 || parseFloat(r.Conductivity) > 0) || latestRow;
      const swabRow = sessionRows.find(r => r.Swab !== null && r.Swab !== undefined && r.Swab !== '' && r.Swab !== '0') || latestRow;
      const rinseRow = sessionRows.find(r => r['Start Final Rinse RO'] && r['Start Final Rinse RO'] !== '0');
      const inlineRow = sessionRows.find(r => parseFloat(r['pH in line']) > 0);

      const timeVal = latestRow.Waktu ? String(latestRow.Waktu).slice(0, 5) : '';
      const datePart = formatDmy(getRowDate(latestRow)).slice(0, 10);
      const cipTime = timeVal ? `${datePart} ${timeVal}` : datePart;

      const phLabVal = parseFloat(labRow['pH Lab']) > 0 
        ? String(labRow['pH Lab']) 
        : (parseFloat(latestRow['pH Lab']) > 0 ? String(latestRow['pH Lab']) : '-');

      const condVal = parseFloat(labRow.Conductivity) > 0 
        ? String(labRow.Conductivity) 
        : (parseFloat(latestRow.Conductivity) > 0 ? String(latestRow.Conductivity) : '-');

      const swabVal = (swabRow.Swab !== null && swabRow.Swab !== undefined && swabRow.Swab !== '') 
        ? String(swabRow.Swab) 
        : (latestRow.Swab !== null && latestRow.Swab !== undefined ? String(latestRow.Swab) : '-');

      const rinseSource = rinseRow || latestRow;
      const rinseVal = (rinseSource['Start Final Rinse RO'] && rinseSource['Finish Final Rinse RO'] && rinseSource['Start Final Rinse RO'] !== '0')
        ? `${rinseSource['Start Final Rinse RO']} - ${rinseSource['Finish Final Rinse RO']}`
        : '-';

      const inlineSource = inlineRow || latestRow;
      const phInlineVal = parseFloat(inlineSource['pH in line']) > 0 ? String(inlineSource['pH in line']) : '-';

      return {
        no: def.no,
        item: def.item,
        floor: def.floor,
        swabTarget: def.swab || '-',
        waktuCip: cipTime,
        phLab: phLabVal,
        conductivity: condVal,
        swabResult: swabVal,
        phInline: phInlineVal,
        rinse: rinseVal,
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
