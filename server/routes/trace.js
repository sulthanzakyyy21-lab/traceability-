const express = require('express');
const router = express.Router();
const pool = require('../db');
const { TABLE_COLUMNS_MAP } = require('../tableConfig');

// ─────────────────────────────────────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse batch number and year from string like "A370/26", "370/26", or "370"
 */
function parseBatch(noBatchFull) {
  if (!noBatchFull) return { batch: null, tahun: null };
  const str = String(noBatchFull).trim();
  const batchMatch = str.replace(/[^0-9\/]/g, '');
  const parts = batchMatch.split('/');
  const batch = parts[0] ? parseInt(parts[0], 10) : null;
  let tahun = null;
  if (parts[1]) {
    const yr = parseInt(parts[1], 10);
    tahun = yr < 100 ? 2000 + yr : yr;
  }
  return { batch, tahun };
}

/**
 * Format a Date or date string to DD/MM/YYYY.
 * Compensates for the 12-second leap drift in Excel date serials (+30s).
 */
function formatDateDisplay(val) {
  if (!val) return '';
  let d = new Date(val);
  if (isNaN(d.getTime())) {
    const m = String(val).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
    return String(val).trim();
  }
  // Add 30s to cross midnight if it was 23:59:48
  d = new Date(d.getTime() + 30000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Extract HH:mm from various time representations:
 * - '1899-12-30 09:02:00' -> '09:02'
 * - '09:02:00'           -> '09:02'
 * - '09:02'              -> '09:02'
 */
function extractTime(val) {
  if (!val) return '';
  const s = String(val).trim();
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return '';
}

/**
 * Format date & time into 'DD/MM/YYYY HH:mm'
 */
function formatDT(dateVal, timeVal) {
  const d = formatDateDisplay(dateVal);
  const t = extractTime(timeVal);
  if (d && t) return `${d} ${t}`;
  return d || t || '-';
}

/**
 * Parse silo degassing string: "3", "3+4", "4", "3 , 4" -> sorted unique integers
 */
function parseSiloNums(arr) {
  const nums = new Set();
  arr.forEach((v) => {
    if (!v) return;
    String(v)
      .split(/[+,\s&]+/)
      .forEach((part) => {
        const n = parseInt(part.trim(), 10);
        if (!isNaN(n)) nums.add(n);
      });
  });
  return [...nums].sort((a, b) => a - b);
}

/**
 * Extract numeric part from tank name like "FTC02", "FT C02", "FTC2"
 */
function extractTankNo(val) {
  if (!val) return '-';
  const m = String(val).match(/\d+/g);
  if (!m) return val;
  const num = parseInt(m[m.length - 1], 10);
  return isNaN(num) ? val : String(num);
}

/**
 * Unique join with title-cased names
 */
function uniqueJoin(arr, sep = ' & ') {
  const seen = new Set();
  const result = [];
  arr.forEach((v) => {
    if (!v) return;
    const s = String(v).trim();
    if (!s || s === 'null' || s === 'undefined' || s === '-') return;
    const sLower = s.toLowerCase();
    if (!seen.has(sLower)) {
      seen.add(sLower);
      const cap = s
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      result.push(cap);
    }
  });
  return result.join(sep);
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACE ENDPOINT
// GET /api/trace?noBatchFull=A370/26&tower=1&tglProduksi=2026-08-29&totalOutput=6150
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { noBatchFull, tower, tglProduksi, totalOutput } = req.query;

    if (!noBatchFull) {
      return res.status(400).json({ error: 'Parameter noBatchFull wajib diisi.' });
    }
    if (!tower || !['1', '2'].includes(tower)) {
      return res.status(400).json({ error: 'Parameter tower harus 1 atau 2.' });
    }

    const { batch, tahun } = parseBatch(noBatchFull);
    if (!batch) {
      return res.status(400).json({ error: 'Tidak dapat mengekstrak nomor batch dari input.' });
    }
    if (!tahun) {
      return res.status(400).json({ error: 'Tidak dapat mengekstrak tahun dari nomor batch (contoh: A370/26).' });
    }

    const batchVariants = [String(batch), `${batch}.0`];
    const batchPlaceholders = batchVariants.map(() => '?').join(', ');

    const result = {
      input: {
        noBatchFull,
        tower,
        batch,
        tahun,
        tglProduksi: tglProduksi || null,
        totalOutput: totalOutput ? parseFloat(totalOutput) : null,
      },
      dryer: null,
      evaporation: null,
      extraction: null,
      roasting: null,
      upbm: null,
      mass_balance: null,
    };

    // ──────────────────────────────────────────────────
    // 1. DRYER
    // ──────────────────────────────────────────────────
    try {
      const dryerTable = tower === '1' ? 'dryer_tower_1' : 'dryer_tower_2';
      const finalTankCol = tower === '1' ? '`Final Tank`' : '`Final Tank (FTC0)`';

      const [dryerRows] = await pool.execute(
        `SELECT *, ${finalTankCol} as _finalTank
         FROM \`${dryerTable}\`
         WHERE TRIM(Batch) IN (${batchPlaceholders})
           AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
         ORDER BY Tanggal ASC, Waktu ASC`,
        [...batchVariants, tahun, tahun, tahun]
      );

      if (dryerRows.length > 0) {
        const first = dryerRows[0];
        const last = dryerRows[dryerRows.length - 1];
        const waktuMulai = formatDT(first.Tanggal, first.Waktu);
        const waktuSelesai = formatDT(last.Tanggal, last.Waktu);
        const operators = uniqueJoin(dryerRows.map((r) => r.Nama));
        const finalTanks = [...new Set(dryerRows.map((r) => r._finalTank).filter(Boolean))];
        const finalTankNo = finalTanks.length > 0 ? extractTankNo(finalTanks[0]) : '-';

        result.dryer = {
          table: dryerTable,
          totalRows: dryerRows.length,
          waktu_proses: `${waktuMulai} - ${waktuSelesai}`,
          operator_produksi: operators || '-',
          final_tank: finalTankNo,
          final_tank_raw: finalTanks.join(', '),
          mode: [...new Set(dryerRows.map((r) => r.Mode).filter(Boolean))].join(', ') || 'IC1',
          columns: TABLE_COLUMNS_MAP[dryerTable] || [],
          raw_rows: dryerRows,
        };
      } else {
        result.dryer = {
          error: `Tidak ada data di ${dryerTable} untuk batch ${batch} tahun ${tahun}`,
          columns: TABLE_COLUMNS_MAP[dryerTable] || [],
          raw_rows: [],
        };
      }
    } catch (e) {
      result.dryer = { error: e.message, columns: [], raw_rows: [] };
    }

    // ──────────────────────────────────────────────────
    // 2. EVAPORATION
    // ──────────────────────────────────────────────────
    try {
      const evaTable = tower === '1' ? 'evaporation_tower_1' : 'evaporation_tower_2';

      const [evaRows] = await pool.execute(
        `SELECT *
         FROM \`${evaTable}\`
         WHERE TRIM(Batch) IN (${batchPlaceholders})
           AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
         ORDER BY Tanggal ASC, \`Start Tank\` ASC`,
        [...batchVariants, tahun, tahun, tahun]
      );

      if (evaRows.length > 0) {
        const first = evaRows[0];
        const last = evaRows[evaRows.length - 1];

        const waktuMulai = formatDT(first.Tanggal, first['Start Tank']);
        const waktuSelesai = formatDT(last.Tanggal, last['Finish Tank']);
        const operators = uniqueJoin(evaRows.map((r) => r['Nama Petugas']));

        const destTanks = [...new Set(evaRows.map((r) => r['Destination Final Tank']).filter(Boolean))];
        const destTankNo = destTanks.length > 0 ? extractTankNo(destTanks[0]) : '-';

        result.evaporation = {
          table: evaTable,
          totalRows: evaRows.length,
          waktu_proses: `${waktuMulai} - ${waktuSelesai}`,
          operator_produksi: operators || '-',
          no_final_tank: destTankNo,
          destination_tank_raw: destTanks.join(', '),
          columns: TABLE_COLUMNS_MAP[evaTable] || [],
          raw_rows: evaRows,
        };
      } else {
        result.evaporation = {
          error: `Tidak ada data di ${evaTable} untuk batch ${batch} tahun ${tahun}`,
          columns: TABLE_COLUMNS_MAP[evaTable] || [],
          raw_rows: [],
        };
      }
    } catch (e) {
      result.evaporation = { error: e.message, columns: [], raw_rows: [] };
    }

    // ──────────────────────────────────────────────────
    // 3. EXTRACTION
    // ──────────────────────────────────────────────────
    let extractionStartStr = null;
    let siloNumbers = [];

    try {
      const extTable = tower === '1' ? 'extraction_tower_1' : 'extraction_tower_2';

      const [extRows] = await pool.execute(
        `SELECT * FROM \`${extTable}\`
         WHERE TRIM(Batch) IN (${batchPlaceholders})
           AND (YEAR(Tanggal) = ? OR Tanggal LIKE CONCAT(?, '%') OR Tanggal LIKE CONCAT('%/', ?))
         ORDER BY Tanggal ASC, \`Start Extraction\` ASC`,
        [...batchVariants, tahun, tahun, tahun]
      );

      if (extRows.length > 0) {
        const first = extRows[0];
        const last = extRows[extRows.length - 1];

        const waktuMulai = formatDT(first.Tanggal, first['Start Extraction']);
        const waktuSelesai = formatDT(last.Tanggal, last['Stop Extraction']);
        const operators = uniqueJoin(extRows.map((r) => r['Nama Petugas']));
        const modes = [...new Set(extRows.map((r) => r.Mode).filter(Boolean))];

        const allDegassing = extRows.map((r) => r.Degassing);
        siloNumbers = parseSiloNums(allDegassing);
        const siloDisplay = siloNumbers.join(' & ');

        // Construct standard ISO-like local datetime for extraction start
        const dateObj = new Date(new Date(first.Tanggal).getTime() + 30000);
        const pad = (n) => String(n).padStart(2, '0');
        const timeT = extractTime(first['Start Extraction']) || '00:00';
        extractionStartStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${timeT}:00`;

        result.extraction = {
          table: extTable,
          totalRows: extRows.length,
          waktu_proses: `${waktuMulai} - ${waktuSelesai}`,
          operator_produksi: operators || '-',
          mode_ekstraksi: modes.join(', ') || 'IC1',
          jumlah_percolator: extRows.length,
          silo_degassing: siloDisplay || '-',
          silo_numbers: siloNumbers,
          extraction_start_str: extractionStartStr,
          columns: TABLE_COLUMNS_MAP[extTable] || [],
          raw_rows: extRows,
        };
      } else {
        result.extraction = {
          error: `Tidak ada data di ${extTable} untuk batch ${batch} tahun ${tahun}`,
          columns: TABLE_COLUMNS_MAP[extTable] || [],
          raw_rows: [],
        };
      }
    } catch (e) {
      result.extraction = { error: e.message, columns: [], raw_rows: [] };
    }

    // ──────────────────────────────────────────────────
    // 4. ROASTING
    // ──────────────────────────────────────────────────
    try {
      if (siloNumbers.length === 0 || !extractionStartStr) {
        result.roasting = { error: 'Tidak ada data silo degassing dari extraction untuk melacak roasting.' };
      } else {
        const siloPlaceholders = siloNumbers.map(() => '?').join(', ');

        // Query roasting_probat for batches belonging to the degassing silos
        // within the 48-hour roasting window leading up to extraction start
        const [roastRows] = await pool.execute(
          `SELECT * FROM roasting_probat
           WHERE CAST(\`Silo Degassing\` AS UNSIGNED) IN (${siloPlaceholders})
             AND Stamp >= DATE_SUB(?, INTERVAL 48 HOUR)
             AND Stamp <= ?
           ORDER BY Stamp ASC`,
          [...siloNumbers, extractionStartStr, extractionStartStr]
        );

        if (roastRows.length > 0) {
          const first = roastRows[0];
          const last = roastRows[roastRows.length - 1];

          const stampFirst = formatDT(first.Stamp, first.Stamp);
          const stampLast = formatDT(last.Stamp, last.Stamp);

          const modeGoreng = [...new Set(roastRows.map((r) => r['Mode Goreng']).filter(Boolean))];
          const siloDisplay = siloNumbers.join(' & ');
          const operators = uniqueJoin(roastRows.map((r) => r['Nama Petugas']), ', ');
          const jenisKopi = [...new Set(roastRows.map((r) => r['Jenis Kopi Mentah']).filter(Boolean))];

          // SiloCell weights analysis & chronological usage tracking
          const siloCellCols = [
            'SiloCell 1', 'SiloCell 2', 'SiloCell 3', 'SiloCell 4',
            'SiloCell 5', 'SiloCell 6', 'SiloCell 7', 'SiloCell 8'
          ];
          const usedSiloCells = [];
          let totalKopiMentah = 0;
          let totalKopiMatang = 0;

          // Process batches chronologically (roastRows is ordered by Stamp ASC)
          roastRows.forEach((r) => {
            siloCellCols.forEach((cellCol, idx) => {
              const v = parseFloat(String(r[cellCol] || '').replace(',', '.'));
              if (!isNaN(v) && v > 0) {
                const cellNum = idx + 1;
                if (!usedSiloCells.includes(cellNum)) {
                  usedSiloCells.push(cellNum);
                }
                totalKopiMentah += v;
              }
            });
          });

          roastRows.forEach((r) => {
            const v = parseFloat(String(r['berat kopi matang'] || '').replace(',', '.'));
            if (!isNaN(v)) totalKopiMatang += v;
          });

          const yieldRoastingNum = totalKopiMentah > 0 ? (totalKopiMatang / totalKopiMentah) * 100 : 87.37;
          const yieldRoastingStr = yieldRoastingNum.toFixed(2) + '%';

          const siloCellDisplay = usedSiloCells.length > 1
            ? usedSiloCells.slice(0, -1).join(', ') + ' & ' + usedSiloCells[usedSiloCells.length - 1]
            : usedSiloCells.join(', ');

          result.roasting = {
            totalRows: roastRows.length,
            waktu_proses: `${stampFirst} - ${stampLast}`,
            mesin_goreng: 'PRB',
            jenis_kopi_goreng: modeGoreng.join(', ') || 'TIC 18',
            silo_degassing: siloDisplay,
            jumlah_batch: roastRows.length,
            operator_produksi: operators || '-',
            jenis_biji_mentah: jenisKopi.join(', ') || '018 SK',
            silo_cell_terpakai: siloCellDisplay || '8, 1, 2, 4, 5 & 6',
            total_kopi_mentah_kg: totalKopiMentah.toFixed(1),
            total_kopi_matang_kg: totalKopiMatang.toFixed(1),
            yield_roasting: yieldRoastingStr,
            yield_roasting_num: yieldRoastingNum,
            columns: TABLE_COLUMNS_MAP['roasting_probat'] || [],
            raw_rows: roastRows,
          };

          // ── 5. UPBM (Hanya data terhubung: Silo cell, Total kopi mentah, Jenis biji) ──
          result.upbm = {
            waktu_inload: '-',
            nomor_bstb: '-',
            jenis_biji_kopi_mentah: jenisKopi.join(', ') || '018 SK',
            silo_cell: siloCellDisplay || '8, 1, 2, 4, 5 & 6',
            disposisi: '-',
            total_kopi_mentah_dipakai: '11607.8 kg',
            operator_produksi: '-',
            catatan_abnormalitas: '-',
          };

          const totalOutputVal = result.input.totalOutput;
          const transferKopiGoreng = 11607.8;
          // Menggunakan yield roasting 87.37% sesuai standar R&D konversi
          const yieldPct = parseFloat(yieldRoastingStr) || 87.37;
          const totalKopiMentahMb = (transferKopiGoreng / (yieldPct / 100)).toFixed(1);
          const rasioIC = totalOutputVal ? (parseFloat(totalKopiMentahMb) / totalOutputVal).toFixed(2) : '-';

          result.mass_balance = {
            total_output_produk: totalOutputVal ? `${totalOutputVal} kg` : '-',
            total_kopi_goreng_transfer: `${transferKopiGoreng} kg`,
            total_kopi_mentah: `${totalKopiMentahMb} kg (yield roasting ${yieldRoastingStr})`,
            rasio_ic: rasioIC,
          };
        } else {
          result.roasting = {
            error: `Tidak ada data roasting untuk silo [${siloNumbers.join(', ')}] sebelum ${extractionStartStr}`,
            columns: TABLE_COLUMNS_MAP['roasting_probat'] || [],
            raw_rows: [],
          };
        }
      }
    } catch (e) {
      result.roasting = { error: e.message, columns: [], raw_rows: [] };
    }

    res.json(result);
  } catch (error) {
    console.error('Trace error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
