const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { formatDT, extractTankNo, uniqueJoin } = require('../utils/traceHelpers');

async function getDryerFlow(batch, tahun, tower) {
  const dryerTable = tower === '1' ? 'dryer_tower_1' : 'dryer_tower_2';
  const finalTankCol = tower === '1' ? '`Final Tank`' : '`Final Tank (FTC0)`';

  try {
    const [tableCols] = await pool.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id'
       ORDER BY ORDINAL_POSITION`,
      [dryerTable]
    );
    const dryerColumns = tableCols && tableCols.length > 0 
      ? tableCols.map((c) => c.COLUMN_NAME)
      : (TABLE_COLUMNS_MAP[dryerTable] || []);

    const batchVariants = [String(batch), `${batch}.0`];
    const placeholders = batchVariants.map(() => '?').join(', ');

    const [rows] = await pool.execute(
      `SELECT *, ${finalTankCol} as _finalTank
       FROM \`${dryerTable}\`
       WHERE (TRIM(Batch) IN (${placeholders})
          OR TRIM(Batch) LIKE CONCAT(?, '-%')
          OR TRIM(Batch) LIKE CONCAT(?, '.%')
          OR TRIM(Batch) REGEXP CONCAT('^', ?, '[A-Za-z]'))
         AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
       ORDER BY Tanggal ASC, Waktu ASC`,
      [...batchVariants, batch, batch, batch, tahun, tahun, tahun]
    );

    if (rows.length === 0) {
      return {
        error: `Tidak ada data di ${dryerTable} untuk batch ${batch} tahun ${tahun}`,
        columns: dryerColumns,
        raw_rows: [],
      };
    }

    const first = rows[0];
    const last = rows[rows.length - 1];
    const finalTanks = [...new Set(rows.map((r) => r._finalTank).filter(Boolean))];
    const finalTankNo = finalTanks.length > 0 ? extractTankNo(finalTanks[0]) : '-';

    return {
      table: dryerTable,
      totalRows: rows.length,
      tanggal: first.Tanggal || first.Stamp || null,
      nama_produk: rows[0]?.['Nama Produk'] || rows[0]?.['Produk'] || null,
      waktu_proses: `${formatDT(first.Tanggal, first.Waktu)} - ${formatDT(last.Tanggal, last.Waktu)}`,
      operator_produksi: uniqueJoin(rows.map((r) => r.Nama)) || '-',
      final_tank: finalTankNo,
      final_tank_raw: finalTanks.join(', '),
      mode: [...new Set(rows.map((r) => r.Mode).filter(Boolean))].join(', ') || null,
      columns: dryerColumns,
      raw_rows: rows,
    };
  } catch (e) {
    return { error: e.message, columns: [], raw_rows: [] };
  }
}

module.exports = { getDryerFlow };
