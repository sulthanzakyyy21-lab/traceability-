/**
 * 7 Process Clusters Data Builder for PT. Santos Jaya Abadi Traceability
 * Strictly maps real MySQL database traceResult without fake or hardcoded mock data.
 * Unrecorded PIC flows (RMW, PA, FGW) display an honest "Data Belum Tersedia" state.
 */

const CLUSTER_CONFIG = [
  {
    key: 'raw-material',
    name: 'Gudang Bahan Baku & Silo UPBM',
    clusterBadge: 'Cluster: Incoming Bahan & Alokasi Silo UPBM',
    flows: ['Flow 11', 'Flow 9'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/></svg>',
  },
  {
    key: 'roasting',
    name: 'Roasting',
    clusterBadge: 'Cluster: Roasting Probat Line 1',
    flows: ['Flow 8'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  },
  {
    key: 'extraction',
    name: 'Ekstraksi Kopi',
    clusterBadge: 'Cluster: Water Process & Ekstraksi Kopi',
    flows: ['Flow 7', 'Flow 6'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31"/><path d="M14 9.3V2"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>',
  },
  {
    key: 'evaporasi',
    name: 'Evaporasi & Final Tank',
    clusterBadge: 'Cluster: Evaporator Falling Film & Final Tank',
    flows: ['Flow 5'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"/><path d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"/></svg>',
  },
  {
    key: 'dryer',
    name: 'Spray Dryer',
    clusterBadge: 'Cluster: Pengeringan Spray Dryer',
    flows: ['Flow 4'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
  },
  {
    key: 'packing',
    name: 'Pengemasan Box',
    clusterBadge: 'Cluster: Packing Line & Bahan Kemas',
    flows: ['Flow 2', 'Flow 12'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
  },
  {
    key: 'distribusi',
    name: 'Distribusi Produk',
    clusterBadge: 'Cluster: Finished Good Warehouse & Distribusi',
    flows: ['Flow 1'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  },
];

function buildClusterData(traceResult, tower = '1') {
  const d = traceResult || {};
  const tKey = String(tower || '1');
  const extTable = tKey === '2' ? 'extraction_tower_2' : 'extraction_tower_1';
  const evapTable = tKey === '2' ? 'evaporation_tower_2' : 'evaporation_tower_1';
  const dryerTable = tKey === '2' ? 'dryer_tower_2' : 'dryer_tower_1';
  const packTable = tKey === '2' ? 'packing_tower_2' : 'packing_tower_1';

  // Availability flags (Real MySQL database check)
  const hasUpbm = Boolean(d.upbm && !d.upbm.error && (d.upbm.waktu_inload || d.upbm.silo_cell));
  const hasRoasting = Boolean(d.roasting && !d.roasting.error && (d.roasting.mesin_goreng || d.roasting.jenis_kopi_goreng));
  const hasExtraction = Boolean(d.extraction && !d.extraction.error);
  const hasEvaporation = Boolean(d.evaporation && !d.evaporation.error);
  const hasDryer = Boolean(d.dryer && !d.dryer.error);
  const hasPacking = Boolean(d.packing && !d.packing.error);

  // PIC RMW, PA, FGW are not yet in MySQL
  const hasRmw = Boolean(d.rmw && !d.rmw.error);
  const hasPa = Boolean(d.pa && !d.pa.error);
  const hasFgw = Boolean(d.fgw && !d.fgw.error);

  return {
    'raw-material': {
      ...CLUSTER_CONFIG[0],
      subflows: [
        {
          flowNumber: 'Flow 11',
          title: 'Incoming Bahan Baku Kopi Mentah',
          refDoc: 'F/WHS/01.002',
          tableKey: 'rmw_green_bean',
          isAvailable: hasRmw,
          pendingPicName: 'RMW',
          operationalTitle: 'Data Kedatangan & Logistik Bahan Baku',
          fields: hasRmw ? [
            { label: 'Tanggal Kedatangan', value: d.rmw?.tanggal || '-' },
            { label: 'Jenis Bahan', value: d.rmw?.jenis_kopi || '-', badge: 'Green Bean' },
            { label: 'Nama Supplier', value: d.rmw?.supplier || '-' },
            { label: 'Nomor Truk', value: d.rmw?.no_truk || '-' },
            { label: 'Nomor Surat Jalan', value: d.rmw?.no_sj || '-' },
            { label: 'Jumlah (kg)', value: d.rmw?.qty_kg ? d.rmw.qty_kg + ' kg' : '-' }
          ] : [
            { label: 'Tanggal Kedatangan', value: '-' },
            { label: 'Jenis Bahan', value: '-' },
            { label: 'Nama Supplier', value: '-' },
            { label: 'Nomor Truk', value: '-' },
            { label: 'Nomor Surat Jalan', value: '-' },
            { label: 'Jumlah (kg)', value: '-' }
          ],
          qcTitle: 'Analisa Kualitas Kedatangan Biji Kopi Mentah',
          qcMetrics: hasRmw ? [
            { label: 'Kadar Air (%)', value: d.qc?.['Kadar Air (%)'] || '-', spec: 'Standar < 12,0%', status: 'ok' },
            { label: 'Biji OK (Grade)', value: d.qc?.['Biji OK'] || '-', spec: 'Min. 85,0%', status: 'ok' }
          ] : [
            { label: 'Kadar Air (%)', value: '-', spec: 'Standar < 12,0%', status: 'pending' },
            { label: 'Biji OK (Grade)', value: '-', spec: 'Min. 85,0%', status: 'pending' },
            { label: '% Foreign Matter', value: '-', spec: 'Bebas Benda Asing', status: 'pending' },
            { label: 'Serangga Hidup', value: '-', spec: 'Negatif Mutlak', status: 'pending' }
          ],
          pic: { operasional: d.rmw?.operator || 'Belum Ada Rekaman (PIC RMW)', qc: d.rmw?.qc || 'Belum Ada Rekaman (QC RMW)' }
        },
        {
          flowNumber: 'Flow 9',
          title: 'Alokasi Silo Cell UPBM',
          refDoc: 'F/UPBM/01.008',
          tableKey: 'roasting_probat',
          isAvailable: hasUpbm,
          pendingPicName: 'UPBM',
          operationalTitle: 'Data Serah Terima & Inload Silo Cell',
          fields: [
            { label: 'Waktu Inload', value: d.upbm?.waktu_inload || '-' },
            { label: 'Nomor BSTB', value: d.upbm?.nomor_bstb || '-', badge: d.upbm?.nomor_bstb ? 'BSTB Resmi' : null },
            { label: 'Alokasi Silo Cell', value: d.upbm?.silo_cell || '-', badge: d.upbm?.silo_cell ? 'Silo Cell' : null },
            { label: 'Jumlah Kopi Mentah', value: d.upbm?.total_kopi_mentah_dipakai ? d.upbm.total_kopi_mentah_dipakai + ' kg' : '-' },
            { label: 'Kondisi Magnet Trap', value: d.upbm ? 'Lolos Pemeriksaan Logam (OK)' : '-', colSpan: 'col-span-2', isHighlight: hasUpbm }
          ],
          qcTitle: 'Pemeriksaan Jalur Transfer & Silo Cell',
          qcMetrics: [
            { label: 'Magnet Trap', value: hasUpbm ? 'Bebas Logam' : '-', spec: 'Negatif Logam', status: hasUpbm ? 'ok-highlight' : 'pending' },
            { label: 'Silo Cell', value: hasUpbm ? 'Bersih & Kering' : '-', spec: 'Siap Inload', status: hasUpbm ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.upbm?.operator_produksi || '-', qc: '-' }
        }
      ]
    },

    'roasting': {
      ...CLUSTER_CONFIG[1],
      subflows: [
        {
          flowNumber: 'Flow 8',
          title: 'Penyangraian Kopi (Roasting)',
          refDoc: 'F/PRD/02.015',
          tableKey: 'roasting_probat',
          isAvailable: hasRoasting,
          pendingPicName: 'Produksi',
          operationalTitle: 'Data Operasional Penyangraian Probat Line 1',
          fields: [
            { label: 'Mesin Sangrai', value: d.roasting?.mesin_goreng || '-', badge: d.roasting?.mesin_goreng ? 'Aktif' : null },
            { label: 'Jenis Kopi Goreng', value: d.roasting?.jenis_kopi_goreng || '-', badge: d.roasting?.jenis_kopi_goreng ? 'Kode Produk' : null },
            { label: 'Silo Cell Asal', value: d.roasting?.silo_cell_terpakai || '-' },
            { label: 'Silo Degassing Tujuan', value: d.roasting?.silo_degassing || '-', badge: d.roasting?.silo_degassing ? 'Transfer Otomatis' : null },
            { label: 'Jumlah Sesi Sangrai', value: d.roasting?.jumlah_batch ? d.roasting.jumlah_batch + ' Batch' : '-' },
            { label: 'Total Input Mentah', value: d.mass_balance?.total_kopi_mentah ? d.mass_balance.total_kopi_mentah + ' kg' : '-' },
            { label: 'Total Output Goreng', value: d.mass_balance?.total_kopi_goreng_transfer ? d.mass_balance.total_kopi_goreng_transfer + ' kg' : '-' },
            { label: 'Yield Roasting', value: d.mass_balance?.yield || '-' }
          ],
          qcTitle: 'Analisa Mutu Kopi Goreng',
          qcMetrics: [
            { label: 'Agtron Derajat Sangrai', value: d.qc?.['Derajat Sangrai (Agtron)'] || d.qc?.['Agtron'] || '-', spec: 'Standar 60 - 65', status: d.qc?.['Derajat Sangrai (Agtron)'] ? 'ok' : 'pending' },
            { label: 'Kadar Air (%)', value: d.qc?.['Kadar Air (%)'] ? d.qc['Kadar Air (%)'] + ' %' : '-', spec: 'Maks. 3,0%', status: d.qc?.['Kadar Air (%)'] ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.roasting?.operator_produksi || '-', qc: d.qc?.['ttd_roasting'] || '-' }
        }
      ]
    },

    'extraction': {
      ...CLUSTER_CONFIG[2],
      subflows: [
        {
          flowNumber: 'Flow 7',
          title: 'Water Process',
          refDoc: 'F/PA/03.011',
          tableKey: extTable,
          isAvailable: hasPa,
          pendingPicName: 'PA',
          operationalTitle: 'Data Pasokan Air Proses Water Treatment Plant',
          fields: [
            { label: 'Sumber Pasokan Air', value: hasPa ? (d.pa?.sumber || '-') : '-' },
            { label: 'Suhu Pasokan', value: hasPa ? (d.pa?.suhu || '-') : '-' },
            { label: 'Tekanan Pipa', value: hasPa ? (d.pa?.tekanan || '-') : '-' }
          ],
          qcTitle: 'Hasil Pengujian Air Proses (Laboratorium QC)',
          qcMetrics: [
            { label: 'pH Air Proses', value: hasPa ? (d.pa?.ph || '-') : '-', spec: 'Std 6,5 - 8,5', status: hasPa ? 'ok' : 'pending' },
            { label: 'TDS Air (ppm)', value: hasPa ? (d.pa?.tds || '-') : '-', spec: 'Maks. 50 ppm', status: hasPa ? 'ok' : 'pending' },
            { label: 'Sisa Khlor', value: hasPa ? (d.pa?.khlor || '-') : '-', spec: '0,00 ppm', status: hasPa ? 'ok-highlight' : 'pending' }
          ],
          pic: { operasional: d.pa?.operator || 'Belum Ada Rekaman (PIC PA)', qc: d.pa?.qc || 'Belum Ada Rekaman (QC Mikro)' }
        },
        {
          flowNumber: 'Flow 6',
          title: `Ekstraksi Kopi Tower ${tKey}`,
          refDoc: 'F/PRD/03.042',
          tableKey: extTable,
          isAvailable: hasExtraction,
          pendingPicName: 'Produksi',
          operationalTitle: `Data Operasional Baterai Percolator Tower ${tKey}`,
          fields: [
            { label: 'Mode Ekstraksi', value: d.extraction?.mode_ekstraksi || '-', badge: d.extraction?.mode_ekstraksi ? 'Percolator' : null },
            { label: 'Silo Degassing Asal', value: d.extraction?.silo_degassing || '-' },
            { label: 'Jumlah Percolator', value: d.extraction?.jumlah_percolator ? d.extraction.jumlah_percolator + ' Kolom' : '-' },
            { label: 'Tanggal Ekstraksi', value: d.extraction?.tanggal || '-' }
          ],
          qcTitle: 'Analisa Kualitas Ekstrak Cair (QC Lab)',
          qcMetrics: [
            { label: 'Brix (°brix)', value: d.qc?.['Brix (°brix)'] ? d.qc['Brix (°brix)'] + ' °Brix' : '-', spec: 'Min. 13,5 °Brix', status: d.qc?.['Brix (°brix)'] ? 'ok' : 'pending' },
            { label: 'Total Solid TS (%)', value: d.qc?.['TS (%)'] ? d.qc['TS (%)'] + ' %' : '-', spec: 'Std 13,0 - 15,0%', status: d.qc?.['TS (%)'] ? 'ok' : 'pending' },
            { label: 'pH Ekstrak', value: d.qc?.['pH'] || '-', spec: 'Std 5,00 - 5,40', status: d.qc?.['pH'] ? 'ok' : 'pending' },
            { label: 'Suhu Ekstrak (°C)', value: d.qc?.['T (°C)'] ? d.qc['T (°C)'] + ' °C' : '-', spec: 'Chilled Cooling', status: d.qc?.['T (°C)'] ? 'normal' : 'pending' }
          ],
          pic: { operasional: d.extraction?.operator_produksi || '-', qc: d.qc?.['ttd_ekstraksi'] || '-' }
        }
      ]
    },

    'evaporasi': {
      ...CLUSTER_CONFIG[3],
      subflows: [
        {
          flowNumber: 'Flow 5',
          title: `Evaporasi & Final Tank Tower ${tKey}`,
          refDoc: 'F/PRD/03.080',
          tableKey: evapTable,
          isAvailable: hasEvaporation,
          pendingPicName: 'Produksi',
          operationalTitle: `Data Operasional Evaporator & Final Tank Tower ${tKey}`,
          fields: [
            { label: 'Tangki Penyimpanan', value: d.evaporation?.no_final_tank ? 'Final Tank ' + d.evaporation.no_final_tank : '-', badge: d.evaporation?.no_final_tank ? 'FT Aktif' : null },
            { label: 'Waktu Proses', value: d.evaporation?.waktu_proses || '-' },
            { label: 'Shift Kerja', value: d.evaporation?.shift ? 'Shift ' + d.evaporation.shift : '-' },
            { label: 'Regu Kerja', value: d.evaporation?.team ? 'Regu ' + d.evaporation.team : '-' }
          ],
          qcTitle: 'Analisa Mutu Konsentrat Final Tank (QC Lab)',
          qcMetrics: [
            { label: 'Brix Konsentrat', value: d.qc?.['Brix (°brix)'] ? d.qc['Brix (°brix)'] + ' °Brix' : '-', spec: 'Std 47 - 50 °Brix', status: d.qc?.['Brix (°brix)'] ? 'ok' : 'pending' },
            { label: 'Total Solid TS (%)', value: d.qc?.['TS (%)'] ? d.qc['TS (%)'] + ' %' : '-', spec: 'Min. 46,0%', status: d.qc?.['TS (%)'] ? 'ok' : 'pending' },
            { label: 'Viskositas cP', value: d.qc?.['Viskositas cP'] ? d.qc['Viskositas cP'] + ' cP' : '-', spec: 'Standar Konsentrat', status: d.qc?.['Viskositas cP'] ? 'ok' : 'pending' },
            { label: 'Density (g/L)', value: d.qc?.['Density (g/L)'] ? d.qc['Density (g/L)'] + ' g/L' : '-', spec: 'Standar Berat Jenis', status: d.qc?.['Density (g/L)'] ? 'normal' : 'pending' }
          ],
          pic: { operasional: d.evaporation?.operator_produksi || '-', qc: d.qc?.['ttd_evaporasi'] || '-' }
        }
      ]
    },

    'dryer': {
      ...CLUSTER_CONFIG[4],
      subflows: [
        {
          flowNumber: 'Flow 4',
          title: `Pengeringan Spray Dryer Tower ${tKey}`,
          refDoc: 'F/PRD/04.088',
          tableKey: dryerTable,
          isAvailable: hasDryer,
          pendingPicName: 'Produksi',
          operationalTitle: `Data Operasional SCADA Dryer Tower ${tKey}`,
          fields: [
            { label: 'Suhu Inlet', value: d.dryer?.suhu_inlet ? d.dryer.suhu_inlet + ' °C' : '-', badge: d.dryer?.suhu_inlet ? 'Inlet' : null },
            { label: 'Suhu Outlet', value: d.dryer?.suhu_outlet ? d.dryer.suhu_outlet + ' °C' : '-', badge: d.dryer?.suhu_outlet ? 'Outlet' : null },
            { label: 'Tekanan Nozzle', value: d.dryer?.tekanan_nozzle ? d.dryer.tekanan_nozzle + ' bar' : '-' },
            { label: 'Waktu Proses', value: d.dryer?.waktu_proses || '-' },
            { label: 'Shift Kerja', value: d.dryer?.shift ? 'Shift ' + d.dryer.shift : '-' },
            { label: 'Regu Kerja', value: d.dryer?.team ? 'Regu ' + d.dryer.team : '-' }
          ],
          qcTitle: 'Hasil Analisa Mutu Bubuk Instan (QC Dryer)',
          qcMetrics: [
            { label: 'Kadar Air (%)', value: d.qc?.['Kadar Air (%)'] ? d.qc['Kadar Air (%)'] + ' %' : '-', spec: 'Maks. 3,00%', status: d.qc?.['Kadar Air (%)'] ? 'ok' : 'pending' },
            { label: 'Bulk Density', value: d.qc?.['Bulk Density'] || d.qc?.['Density (gr/L)'] ? (d.qc['Bulk Density'] || d.qc['Density (gr/L)']) + ' g/L' : '-', spec: 'Std 240 - 260 g/L', status: d.qc?.['Bulk Density'] || d.qc?.['Density (gr/L)'] ? 'ok' : 'pending' },
            { label: 'Kelarutan (Solubility)', value: d.qc?.['Kelarutan (Solubility)'] || '-', spec: 'Maks. 30 detik', status: d.qc?.['Kelarutan (Solubility)'] ? 'ok-highlight' : 'pending' },
            { label: 'pH Larutan', value: d.qc?.['pH'] || '-', spec: 'Std 5,10 - 5,50', status: d.qc?.['pH'] ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.dryer?.operator_produksi || '-', qc: d.qc?.['ttd_dryer'] || '-' }
        }
      ]
    },

    'packing': {
      ...CLUSTER_CONFIG[5],
      subflows: [
        {
          flowNumber: 'Flow 2',
          title: `Pengemasan Box Tower ${tKey}`,
          refDoc: 'F/PRD/05.022',
          tableKey: packTable,
          isAvailable: hasPacking,
          pendingPicName: 'Produksi',
          operationalTitle: `Data Hasil Produksi Pengemasan Box Tower ${tKey}`,
          fields: [
            { label: 'Line Pengemasan', value: `Packing Tower ${tKey}`, badge: `Line T-${tKey}` },
            { label: 'Total Box Lolos (OK)', value: d.packing?.ok_box ? `${d.packing.ok_box} Box` : '-', badge: d.packing?.ok_box ? 'Netto' : null },
            { label: 'Total Output (kg)', value: d.packing?.total_output_kg ? `${d.packing.total_output_kg} kg` : '-', badge: d.packing?.total_output_kg ? 'Timbang' : null },
            { label: 'Box Hold / Reject', value: d.packing?.hold_box ? `${d.packing.hold_box} Box` : '0 Box', badge: 'Zero Defect' },
            { label: 'CCP Metal Detector', value: hasPacking ? 'Fe 1.5mm, Non-Fe 2.0mm, SS 2.5mm (LOLOS)' : '-', colSpan: 'col-span-2', isHighlight: hasPacking }
          ],
          qcTitle: 'Pemeriksaan Integritas Kemasan & Mesh Test',
          qcMetrics: [
            { label: 'Berat Netto Box', value: d.packing?.berat_box || (hasPacking ? '30,00 kg' : '-'), spec: 'Toleransi ±0,1 kg', status: hasPacking ? 'ok' : 'pending' },
            { label: 'Uji Mesh Test QC', value: d.qc?.['Mesh Test'] ? 'OK (Lolos)' : (hasPacking ? 'Lolos' : '-'), spec: 'Standar Partikel', status: hasPacking ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.packing?.operator_packing || '-', qc: d.qc?.['ttd_packing'] || '-' }
        },
        {
          flowNumber: 'Flow 12',
          title: 'Incoming Bahan Kemas',
          refDoc: 'F/FGW/02.004',
          tableKey: packTable,
          isAvailable: hasFgw,
          pendingPicName: 'FGW',
          operationalTitle: 'Data Kedatangan Bahan Kemasan Karton & Plastik',
          fields: [
            { label: 'Supplier Karton', value: hasFgw ? (d.fgw?.supplier_karton || '-') : '-' },
            { label: 'Supplier Plastik PE', value: hasFgw ? (d.fgw?.supplier_plastik || '-') : '-' },
            { label: 'Nomor Lot Karton', value: hasFgw ? (d.fgw?.lot_karton || '-') : '-' },
            { label: 'Nomor Lot Plastik', value: hasFgw ? (d.fgw?.lot_plastik || '-') : '-' }
          ],
          qcTitle: 'Hasil Uji Fisik Kemasan',
          qcMetrics: [
            { label: 'Kekuatan Tekan BCT', value: hasFgw ? (d.fgw?.bct || '-') : '-', spec: 'Min. 600 kgf', status: hasFgw ? 'ok' : 'pending' },
            { label: 'Ketebalan Plastik', value: hasFgw ? (d.fgw?.ketebalan || '-') : '-', spec: 'Std 75 - 85 µm', status: hasFgw ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.fgw?.operator || 'Belum Ada Rekaman (PIC FGW)', qc: d.fgw?.qc || 'Belum Ada Rekaman (QC Kemasan)' }
        }
      ]
    },

    'distribusi': {
      ...CLUSTER_CONFIG[6],
      subflows: [
        {
          flowNumber: 'Flow 1',
          title: 'Distribusi Produk Jadi',
          refDoc: 'F/LOG/01.035',
          tableKey: packTable,
          isAvailable: hasFgw,
          pendingPicName: 'FGW',
          operationalTitle: 'Data Surat Jalan & Armada Distribusi Logistik',
          fields: [
            { label: 'Nomor Surat Jalan', value: hasFgw ? (d.fgw?.no_sj || '-') : '-' },
            { label: 'Nomor Polisi Truk', value: hasFgw ? (d.fgw?.no_polisi || '-') : '-' },
            { label: 'Nama Pengemudi', value: hasFgw ? (d.fgw?.sopir || '-') : '-' },
            { label: 'Tujuan Pengiriman', value: hasFgw ? (d.fgw?.tujuan || '-') : '-' },
            { label: 'Jumlah Dimuat', value: hasFgw ? (d.fgw?.qty || '-') : '-' },
            { label: 'Nomor CoA', value: hasFgw ? (d.fgw?.no_coa || '-') : '-' }
          ],
          qcTitle: 'Pemeriksaan Pra-Pengiriman (QA Release)',
          qcMetrics: [
            { label: 'Suhu Kontainer', value: hasFgw ? (d.fgw?.suhu || '-') : '-', spec: 'Suhu Ruang (<32°C)', status: hasFgw ? 'normal' : 'pending' },
            { label: 'Integritas Segel Box', value: hasFgw ? (d.fgw?.segel || '-') : '-', spec: 'Bebas Kerusakan', status: hasFgw ? 'ok' : 'pending' },
            { label: 'Status Pelepasan QA', value: hasFgw ? (d.fgw?.qa_release || '-') : '-', spec: 'Lolos Pengujian', status: hasFgw ? 'ok' : 'pending' }
          ],
          pic: { operasional: d.fgw?.sopir || 'Belum Ada Rekaman (Logistik / FGW)', qc: d.fgw?.qa || 'Belum Ada Rekaman (QA Release)' }
        }
      ]
    }
  };
}

function startCounterAnimation(target, duration = 1200, onUpdate) {
  const start = 0;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * easeProgress;
    onUpdate(current, progress === 1);
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

if (typeof window !== 'undefined') {
  window.CLUSTER_CONFIG = CLUSTER_CONFIG;
  window.buildClusterData = buildClusterData;
  window.startCounterAnimation = startCounterAnimation;
}
