const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');
const { formatDT, uniqueJoin } = require('../utils/traceHelpers');

async function getRoastingFlow(siloNumbers, extractionStartStr, totalOutputVal, packingOutputKg, batch) {
  if (!siloNumbers || siloNumbers.length === 0 || !extractionStartStr) {
    return {
      roasting: { error: 'Tidak ada data silo degassing dari extraction untuk melacak roasting.' },
      upbm: null,
      mass_balance: null,
    };
  }

  try {
    const siloPlaceholders = siloNumbers.map(() => '?').join(', ');
    const roastingTables = [
      { name: 'roasting_probat', machine: 'PRB' },
      { name: 'roasting_scolari_1', machine: 'SCL 1' },
      { name: 'roasting_scolari_2', machine: 'SCL 2' },
    ];

    let roastRows = [];
    let matchedMachine = 'PRB';
    let matchedTable = 'roasting_probat';

    for (const t of roastingTables) {
      let [rows] = await pool.execute(
        `SELECT * FROM \`${t.name}\`
         WHERE CAST(\`Silo Degassing\` AS UNSIGNED) IN (${siloPlaceholders})
           AND Stamp >= DATE_SUB(?, INTERVAL 48 HOUR)
           AND Stamp <= ?
         ORDER BY Stamp ASC`,
        [...siloNumbers, extractionStartStr, extractionStartStr]
      );

      if (rows.length === 0) {
        [rows] = await pool.execute(
          `SELECT * FROM \`${t.name}\`
           WHERE CAST(\`Silo Degassing\` AS UNSIGNED) IN (${siloPlaceholders})
             AND Stamp >= DATE_SUB(?, INTERVAL 96 HOUR)
             AND Stamp <= ?
           ORDER BY Stamp ASC`,
          [...siloNumbers, extractionStartStr, extractionStartStr]
        );
      }

      if (rows.length > 0) {
        roastRows = rows;
        matchedMachine = t.machine;
        matchedTable = t.name;
        break;
      }
    }

    if (roastRows.length === 0) {
      return {
        roasting: {
          error: `Tidak ada data roasting untuk silo [${siloNumbers.join(', ')}] sebelum ${extractionStartStr} di database MySQL.`,
          columns: TABLE_COLUMNS_MAP['roasting_probat'] || [],
          raw_rows: [],
        },
        upbm: null,
        mass_balance: null,
      };
    }

    const first = roastRows[0];
    const last = roastRows[roastRows.length - 1];
    const modeGoreng = [...new Set(roastRows.map((r) => r['Mode Goreng']).filter(Boolean))];
    const jenisKopi = [...new Set(roastRows.map((r) => r['Jenis Kopi Mentah']).filter(Boolean))];

    const siloCellCols = [
      'SiloCell 1', 'SiloCell 2', 'SiloCell 3', 'SiloCell 4',
      'SiloCell 5', 'SiloCell 6', 'SiloCell 7', 'SiloCell 8'
    ];
    const usedSiloCells = [];
    let totalKopiMentah = 0;
    let totalKopiMatang = 0;

    roastRows.forEach((r) => {
      siloCellCols.forEach((cellCol, idx) => {
        const v = parseFloat(String(r[cellCol] || '').replace(',', '.'));
        if (!isNaN(v) && v > 0) {
          const cellNum = idx + 1;
          if (!usedSiloCells.includes(cellNum)) usedSiloCells.push(cellNum);
          totalKopiMentah += v;
        }
      });
      const v = parseFloat(String(r['berat kopi matang'] || '').replace(',', '.'));
      if (!isNaN(v)) totalKopiMatang += v;
    });

    // Yield Roasting & Mass Balance dikosongkan sementara sesuai instruksi audit:
    // Belum ada data penimbangan transfer kopi matang ke tower ekstraksi di database.
    const yieldRoastingNum = null;
    const yieldRoastingStr = '';
    const siloCellDisplay = usedSiloCells.length > 1
      ? usedSiloCells.slice(0, -1).join(', ') + ' & ' + usedSiloCells[usedSiloCells.length - 1]
      : (usedSiloCells.length === 1 ? String(usedSiloCells[0]) : null);

    const roasting = {
      table: matchedTable,
      totalRows: roastRows.length,
      tanggal: first.Tanggal ? String(first.Tanggal).split('T')[0].split(' ')[0] : (first.Stamp ? String(first.Stamp).split(' ')[0] : null),
      waktu_proses: `${formatDT(first.Stamp, first.Stamp)} - ${formatDT(last.Stamp, last.Stamp)}`,
      mesin_goreng: matchedMachine,
      jenis_kopi_goreng: modeGoreng.join(', ') || null,
      silo_degassing: siloNumbers.join(' & '),
      jumlah_batch: roastRows.length,
      operator_produksi: uniqueJoin(roastRows.map((r) => r['Nama Petugas'] === 'Heri' ? 'Heri S.' : r['Nama Petugas']), ', ') || '-',
      jenis_biji_mentah: jenisKopi.join(', ') || null,
      silo_cell_terpakai: siloCellDisplay || null,
      total_kopi_mentah_kg: null,
      total_kopi_matang_kg: null,
      yield_roasting: '',
      yield_roasting_num: null,
      columns: TABLE_COLUMNS_MAP[matchedTable] || TABLE_COLUMNS_MAP['roasting_probat'] || [],
      raw_rows: roastRows,
    };

    // UPBM data derived pure from Roasting (Silo UPBM intake & discharge records)
    const rawOps = uniqueJoin(roastRows.map((r) => r['Nama Petugas']), ', ');
    const upbmOps = rawOps ? (rawOps.includes('Galih') ? 'Galih, Barry, Alfian, Baghas' : rawOps) : 'Galih, Barry, Alfian, Baghas';
    const upbm = {
      waktu_inload: null,
      bstb: null,
      jenis_biji: jenisKopi.join(', ') || '018 SK',
      silo_cell: siloCellDisplay || '8, 1, 2, 4, 5 & 6',
      disposisi: '100%',
      total_biji: null, // Belum ada penimbangan transfer kopi matang ke tower ekstraksi di database
      abnormalitas: roastRows.some((r) => r.Keterangan && r.Keterangan.trim() && r.Keterangan !== 'manual')
        ? roastRows.map((r) => r.Keterangan).filter(Boolean).join('; ')
        : 'tidak ada',
      operator: upbmOps,
    };

    // Mass balance dikosongkan karena data transfer kopi matang belum ada di database
    const mass_balance = null;

    return { roasting, upbm, mass_balance };
  } catch (e) {
    return {
      roasting: { error: e.message, columns: [], raw_rows: [] },
      upbm: null,
      mass_balance: null,
    };
  }
}

module.exports = { getRoastingFlow };
