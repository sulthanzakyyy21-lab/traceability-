const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { formatDT, uniqueJoin } = require('../utils/traceHelpers');

async function getPackingFlow(batch, tahun, tower) {
  const packingTable = tower === '1' ? 'packing_tower_1' : 'packing_tower_2';
  try {
    let [rows] = await pool.execute(
      `SELECT * FROM \`${packingTable}\`
       WHERE batch = ? AND (YEAR(tanggal) = ? OR YEAR(stamp) = ?)
       ORDER BY tanggal ASC, waktu ASC`,
      [batch, tahun, tahun]
    );

    if (rows.length === 0) {
      [rows] = await pool.execute(
        `SELECT * FROM \`${packingTable}\` WHERE batch = ? ORDER BY tanggal ASC, waktu ASC`,
        [batch]
      );
    }

    if (rows.length === 0) {
      return {
        error: `Tidak ada data di ${packingTable} untuk batch ${batch}`,
        columns: TABLE_COLUMNS_MAP[packingTable] || [],
        raw_rows: [],
      };
    }

    const first = rows[0];
    const last = rows[rows.length - 1];
    const namaProduk = [...new Set(rows.map((r) => r.nama_produk).filter(Boolean))].join(', ');
    const totalOkBox = rows.reduce((sum, r) => sum + parseFloat(r.ok_box || 0), 0);
    const totalHoldBox = rows.reduce((sum, r) => sum + parseFloat(r.hold_box || 0), 0);
    const totalBoBox = rows.reduce((sum, r) => sum + parseFloat(r.bo_box || 0), 0);
    const totalBoKg = rows.reduce((sum, r) => sum + parseFloat(r.bo_kg || 0), 0);

    const kgPerBox = namaProduk.includes('25') ? 25 : 30;
    const totalOutputKg = totalOkBox * kgPerBox;

    const validTemps = rows.map((r) => parseFloat(r.temp_ruang_packing)).filter((n) => !isNaN(n) && n > 0 && n < 60);
    const validRHs = rows.map((r) => parseFloat(r.rh_ruang_packing)).filter((n) => !isNaN(n) && n > 0 && n < 100);
    const avgTemp = validTemps.length ? (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1) : null;
    const avgRH = validRHs.length ? Math.round(validRHs.reduce((a, b) => a + b, 0) / validRHs.length) : null;

    const validTempsTransit = rows.map((r) => parseFloat(r.temp_ruang_transit)).filter((n) => !isNaN(n) && n > 0 && n < 60);
    const validRHsTransit = rows.map((r) => parseFloat(r.rh_ruang_transit)).filter((n) => !isNaN(n) && n > 0 && n < 100);
    const avgTempTransit = validTempsTransit.length ? (validTempsTransit.reduce((a, b) => a + b, 0) / validTempsTransit.length).toFixed(1) : null;
    const avgRHTransit = validRHsTransit.length ? Math.round(validRHsTransit.reduce((a, b) => a + b, 0) / validRHsTransit.length) : null;

    const dehumidifier = [...new Set(rows.map((r) => r.kondisi_dehumidifier).filter(Boolean))].join(', ') || null;
    const ketList = [...new Set(rows.map((r) => r.keterangan).filter((v) => v && v !== '-' && v !== 'null'))];

    const startDate = first.stamp || first.tanggal;
    const endDate = last.stamp || last.tanggal;

    return {
      table: packingTable,
      totalRows: rows.length,
      tanggal: first.tanggal || first.stamp || null,
      waktu_proses: `${formatDT(startDate, first.waktu)} - ${formatDT(endDate, last.waktu)}`,
      shift: uniqueJoin(rows.map((r) => r.shift)) || '-',
      team: uniqueJoin(rows.map((r) => r.team)) || '-',
      operator_packing: uniqueJoin(rows.map((r) => r.nama)) || '-',
      nama_produk: namaProduk || '-',
      pin: [...new Set(rows.map((r) => r.pin).filter(Boolean))].join(', ') || '-',
      ok_box: totalOkBox,
      hold_box: totalHoldBox,
      bo_box: totalBoBox,
      bo_kg: totalBoKg,
      berat_box: `${kgPerBox} kg/box`,
      total_output: `${totalOkBox.toLocaleString()} Box (${totalOutputKg.toLocaleString()} kg)`,
      total_output_kg: totalOutputKg,
      suhu_rh_packing: (avgTemp && avgRH) ? `${avgTemp}°C / ${avgRH}%` : '-',
      suhu_rh_transit: (avgTempTransit && avgRHTransit) ? `${avgTempTransit}°C / ${avgRHTransit}%` : '-',
      dehumidifier: dehumidifier || '-',
      abnormalitas: ketList.length ? ketList.join('; ') : 'tidak ada',
      columns: TABLE_COLUMNS_MAP[packingTable] || [],
      raw_rows: rows,
    };
  } catch (e) {
    return { error: e.message, columns: [], raw_rows: [] };
  }
}

module.exports = { getPackingFlow };
