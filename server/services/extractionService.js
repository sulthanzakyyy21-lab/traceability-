const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { formatDT, extractTime, parseSiloNums, uniqueJoin } = require('../utils/traceHelpers');

async function getExtractionFlow(batch, tahun, tower) {
  const extTable = tower === '1' ? 'extraction_tower_1' : 'extraction_tower_2';
  try {
    const batchVariants = [String(batch), `${batch}.0`];
    const placeholders = batchVariants.map(() => '?').join(', ');

    const [rows] = await pool.execute(
      `SELECT * FROM \`${extTable}\`
       WHERE (TRIM(Batch) IN (${placeholders})
          OR TRIM(Batch) LIKE CONCAT(?, '-%')
          OR TRIM(Batch) LIKE CONCAT(?, '.%')
          OR TRIM(Batch) REGEXP CONCAT('^', ?, '[A-Za-z]'))
         AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
       ORDER BY Tanggal ASC, \`Start Extraction\` ASC`,
      [...batchVariants, batch, batch, batch, tahun, tahun, tahun]
    );

    if (rows.length === 0) {
      return {
        error: `Tidak ada data di ${extTable} untuk batch ${batch} tahun ${tahun}`,
        columns: TABLE_COLUMNS_MAP[extTable] || [],
        raw_rows: [],
        siloNumbers: [],
        extractionStartStr: null,
      };
    }

    const first = rows[0];
    const last = rows[rows.length - 1];
    const siloNumbers = parseSiloNums(rows.map((r) => r.Degassing));

    const dateObj = new Date(new Date(first.Tanggal).getTime() + 30000);
    const pad = (n) => String(n).padStart(2, '0');
    const timeT = extractTime(first['Start Extraction']) || '00:00';
    const extractionStartStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${timeT}:00`;

    return {
      table: extTable,
      totalRows: rows.length,
      tanggal: first.Tanggal ? String(first.Tanggal).split('T')[0].split(' ')[0] : null,
      waktu_proses: `${formatDT(first.Tanggal, first['Start Extraction'])} - ${formatDT(last.Tanggal, last['Stop Extraction'])}`,
      operator_produksi: uniqueJoin(rows.map((r) => r['Nama Petugas'])) || '-',
      mode_ekstraksi: [...new Set(rows.map((r) => r.Mode).filter(Boolean))].join(', ') || 'IC1',
      jumlah_percolator: rows.length,
      silo_degassing: siloNumbers.join(' & ') || '-',
      silo_numbers: siloNumbers,
      extraction_start_str: extractionStartStr,
      columns: TABLE_COLUMNS_MAP[extTable] || [],
      raw_rows: rows,
      siloNumbers,
      extractionStartStr,
    };
  } catch (e) {
    return { error: e.message, columns: [], raw_rows: [], siloNumbers: [], extractionStartStr: null };
  }
}

module.exports = { getExtractionFlow };
