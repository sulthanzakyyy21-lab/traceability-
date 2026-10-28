const pool = require('../db');

function formatDmy(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(dt.getDate())}/${pad(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

function getCutoff(targetDate) {
  if (!targetDate) return new Date().toISOString().slice(0, 10) + ' 23:59:59';
  return `${String(targetDate).slice(0, 10)} 23:59:59`;
}

async function getWaterProcessFlow(tower, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_fwt_t2' : 'pa_fwt_t1';
  const cutoff = getCutoff(targetDate);
  const ymd = targetDate ? String(targetDate).slice(0, 10) : null;

  try {
    const [weeklyRows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` <= ? AND (\`Kesadahan*\` > 0 OR Noted LIKE ? OR \`Mangan\` > 0) ORDER BY \`Tanggal & Waktu\` DESC LIMIT 1`,
      [cutoff, '%mingguan%']
    );

    let [dailyRows] = [];
    if (ymd) {
      [dailyRows] = await pool.query(
        `SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` LIKE CONCAT(?, '%') ORDER BY \`Tanggal & Waktu\` ASC`,
        [ymd]
      );
    }
    if (!dailyRows || dailyRows.length === 0) {
      [dailyRows] = await pool.query(
        `SELECT * FROM \`${tbl}\` WHERE \`Tanggal & Waktu\` <= ? ORDER BY \`Tanggal & Waktu\` DESC LIMIT 24`,
        [cutoff]
      );
    }

    if (dailyRows.length === 0 && weeklyRows.length === 0) return null;
    const weeklyRow = weeklyRows[0] || dailyRows[0] || {};

    let phSum = 0, phCount = 0, tdsSum = 0, tdsCount = 0, kekeruhanSum = 0, kekeruhanCount = 0;
    dailyRows.forEach(r => {
      const p = parseFloat(String(r.pH || '').replace(',', '.'));
      const t = parseFloat(String(r.TDS || '').replace(',', '.'));
      const k = parseFloat(String(r.Kekeruhan || '').replace(',', '.'));
      if (!isNaN(p) && p > 0) { phSum += p; phCount++; }
      if (!isNaN(t) && t > 0) { tdsSum += t; tdsCount++; }
      if (!isNaN(k)) { kekeruhanSum += k; kekeruhanCount++; }
    });

    const avgPh = phCount > 0 ? (phSum / phCount).toFixed(3) : (weeklyRow.pH || '-');
    const avgTds = tdsCount > 0 ? Math.round(tdsSum / tdsCount) : (weeklyRow.TDS || '-');
    const avgKekeruhan = kekeruhanCount > 0
      ? (kekeruhanSum / kekeruhanCount % 1 === 0 ? String(kekeruhanSum / kekeruhanCount) : (kekeruhanSum / kekeruhanCount).toFixed(2))
      : (weeklyRow.Kekeruhan || '0');

    const weeklyDate = formatDmy(weeklyRow['Tanggal & Waktu']);
    const dailyDate = formatDmy(dailyRows[0]?.['Tanggal & Waktu']);
    const sampleDate = (weeklyDate && dailyDate && weeklyDate !== dailyDate)
      ? `${weeklyDate} dan ${dailyDate}`
      : (dailyDate || weeklyDate || '-');

    const parseNum = (val) => (val === null || val === undefined || val === '') ? '0' : String(val);

    return {
      waktu_analisa: sampleDate,
      ph: String(avgPh).replace('.', ','),
      tds: String(avgTds),
      kekeruhan: String(avgKekeruhan),
      kesadahan: parseNum(weeklyRow['Kesadahan*']),
      sisa_khlor: parseNum(weeklyRow['Sisa Khlor']),
      mangan: parseNum(weeklyRow.Mangan),
      besi: parseNum(weeklyRow.Besi),
      warna: parseNum(weeklyRow.Warna),
      aluminium: parseNum(weeklyRow.Aluminium),
      e_coli: !weeklyRow['E. Coli'] || weeklyRow['E. Coli'] === '0' ? 'Negatif' : String(weeklyRow['E. Coli']),
      total_coliform: !weeklyRow['Total Coliform'] || weeklyRow['Total Coliform'] === '0' ? 'Negatif' : String(weeklyRow['Total Coliform']),
      pic_pa: 'Jefri & Reza',
    };
  } catch (err) {
    console.error('getWaterProcessFlow error:', err.message);
    return null;
  }
}

async function getLatestCip(tower, equipKeywords, targetDate) {
  const isT2 = String(tower).includes('2');
  const tbl = isT2 ? 'pa_cip_t2' : 'pa_cip_t1';
  const dateCol = isT2 ? 'Tanggal' : 'Tanggal & Waktu';
  const cutoff = getCutoff(targetDate);

  try {
    const [rows] = await pool.query(
      `SELECT * FROM \`${tbl}\` WHERE \`${dateCol}\` <= ? ORDER BY id DESC LIMIT 500`,
      [cutoff]
    );
    if (rows.length === 0) return null;

    const matched = rows.find(r => {
      const alat = (r.Peralatan || '').toLowerCase();
      return equipKeywords.some(kw => alat.includes(kw.toLowerCase()));
    });
    if (!matched) return null;

    return {
      tanggal: formatDmy(matched.Tanggal || matched['Tanggal & Waktu'] || matched.Stamp),
      alat: matched.Peralatan,
      ph_lab: matched['pH Lab'] || '-',
      conductivity: matched.Conductivity || '-',
      swab: matched.Swab || '0',
    };
  } catch (err) {
    console.error('getLatestCip error:', err.message);
    return null;
  }
}

async function getPaFlow(batch, tahun, tower, extractionDate, packingDate, dryerDate) {
  const isT2 = String(tower).includes('2');
  const refDate = extractionDate || packingDate;
  const cutoff = getCutoff(refDate);

  const water = await getWaterProcessFlow(tower, extractionDate);
  const cipExt = await getLatestCip(tower, ['ekstrak', 'c01', 'flash tank', 'kolom c03', 'tank system'], extractionDate);
  const cipEvap = await getLatestCip(tower, ['evap', 'k1', 'k2', 'phe evap'], extractionDate);
  const cipFinalTank = await getLatestCip(tower, ['final tank'], extractionDate);
  const cipDryer = await getLatestCip(tower, ['dryer', 'sfb', 'chamber'], extractionDate);
  const cipRework = await getLatestCip(tower, ['rework'], extractionDate);

  const empTbl = isT2 ? 'pa_emp_t2' : 'pa_emp_t1';
  let empDate = null;
  try {
    const [empRows] = await pool.query(
      `SELECT Tanggal FROM \`${empTbl}\` WHERE Area = 'Packing' AND Tanggal <= ? ORDER BY Tanggal DESC, id DESC LIMIT 1`,
      [cutoff]
    );
    if (empRows.length > 0) empDate = formatDmy(empRows[0].Tanggal);
  } catch {}

  const abeTbl = isT2 ? 'pa_abe_t2' : 'pa_abe_t1';
  let abeDate = null;
  try {
    const [abeRows] = await pool.query(
      `SELECT Tanggal FROM \`${abeTbl}\` WHERE Area LIKE '%Packing%' AND Tanggal <= ? ORDER BY Tanggal DESC, id DESC LIMIT 1`,
      [cutoff]
    );
    if (abeRows.length > 0) abeDate = formatDmy(abeRows[0].Tanggal);
  } catch {}

  const { getSessionCipRows, getWaterProcessTable, getPackingEmpTable } = require('./paTableHelper');
  const { getExtractionCipChecklist } = require('./paCipChecklistService');
  const { getDryerCipChecklist, getPackingCopChecklist } = require('./paDryerPackingService');
  const extCutoff = getCutoff(extractionDate);
  const waterTable = await getWaterProcessTable(tower, extCutoff);
  const extCipTable = await getSessionCipRows(tower, ['ekstrak', 'c01', 'flash tank', 'kolom c03', 'tank system', 'aroma', 'reboiler', 'hydrolis'], extCutoff, ['selang biru']);
  const evapCipTable = await getSessionCipRows(tower, ['evap', 'k1', 'k2', 'phe evap', 'final tank'], extCutoff);
  const dryerCipTable = await getSessionCipRows(tower, ['dryer', 'sfb', 'chamber', 'feed tank dryer', 'feed line'], extCutoff);
  const reworkCipTable = await getSessionCipRows(tower, ['rework'], extCutoff);
  const packingEmpTable = await getPackingEmpTable(tower, cutoff);
  const extCipChecklist = await getExtractionCipChecklist(tower, extractionDate);
  const dryerCipChecklist = await getDryerCipChecklist(tower, dryerDate || extractionDate);
  const packingCopChecklist = await getPackingCopChecklist(tower, packingDate || dryerDate || extractionDate);

  return {
    water,
    cip: { extraction: cipExt, evaporation: cipEvap, final_tank: cipFinalTank, dryer: cipDryer, rework: cipRework },
    tables: { water: waterTable, extraction: extCipTable, evaporation: evapCipTable, dryer: dryerCipTable, rework: reworkCipTable, packing: packingEmpTable },
    extraction_cip_checklist: extCipChecklist,
    dryer_cip_checklist: dryerCipChecklist,
    packing_cop_checklist: packingCopChecklist,
    env_swab_date: empDate,
    air_bacteria_date: abeDate,
  };
}

module.exports = {
  getPaFlow,
  getWaterProcessFlow,
  getLatestCip,
  getExtractionCipChecklist: require('./paCipChecklistService').getExtractionCipChecklist,
};

