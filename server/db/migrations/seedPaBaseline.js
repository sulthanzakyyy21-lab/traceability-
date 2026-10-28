const pool = require('../../db');

async function seedPaBaseline() {
  const [fwtExisting] = await pool.query(
    'SELECT id FROM `pa_fwt_t1` WHERE `Tanggal & Waktu` LIKE ? LIMIT 1',
    ['2026-08-22%']
  );

  if (fwtExisting.length === 0) {
    const fwtRows = [
      {
        'Tanggal & Waktu': '2026-08-22 06:00:00',
        pH: '6.93',
        TDS: '161',
        Kekeruhan: '0',
        'Kesadahan*': '2',
        'Sisa Khlor': '0.09',
        Mangan: '0.045',
        Besi: '0.003',
        Warna: '5',
        Aluminium: '0.002',
        'E. Coli': 'Negatif',
        'Total Coliform': 'Negatif',
        'Pseudomonas Aeruginosa*': 'Negatif',
        Noted: 'Analisa Mingguan FWT',
      },
      {
        'Tanggal & Waktu': '2026-08-22 08:00:00',
        pH: '6.931',
        TDS: '161',
        Kekeruhan: '0',
        'Kesadahan*': '0',
        'Sisa Khlor': '0',
        Mangan: '0',
        Besi: '0',
        Warna: '0',
        Aluminium: '0',
        'E. Coli': 'Negatif',
        'Total Coliform': 'Negatif',
        'Pseudomonas Aeruginosa*': 'Negatif',
        Noted: 'Analisa Harian',
      },
    ];

    for (const r of fwtRows) {
      await pool.query(
        'INSERT INTO `pa_fwt_t1` (`Tanggal & Waktu`, `pH`, `TDS`, `Kekeruhan`, `Kesadahan*`, `Sisa Khlor`, `Mangan`, `Besi`, `Warna`, `Aluminium`, `E. Coli`, `Total Coliform`, `Pseudomonas Aeruginosa*`, `Noted`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          r['Tanggal & Waktu'], r.pH, r.TDS, r.Kekeruhan, r['Kesadahan*'],
          r['Sisa Khlor'], r.Mangan, r.Besi, r.Warna, r.Aluminium,
          r['E. Coli'], r['Total Coliform'], r['Pseudomonas Aeruginosa*'], r.Noted,
        ]
      );
    }
  }

  const [cipExisting] = await pool.query(
    'SELECT id FROM `pa_cip_t1` WHERE `Tanggal & Waktu` LIKE ? LIMIT 1',
    ['2026-08-%']
  );

  if (cipExisting.length === 0) {
    const cipRows = [
      {
        Stamp: '2026-08-16 08:00:00',
        'Tanggal & Waktu': '2026-08-16 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'Prewetting Tank',
        'pH Lab': '7.120',
        Conductivity: '0.210',
        Swab: '0',
      },
      {
        Stamp: '2026-08-16 08:00:00',
        'Tanggal & Waktu': '2026-08-16 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'Line Sirkulasi Final Tank C01 s/d C03',
        'pH Lab': '7.226',
        Conductivity: '0.333',
        Swab: '0',
      },
      {
        Stamp: '2026-08-22 08:00:00',
        'Tanggal & Waktu': '2026-08-22 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'PHE Evap',
        'pH Lab': '7.008',
        Conductivity: '0.238',
        Swab: '0',
      },
      {
        Stamp: '2026-08-22 08:00:00',
        'Tanggal & Waktu': '2026-08-22 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'Final Tank 2',
        'pH Lab': '7.100',
        Conductivity: '0.250',
        Swab: '0',
      },
      {
        Stamp: '2026-08-16 08:00:00',
        'Tanggal & Waktu': '2026-08-16 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'Feed Tank Dryer',
        'pH Lab': '7.443',
        Conductivity: '0.318',
        Swab: '0',
      },
      {
        Stamp: '2026-08-17 08:00:00',
        'Tanggal & Waktu': '2026-08-17 08:00:00',
        Waktu: '08:00:00',
        Peralatan: 'COP Pouring Hopper Rework',
        'pH Lab': '7.000',
        Conductivity: '0.200',
        Swab: '81',
      },
    ];

    for (const c of cipRows) {
      await pool.query(
        'INSERT INTO `pa_cip_t1` (`Stamp`, `Tanggal & Waktu`, `Waktu`, `Peralatan`, `pH Lab`, `Conductivity`, `Swab`, `pH in line`, `Start Final Rinse RO`, `Finish Final Rinse RO`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          c.Stamp, c['Tanggal & Waktu'], c.Waktu, c.Peralatan,
          c['pH Lab'], c.Conductivity, c.Swab, '0', '0', '0',
        ]
      );
    }
  }

  const [cip2Existing] = await pool.query(
    'SELECT id FROM `pa_cip_t2` WHERE `Tanggal` LIKE ? LIMIT 1',
    ['2026-08-%']
  );

  if (cip2Existing.length === 0) {
    await pool.query(
      'INSERT INTO `pa_cip_t2` (`Stamp`, `Tanggal`, `Waktu`, `Peralatan`, `pH Lab`, `Conductivity`, `Swab`, `pH in line`, `Start Final Rinse RO`, `Finish Final Rinse RO`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        '2026-08-25 10:20:00', '2026-08-25 10:20:00', '10:20:00',
        'Pre-wetting tank', '7.150', '0.220', '0', '0', '0', '0'
      ]
    );
  }

  return { success: true, message: 'PA baseline test fixtures verified and seeded.' };
}

if (require.main === module) {
  seedPaBaseline()
    .then((res) => {
      console.log(res.message);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed PA baseline failed:', err);
      process.exit(1);
    });
}

module.exports = { seedPaBaseline };
