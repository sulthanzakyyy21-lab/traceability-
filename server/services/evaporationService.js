const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { formatDT, extractTankNo, uniqueJoin } = require('../utils/traceHelpers');

async function getEvaporationFlow(batch, tahun, tower) {
  const evaTable = tower === '1' ? 'evaporation_tower_1' : 'evaporation_tower_2';
  try {
    const batchVariants = [String(batch), `${batch}.0`];
    const placeholders = batchVariants.map(() => '?').join(', ');

    const [rows] = await pool.execute(
      `SELECT * FROM \`${evaTable}\`
       WHERE (TRIM(Batch) IN (${placeholders})
          OR TRIM(Batch) LIKE CONCAT(?, '-%')
          OR TRIM(Batch) LIKE CONCAT(?, '.%')
          OR TRIM(Batch) REGEXP CONCAT('^', ?, '[A-Za-z]'))
         AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
       ORDER BY Tanggal ASC, \`Start Tank\` ASC`,
      [...batchVariants, batch, batch, batch, tahun, tahun, tahun]
    );

    if (rows.length === 0) {
      return {
        error: `Tidak ada data di ${evaTable} untuk batch ${batch} tahun ${tahun}`,
        columns: TABLE_COLUMNS_MAP[evaTable] || [],
        raw_rows: [],
      };
    }

    const first = rows[0];
    const last = rows[rows.length - 1];
    const destTanks = [...new Set(rows.map((r) => r['Destination Final Tank']).filter(Boolean))];

    return {
      table: evaTable,
      totalRows: rows.length,
      waktu_proses: `${formatDT(first.Tanggal, first['Start Tank'])} - ${formatDT(last.Tanggal, last['Finish Tank'])}`,
      operator_produksi: uniqueJoin(rows.map((r) => r['Nama Petugas'])) || '-',
      no_final_tank: destTanks.length > 0 ? extractTankNo(destTanks[0]) : '-',
      destination_tank_raw: destTanks.join(', '),
      columns: TABLE_COLUMNS_MAP[evaTable] || [],
      raw_rows: rows,
    };
  } catch (e) {
    return { error: e.message, columns: [], raw_rows: [] };
  }
}

module.exports = { getEvaporationFlow };
