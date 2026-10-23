/**
 * 7 Process Clusters Data Builder for PT. Santos Jaya Abadi Traceability
 * Fully mapped to Form F/QC/01.030 and real database schema with ZERO hallucination.
 * If data is not available in the database, fields and tables are kept empty with clear notice.
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
    name: 'Roasting & Mass Balance',
    clusterBadge: 'Cluster: Penyangraian & Rekonsiliasi Hasil',
    flows: ['Flow 8', 'Flow 10'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  },
  {
    key: 'extraction',
    name: 'Water Process & Ekstraksi',
    clusterBadge: 'Cluster: Pasokan Air Proses & Ekstraksi Percolator',
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
    clusterBadge: 'Cluster: Pengeringan Spray Dryer Tower',
    flows: ['Flow 4'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
  },
  {
    key: 'rework',
    name: 'Pengerjaan Ulang (Rework)',
    clusterBadge: 'Cluster: Pengerjaan Ulang Mutu & QC Rework',
    flows: ['Flow 3'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  },
  {
    key: 'packing',
    name: 'Pengemasan & Bahan Kemas',
    clusterBadge: 'Cluster: Packing Finished Good & Bahan Kemas',
    flows: ['Flow 2', 'Flow 12'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>',
  },
  {
    key: 'distribusi',
    name: 'Distribusi Produk Jadi',
    clusterBadge: 'Cluster: Finished Good Warehouse & Distribusi',
    flows: ['Flow 1'],
    iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>',
  },
];

function formatFlowDate(raw) {
  if (!raw || raw === '-') return null;
  const str = String(raw).trim();
  const slashMatch = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const [, d, m, y] = slashMatch;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(m, 10) - 1;
    return `${d.padStart(2, '0')} ${months[mIdx] || m} ${y}`;
  }
  const dashMatch = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (dashMatch) {
    const [, y, m, d] = dashMatch;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(m, 10) - 1;
    return `${d.padStart(2, '0')} ${months[mIdx] || m} ${y}`;
  }
  return str.length > 20 ? str.slice(0, 20) : str;
}

function withUnit(val, unit) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '-' || str.startsWith('-') || str === 'null' || str === 'undefined') return null;
  const u = String(unit).trim();
  if (str.toLowerCase().endsWith(u.toLowerCase())) return str;
  return `${str} ${u}`.trim();
}

function withPrefix(val, prefix) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '-' || str.startsWith('-') || str === 'null' || str === 'undefined') return null;
  const p = String(prefix).trim();
  if (str.toLowerCase().startsWith(p.toLowerCase())) return str;
  return `${p} ${str}`;
}

function cleanVal(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str || str === '-' || str === '-%' || str === '- cP' || str === 'null' || str === 'undefined') return null;
  return str;
}

const isValidVal = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (!s || s === '-' || s === '-%' || s === '- cP' || s === 'null' || s === 'undefined') return false;
  return true;
};

/**
 * Universal trace item resolver strictly following database schema (ZERO HALU)
 */
function getTraceItemValue(key, d) {
  if (!key || !d) return '-';

  // 1. QC Auto-Mapped Keys
  if (d.qc && d.qc[key] !== undefined && d.qc[key] !== null && String(d.qc[key]).trim() !== '' && String(d.qc[key]).trim() !== '-') {
    return String(d.qc[key]);
  }

  // 2. PACKING (Flow 2)
  if (key === 'packing_waktu_proses') return d.packing?.waktu_proses || '-';
  if (key === 'packing_shift') return withPrefix(d.packing?.shift, 'Shift') || '-';
  if (key === 'packing_operator') return d.packing?.operator_packing || '-';
  if (key === 'packing_helper') return cleanVal(d.packing?.team) || '-';
  if (key === 'packing_ccp') return withPrefix(d.packing?.dehumidifier, 'Dehumidifier:') || '-';
  if (key === 'packing_suhu_rh') return d.packing?.suhu_rh_packing || '-';
  if (key === 'packing_kebersihan') return '-';
  if (key === 'packing_lot_karton') return d.fgw?.lot_karton || '-';
  if (key === 'packing_supplier_karton') return d.fgw?.supplier_karton || '-';
  if (key === 'packing_lot_plastik') return d.fgw?.lot_plastik || '-';
  if (key === 'packing_supplier_plastik') return d.fgw?.supplier_plastik || '-';
  if (key === 'packing_abnormalitas') return d.packing?.abnormalitas || '-';
  if (key === 'packing_berat_box') return d.packing?.berat_box || '-';
  if (key === 'packing_total_output') return cleanVal(d.packing?.total_output) || (d.packing?.total_output_kg ? withUnit(d.packing.total_output_kg, 'kg') : '-');

  // 3. DRYER (Flow 4)
  if (key === 'dryer_waktu_proses') return d.dryer?.waktu_proses || '-';
  if (key === 'dryer_operator') return d.dryer?.operator_produksi || '-';
  if (key === 'dryer_final_tank') return withPrefix(d.dryer?.final_tank, 'FT C0') || '-';
  if (key === 'dryer_mode') return d.dryer?.mode || '-';
  if (key === 'dryer_parameter_kritis') return d.dryer?.raw_rows?.length ? '' : '-';
  if (key === 'dryer_abnormalitas') return d.dryer?.abnormalitas || '-';

  // 4. EVAPORATION (Flow 5)
  if (key === 'evap_waktu_proses') return d.evaporation?.waktu_proses || '-';
  if (key === 'evap_operator') return d.evaporation?.operator_produksi || '-';
  if (key === 'evap_destination_tank') return withPrefix(d.evaporation?.no_final_tank, 'FT C0') || '-';
  if (key === 'evap_parameter_kritis') return d.evaporation?.raw_rows?.length ? '' : '-';
  if (key === 'evap_abnormalitas') return d.evaporation?.abnormalitas || '-';

  // 5. EXTRACTION (Flow 6)
  if (key === 'ext_waktu_proses') return d.extraction?.waktu_proses || '-';
  if (key === 'ext_mode') return d.extraction?.mode_ekstraksi || '-';
  if (key === 'ext_percolator') return withUnit(d.extraction?.jumlah_percolator, 'siklus') || '-';
  if (key === 'ext_operator') return d.extraction?.operator_produksi || '-';
  if (key === 'ext_silo') return withPrefix(d.extraction?.silo_degassing, 'Silo') || '-';
  if (key === 'ext_parameter_kritis') return d.extraction?.raw_rows?.length ? '' : '-';
  if (key === 'ext_abnormalitas') return d.extraction?.abnormalitas || '-';

  // 6. ROASTING (Flow 8)
  if (key === 'roast_waktu_proses') return d.roasting?.waktu_proses || '-';
  if (key === 'roast_mesin') return d.roasting?.mesin_goreng || '-';
  if (key === 'roast_mode') return d.roasting?.jenis_kopi_goreng || '-';
  if (key === 'roast_silo') return withPrefix(d.roasting?.silo_degassing, 'Silo') || '-';
  if (key === 'roast_jumlah_batch') return withUnit(d.roasting?.jumlah_batch, 'batch') || '-';
  if (key === 'roast_operator') return d.roasting?.operator_produksi || '-';
  if (key === 'roast_parameter_kritis') return d.roasting?.raw_rows?.length ? '' : '-';
  if (key === 'roast_abnormalitas') return d.roasting?.catatan_abnormalitas || '-';
  if (key === 'roast_jenis_biji') return d.roasting?.jenis_biji_mentah || '-';
  if (key === 'roast_silocell') return withPrefix(d.roasting?.silo_cell_terpakai, 'Cell') || '-';

  // 7. UPBM (Flow 9)
  if (key === 'upbm_waktu_inload') return d.upbm?.waktu_inload || '-';
  if (key === 'upbm_bstb') return d.upbm?.nomor_bstb || '-';
  if (key === 'upbm_jenis_biji') return d.upbm?.jenis_biji_kopi_mentah || '-';
  if (key === 'upbm_silo_cell') return d.upbm?.silo_cell || '-';
  if (key === 'upbm_disposisi') return d.upbm?.disposisi || '-';
  if (key === 'upbm_total_biji') return d.upbm?.total_kopi_mentah_dipakai || '-';
  if (key === 'upbm_operator') return d.upbm?.operator_produksi || '-';
  if (key === 'upbm_abnormalitas') return d.upbm?.catatan_abnormalitas || '-';

  // 8. MASS BALANCE (Flow 10)
  if (key === 'mb_output') return d.mass_balance?.total_output_produk || '-';
  if (key === 'mb_kopi_goreng') return d.mass_balance?.total_kopi_goreng_transfer || '-';
  if (key === 'mb_kopi_mentah') return d.mass_balance?.total_kopi_mentah || '-';
  if (key === 'mb_rasio_ic') return d.mass_balance?.rasio_ic || d.mass_balance?.icRatio || '-';

  return '-';
}

function buildClusterData(traceResult, tower = '1') {
  const d = traceResult || {};
  const tKey = String(tower || '1');
  const twSuffix = tKey === '2' ? 't2' : 't1';
  const extTable = tKey === '2' ? 'extraction_tower_2' : 'extraction_tower_1';
  const evapTable = tKey === '2' ? 'evaporation_tower_2' : 'evaporation_tower_1';
  const dryerTable = tKey === '2' ? 'dryer_tower_2' : 'dryer_tower_1';
  const packTable = tKey === '2' ? 'packing_tower_2' : 'packing_tower_1';

  // Real Database checks
  const hasPacking = Boolean(d.packing && !d.packing.error && d.packing.raw_rows?.length);
  const hasDryer = Boolean(d.dryer && !d.dryer.error && d.dryer.raw_rows?.length);
  const hasEvaporation = Boolean(d.evaporation && !d.evaporation.error && d.evaporation.raw_rows?.length);
  const hasExtraction = Boolean(d.extraction && !d.extraction.error && d.extraction.raw_rows?.length);
  const hasRoasting = Boolean(d.roasting && !d.roasting.error && d.roasting.raw_rows?.length);
  const hasUpbm = Boolean(d.upbm && !d.upbm.error && (d.upbm.waktu_inload || d.upbm.silo_cell));
  const hasRmw = Boolean(d.rmw && !d.rmw.error && d.rmw.raw_rows?.length);
  const hasPa = Boolean(d.pa && !d.pa.error && d.pa.raw_rows?.length);
  const hasFgw = Boolean(d.fgw && !d.fgw.error && d.fgw.raw_rows?.length);
  const hasRework = false;

  // Machine naming
  const roastMachineCode = d.roasting?.mesin_goreng || 'PRB';
  const roastMachineName = roastMachineCode === 'SCL 1'
    ? 'Scolari 1'
    : (roastMachineCode === 'SCL 2'
      ? 'Scolari 2'
      : (roastMachineCode === 'PRB' ? 'Probat Line 1' : roastMachineCode));
  const roastTableKey = d.roasting?.table || (roastMachineCode === 'SCL 1' ? 'roasting_scolari_1' : (roastMachineCode === 'SCL 2' ? 'roasting_scolari_2' : 'roasting_probat'));

  // Dates
  const roastDate = formatFlowDate(d.roasting?.tanggal || d.roasting?.waktu_proses);
  const extDate = formatFlowDate(d.extraction?.tanggal || d.extraction?.waktu_proses);
  const evapDate = formatFlowDate(d.evaporation?.tanggal || d.evaporation?.waktu_proses);
  const dryDate = formatFlowDate(d.dryer?.tanggal || d.dryer?.waktu_proses);
  const packDate = formatFlowDate(d.packing?.tanggal || d.packing?.waktu_proses);

  // Helper to filter out null/empty fields
  const cleanFields = (arr) => (arr || []).filter(f => f && isValidVal(f.value));
  const cleanMetrics = (arr) => (arr || []).filter(m => m && isValidVal(m.value));

  return {
    // ══════════════════════════════════════════════════════════════
    // CLUSTER 1: GUDANG BAHAN BAKU & SILO UPBM (Flow 11 & Flow 9)
    // ══════════════════════════════════════════════════════════════
    'raw-material': {
      ...CLUSTER_CONFIG[0],
      subflows: [
        {
          flowNumber: 'Flow 11',
          title: 'INCOMING BAHAN',
          refDoc: 'Form F/WHS/01.002 & F/QC/01.030',
          isAvailable: hasRmw,
          pendingPicName: 'RMW & QC',
          noticeText: 'Data penerimaan biji kopi mentah belum tercatat di database MySQL.',
          operationalTitle: 'Data Kedatangan & Logistik Bahan Baku (PIC RMW)',
          fields: hasRmw ? cleanFields([
            { label: 'Tanggal Kedatangan', value: formatFlowDate(d.rmw?.tanggal) },
            { label: 'Jenis Bahan', value: d.rmw?.jenis_kopi },
            { label: 'Nama Supplier', value: d.rmw?.supplier },
            { label: 'Nomor Truk', value: d.rmw?.no_truk },
            { label: 'Nomor Surat Jalan', value: d.rmw?.no_sj },
            { label: 'Jumlah (kg)', value: d.rmw?.qty_kg ? d.rmw.qty_kg + ' kg' : null },
          ]) : [],
          qcTitle: 'Analisa Kualitas Kedatangan Biji Kopi Mentah (QC Kedatangan)',
          qcMetrics: hasRmw ? cleanMetrics([
            { label: 'Kadar Air (%)', value: d.rmw?.kadar_air ? d.rmw.kadar_air + '%' : null, spec: 'Standar < 12,0%' },
            { label: 'Biji OK (Grade)', value: d.rmw?.biji_ok ? d.rmw.biji_ok + '%' : null, spec: 'Min. 85,0%' },
            { label: '% Foreign Matter', value: d.rmw?.fm, spec: 'Bebas Benda Asing' },
          ]) : [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.rmw?.operator || '-', qc: d.rmw?.qc || '-' },
        },
        {
          flowNumber: 'Flow 9',
          title: 'UPBM',
          refDoc: 'Form F/UPBM/01.008 & F/QC/01.030',
          isAvailable: hasUpbm,
          pendingPicName: 'UPBM',
          noticeText: 'Data serah terima dan inload Silo Cell UPBM belum tercatat di database MySQL.',
          operationalTitle: 'Data Serah Terima & Inload Silo Cell (PIC UPBM)',
          fields: hasUpbm ? cleanFields([
            { label: 'Waktu Inload', value: d.upbm?.waktu_inload },
            { label: 'Nomor BSTB Inload', value: d.upbm?.nomor_bstb },
            { label: 'Jenis Biji Kopi Mentah', value: d.upbm?.jenis_biji_kopi_mentah },
            { label: 'Silo Cell Digunakan', value: d.upbm?.silo_cell },
            { label: 'Disposisi UPBM', value: d.upbm?.disposisi },
            { label: 'Total Kopi Mentah Dipakai', value: d.upbm?.total_kopi_mentah_dipakai },
            { label: 'Catatan Abnormalitas', value: d.upbm?.catatan_abnormalitas },
          ]) : [],
          qcTitle: 'Pemeriksaan Jalur Transfer & Silo Cell UPBM',
          qcMetrics: [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.upbm?.operator_produksi || '-', qc: '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 2: ROASTING & MASS BALANCE (Flow 8 & Flow 10)
    // ══════════════════════════════════════════════════════════════
    'roasting': {
      ...CLUSTER_CONFIG[1],
      clusterBadge: `Cluster: Penyangraian ${roastMachineName} & Neraca Massa`,
      subflows: [
        {
          flowNumber: 'Flow 8',
          title: 'ROASTING',
          refDoc: 'Form F/PRD/02.015 & F/QC/01.030',
          isAvailable: hasRoasting,
          pendingPicName: 'Produksi',
          processDate: roastDate,
          operationalTitle: `Data Operasional Penyangraian ${roastMachineName} (PIC Produksi)`,
          fields: hasRoasting ? cleanFields([
            { label: 'Waktu Proses', value: d.roasting?.waktu_proses },
            { label: 'Mesin Goreng', value: roastMachineName, badge: roastMachineCode },
            { label: 'Jenis Kopi Goreng', value: d.roasting?.jenis_kopi_goreng, badge: 'Produk' },
            { label: 'Silo Degassing Tujuan', value: withPrefix(d.roasting?.silo_degassing, 'Silo') },
            { label: 'Jumlah Sesi Sangrai', value: withUnit(d.roasting?.jumlah_batch, 'batch') },
            { label: 'Operator Produksi', value: d.roasting?.operator_produksi },
            { label: 'Jenis Biji Kopi Mentah', value: d.roasting?.jenis_biji_mentah },
            { label: 'SiloCell yang Digunakan', value: withPrefix(d.roasting?.silo_cell_terpakai, 'Cell') },
            { label: 'Total Input Mentah', value: d.roasting?.total_kopi_mentah_kg ? withUnit(parseFloat(d.roasting.total_kopi_mentah_kg).toLocaleString(), 'kg') : null },
            { label: 'Total Output Matang', value: d.roasting?.total_kopi_matang_kg ? withUnit(parseFloat(d.roasting.total_kopi_matang_kg).toLocaleString(), 'kg') : null },
            { label: 'Catatan Abnormalitas', value: d.roasting?.catatan_abnormalitas },
          ]) : [],
          qcTitle: 'Analisa Kualitas Kopi Goreng (Laboratorium QC)',
          qcMetrics: cleanMetrics([
            { label: 'Visual / FM', value: d.qc?.qc_roast_visual_fm, spec: 'Bebas Benda Asing' },
            { label: 'Warna', value: d.qc?.qc_roast_warna, spec: 'Standar 110 - 120' },
            { label: 'Kadar Air', value: withUnit(d.qc?.qc_roast_kadar_air, '%'), spec: 'Maks. 7,0%' },
            { label: 'pH', value: d.qc?.qc_roast_ph, spec: 'Std 6,00 - 6,50' },
            { label: 'Brix', value: d.qc?.qc_roast_brix, spec: 'Std 1,15 - 1,25' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_roast_wangi },
            { label: 'Asam', value: d.qc?.qc_roast_asam },
            { label: 'Pahit', value: d.qc?.qc_roast_pahit },
            { label: 'Sepat', value: d.qc?.qc_roast_sepat },
            { label: 'Body', value: d.qc?.qc_roast_body },
            { label: 'Bau Asing', value: d.qc?.qc_roast_bau_asing },
          ]),
          prodTable: hasRoasting ? {
            pic: 'Produksi',
            title: `Tabel Operasional Penyangraian (${roastMachineName})`,
            tableName: roastTableKey,
            rows: d.roasting?.raw_rows || [],
            columns: d.roasting?.columns || [],
          } : null,
          qcTable: null,
          pic: {
            operasional: d.roasting?.operator_produksi || '-',
            qc: d.qc?.qc_roast_pic || '-',
          },
        },
        {
          flowNumber: 'Flow 10',
          title: 'MASS BALANCE PRODUKSI',
          refDoc: 'Form F/PRD/02.016 & F/QC/01.030',
          isAvailable: hasRoasting && Boolean(d.mass_balance),
          pendingPicName: 'Produksi',
          processDate: roastDate,
          operationalTitle: 'Data Neraca Massa & Efisiensi Konversi (PIC Produksi)',
          fields: cleanFields([
            { label: 'Total Output Produk Jadi', value: d.mass_balance?.total_output_produk },
            { label: 'Total Kopi Goreng Ditransfer', value: d.mass_balance?.total_kopi_goreng_transfer },
            { label: 'Total Kopi Mentah', value: d.mass_balance?.total_kopi_mentah },
            { label: 'Rasio IC (Konversi)', value: d.mass_balance?.rasio_ic || d.mass_balance?.icRatio, badge: 'Rasio IC' },
            { label: 'Yield Penyangraian', value: d.mass_balance?.yield_roasting || d.roasting?.yield_roasting, badge: 'Yield' },
          ]),
          qcTitle: 'Verifikasi Neraca Massa (Yield & Rasio IC)',
          qcMetrics: cleanMetrics([
            { label: 'Rasio IC', value: d.mass_balance?.rasio_ic || d.mass_balance?.icRatio, spec: 'Std 2.00 - 4.50' },
            { label: 'Yield Roasting', value: d.mass_balance?.yield_roasting || d.roasting?.yield_roasting, spec: 'Std 86.0 - 89.0%' },
          ]),
          prodTable: d.mass_balance ? {
            pic: 'Produksi',
            title: 'Rekonsiliasi Neraca Massa Produksi',
            tableName: 'mass_balance_reconciliation',
            rows: [{
              'Total Kopi Mentah': d.mass_balance.total_kopi_mentah || '-',
              'Total Kopi Goreng': d.mass_balance.total_kopi_goreng_transfer || '-',
              'Total Output Jadi': d.mass_balance.total_output_produk || '-',
              'Yield Roasting': d.mass_balance.yield_roasting || d.roasting?.yield_roasting || '-',
              'Rasio IC': d.mass_balance.rasio_ic || d.mass_balance.icRatio || '-',
            }],
            columns: ['Total Kopi Mentah', 'Total Kopi Goreng', 'Total Output Jadi', 'Yield Roasting', 'Rasio IC'],
          } : null,
          qcTable: null,
          pic: { operasional: d.roasting?.operator_produksi || d.packing?.operator_packing || '-', qc: d.qc?.qc_packing_pic || '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 3: WATER PROCESS & EKSTRAKSI (Flow 7 & Flow 6)
    // ══════════════════════════════════════════════════════════════
    'extraction': {
      ...CLUSTER_CONFIG[2],
      subflows: [
        {
          flowNumber: 'Flow 7',
          title: 'WATER PROCESS',
          refDoc: 'Form F/PA/03.011 & F/QC/01.030',
          isAvailable: hasPa,
          pendingPicName: 'PA',
          noticeText: 'Data hasil pengujian dan pasokan air proses WTP belum tercatat di database MySQL.',
          operationalTitle: 'Data Pasokan Air Proses WTP Plant (PIC PA)',
          fields: hasPa ? cleanFields([
            { label: 'Waktu Analisa', value: formatFlowDate(d.pa?.tanggal) },
            { label: 'Sumber Pasokan Air', value: d.pa?.sumber },
            { label: 'Suhu Pasokan', value: d.pa?.suhu },
            { label: 'Tekanan Pipa Distribusi', value: d.pa?.tekanan },
          ]) : [],
          qcTitle: 'Analisa Fisika Kimia & Mikrobiologi Air Proses (QC PA)',
          qcMetrics: hasPa ? cleanMetrics([
            { label: 'pH Air Proses', value: d.pa?.ph, spec: 'Std 6.5 - 8.5' },
            { label: 'TDS (ppm)', value: d.pa?.tds, spec: 'Maks. 50 ppm' },
            { label: 'Kekeruhan (NTU)', value: d.pa?.kekeruhan, spec: 'Maks. 5.0 NTU' },
          ]) : [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.pa?.operator || '-', qc: d.pa?.qc || '-' },
        },
        {
          flowNumber: 'Flow 6',
          title: 'EXTRACTION',
          refDoc: 'Form F/PRD/03.042 & F/QC/01.030',
          isAvailable: hasExtraction,
          pendingPicName: 'Produksi',
          processDate: extDate,
          operationalTitle: `Data Operasional Baterai Percolator Tower ${tKey} (PIC Produksi)`,
          fields: hasExtraction ? cleanFields([
            { label: 'Waktu Proses', value: d.extraction?.waktu_proses },
            { label: 'Mode Ekstraksi', value: d.extraction?.mode_ekstraksi, badge: d.extraction?.mode_ekstraksi || null },
            { label: 'Jumlah Percolator', value: withUnit(d.extraction?.jumlah_percolator, 'siklus') },
            { label: 'Silo Degassing Asal', value: withPrefix(d.extraction?.silo_degassing, 'Silo') },
            { label: 'Operator Produksi', value: d.extraction?.operator_produksi },
            { label: 'Catatan Abnormalitas', value: d.extraction?.abnormalitas },
          ]) : [],
          qcTitle: 'Analisa Kualitas Ekstrak Cair Aroma & Hidrolise (Laboratorium QC)',
          qcMetrics: cleanMetrics([
            { label: 'Visual / FM', value: d.qc?.qc_aroma_visual_fm, spec: 'Bebas Benda Asing' },
            { label: 'Brix / TS Aroma', value: d.qc?.qc_aroma_brix_ts, spec: 'Total Solid' },
            { label: 'pH Aroma', value: d.qc?.qc_aroma_ph, spec: 'Std 4.50 - 5.50' },
            { label: 'Suhu Aroma (°C)', value: withUnit(d.qc?.qc_aroma_suhu, '°C'), spec: 'Chilled Cooling' },
            { label: 'Brix / TS Hidrolise', value: d.qc?.qc_hydro_brix_ts, spec: 'Total Solid' },
            { label: 'pH Hidrolise', value: d.qc?.qc_hydro_ph, spec: 'Std 4.50 - 5.50' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi Aroma', value: d.qc?.qc_aroma_wangi },
            { label: 'Pahit Aroma', value: d.qc?.qc_aroma_pahit },
            { label: 'Asam Aroma', value: d.qc?.qc_aroma_asam },
            { label: 'Wangi Hydro', value: d.qc?.qc_hydro_wangi },
            { label: 'Pahit Hydro', value: d.qc?.qc_hydro_pahit },
            { label: 'Asam Hydro', value: d.qc?.qc_hydro_asam },
          ]),
          extraQcBlocks: d.qc?.qc_grind_rga_rgb ? [
            {
              title: 'Analisa Kualitas Grinding & Particle Size Mesh Distribution',
              badge: 'Grinding QC',
              items: cleanFields([
                { label: 'RGA / RGB', value: d.qc?.qc_grind_rga_rgb },
                { label: 'Kadar Air Grinding', value: withUnit(d.qc?.qc_grind_kadar_air, '%') },
                { label: 'Density Grinding', value: withUnit(d.qc?.qc_grind_density, 'g/L') },
                { label: 'Mesh <850', value: d.qc?.qc_grind_mesh_lt850 },
                { label: 'Mesh 850-<1000', value: d.qc?.qc_grind_mesh_850_1000 },
                { label: 'Mesh 1000-<2350', value: d.qc?.qc_grind_mesh_1000_2350 },
                { label: 'Mesh 2350-<3350', value: d.qc?.qc_grind_mesh_2350_3350 },
                { label: 'Mesh 3350-<4000', value: d.qc?.qc_grind_mesh_3350_4000 },
                { label: 'Mesh 4000-<5600', value: d.qc?.qc_grind_mesh_4000_5600 },
                { label: 'Mesh 5600-<6300', value: d.qc?.qc_grind_mesh_5600_6300 },
                { label: 'Mesh >6300', value: d.qc?.qc_grind_mesh_gt6300 },
              ]),
            },
          ] : [],
          prodTable: hasExtraction ? {
            pic: 'Produksi',
            title: `Tabel Operasional Ekstraksi Tower ${tKey}`,
            tableName: extTable,
            rows: d.extraction?.raw_rows || [],
            columns: d.extraction?.columns || [],
          } : null,
          qcTable: (d.qc_raw?.aroma?.raw_rows?.length || d.qc_raw?.hydro?.raw_rows?.length) ? {
            pic: 'QC',
            title: `Tabel QC Aroma & Hydro Ekstraksi (qc_aroma_${twSuffix})`,
            tableName: `qc_aroma_${twSuffix}`,
            rows: d.qc_raw?.aroma?.raw_rows?.length ? d.qc_raw.aroma.raw_rows : (d.qc_raw?.hydro?.raw_rows || []),
            columns: (d.qc_raw?.aroma?.raw_rows?.[0] || d.qc_raw?.hydro?.raw_rows?.[0]) ? Object.keys(d.qc_raw?.aroma?.raw_rows?.[0] || d.qc_raw?.hydro?.raw_rows?.[0]) : [],
          } : null,
          pic: { operasional: d.extraction?.operator_produksi || '-', qc: d.qc?.qc_aroma_pic || d.qc?.qc_hydro_pic || '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 4: EVAPORASI, FINAL TANK & REWORK (Flow 5 & Flow 3)
    // ══════════════════════════════════════════════════════════════
    'evaporasi': {
      ...CLUSTER_CONFIG[3],
      subflows: [
        {
          flowNumber: 'Flow 5',
          title: 'EVAPORATION',
          refDoc: 'Form F/PRD/03.080 & F/QC/01.030',
          isAvailable: hasEvaporation,
          pendingPicName: 'Produksi',
          processDate: evapDate,
          operationalTitle: `Data Operasional Evaporator & Final Tank Tower ${tKey} (PIC Produksi)`,
          fields: hasEvaporation ? cleanFields([
            { label: 'Waktu Proses', value: d.evaporation?.waktu_proses },
            { label: 'Destination Final Tank', value: withPrefix(d.evaporation?.no_final_tank, 'FT C0'), badge: 'FT Tujuan' },
            { label: 'Operator Produksi', value: d.evaporation?.operator_produksi },
            { label: 'Catatan Abnormalitas', value: d.evaporation?.abnormalitas },
          ]) : [],
          qcTitle: 'Analisa Kualitas Produk Evaporation Falling Film (Laboratorium QC)',
          qcMetrics: cleanMetrics([
            { label: 'Visual / FM', value: d.qc?.qc_evap_visual_fm, spec: 'Bebas Benda Asing' },
            { label: 'Brix / TS Evap', value: d.qc?.qc_evap_brix_ts, spec: 'Konsentrat Evap' },
            { label: 'pH Evap', value: d.qc?.qc_evap_ph, spec: 'Std 5.20 - 5.60' },
            { label: 'Density (g/L)', value: withUnit(d.qc?.qc_evap_density, 'g/L'), spec: 'Berat Jenis' },
            { label: 'Viskositas cP', value: withUnit(d.qc?.qc_evap_viskositas, 'cP'), spec: 'Viskositas' },
            { label: 'Screening Test', value: d.qc?.qc_evap_screening, spec: 'Std Screening' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_evap_wangi },
            { label: 'Pahit', value: d.qc?.qc_evap_pahit },
            { label: 'Asam', value: d.qc?.qc_evap_asam },
          ]),
          extraQcBlocks: d.qc?.qc_ft_nomor ? [
            {
              title: 'Analisa Kualitas Produk Final Tank (After Circulation)',
              badge: 'Final Tank QC',
              items: cleanFields([
                { label: 'Nomor Final Tank', value: withPrefix(d.qc.qc_ft_nomor, 'FT') },
                { label: 'Pure Aroma (kg)', value: withUnit(d.qc?.qc_ft_pure_aroma, 'kg') },
                { label: 'Level Final Tank', value: d.qc?.qc_ft_level },
                { label: 'Visual / FM', value: d.qc?.qc_ft_visual_fm },
                { label: 'Brix / TS FT', value: d.qc?.qc_ft_brix_ts },
                { label: 'pH FT', value: d.qc?.qc_ft_ph },
                { label: 'Viskositas cP', value: withUnit(d.qc?.qc_ft_viskositas, 'cP') },
                { label: 'Density (g/L)', value: withUnit(d.qc?.qc_ft_density, 'g/L') },
              ]),
            },
          ] : [],
          prodTable: hasEvaporation ? {
            pic: 'Produksi',
            title: `Tabel Operasional Evaporasi Tower ${tKey}`,
            tableName: evapTable,
            rows: d.evaporation?.raw_rows || [],
            columns: d.evaporation?.columns || [],
          } : null,
          qcTable: (d.qc_raw?.evaporasi?.raw_rows?.length || d.qc_raw?.final_tank?.raw_rows?.length) ? {
            pic: 'QC',
            title: `Tabel QC Evaporasi Tower ${tKey} (qc_evaporasi_${twSuffix})`,
            tableName: `qc_evaporasi_${twSuffix}`,
            rows: d.qc_raw?.evaporasi?.raw_rows?.length ? d.qc_raw.evaporasi.raw_rows : (d.qc_raw?.final_tank?.raw_rows || []),
            columns: (d.qc_raw?.evaporasi?.raw_rows?.[0] || d.qc_raw?.final_tank?.raw_rows?.[0]) ? Object.keys(d.qc_raw?.evaporasi?.raw_rows?.[0] || d.qc_raw?.final_tank?.raw_rows?.[0]) : [],
          } : null,
          pic: { operasional: d.evaporation?.operator_produksi || '-', qc: d.qc?.qc_ft_pic || d.qc?.qc_evap_pic || '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 5: SPRAY DRYER (Flow 4)
    // ══════════════════════════════════════════════════════════════
    'dryer': {
      ...CLUSTER_CONFIG[4],
      subflows: [
        {
          flowNumber: 'Flow 4',
          title: 'DRYER',
          refDoc: 'Form F/PRD/04.088 & F/QC/01.030',
          isAvailable: hasDryer,
          pendingPicName: 'Produksi',
          processDate: dryDate,
          operationalTitle: `Data Operasional Pengeringan Spray Dryer Tower ${tKey} (PIC Produksi)`,
          fields: hasDryer ? cleanFields([
            { label: 'Waktu Proses', value: d.dryer?.waktu_proses },
            { label: 'Final Tank (Tangki Asal)', value: withPrefix(d.dryer?.final_tank, 'FT C0'), badge: 'FT Asal' },
            { label: 'Mode Dryer', value: d.dryer?.mode, badge: d.dryer?.mode || null },
            { label: 'Nama Produk', value: d.dryer?.nama_produk },
            { label: 'Operator Produksi', value: d.dryer?.operator_produksi },
            { label: 'Catatan Abnormalitas', value: d.dryer?.abnormalitas },
          ]) : [],
          qcTitle: 'Monitoring Kualitas Produk di VF2 (QC Dryer)',
          qcMetrics: cleanMetrics([
            { label: 'Kadar Air (%)', value: withUnit(d.qc?.qc_dryer_vf2_kadar_air, '%'), spec: 'Maks. 3,00%' },
            { label: 'Density (g/L)', value: withUnit(d.qc?.qc_dryer_vf2_density, 'g/L'), spec: 'Std 240 - 260 g/L' },
            { label: 'Foreign Matter', value: d.qc?.qc_dryer_vf2_fm, spec: 'Bebas Benda Asing' },
            { label: 'Visual', value: d.qc?.qc_dryer_vf2_visual, spec: 'Bubuk Kering Sesuai' },
            { label: 'Warna', value: d.qc?.qc_dryer_vf2_warna, spec: 'Standar Agtron' },
            { label: 'Brix', value: d.qc?.qc_dryer_vf2_brix, spec: 'Std Brix Rekonstitusi' },
            { label: 'pH', value: d.qc?.qc_dryer_vf2_ph, spec: 'Std 5,10 - 5,50' },
            { label: 'Floating Particles', value: d.qc?.qc_dryer_vf2_floating !== undefined && d.qc?.qc_dryer_vf2_floating !== null && String(d.qc?.qc_dryer_vf2_floating) !== '-' ? String(d.qc.qc_dryer_vf2_floating) : null, spec: '0 (Nol Partikel)' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_dryer_vf2_wangi },
            { label: 'Pahit', value: d.qc?.qc_dryer_vf2_pahit },
            { label: 'Asam', value: d.qc?.qc_dryer_vf2_asam },
            { label: 'Body', value: d.qc?.qc_dryer_vf2_body },
            { label: 'Sepat', value: d.qc?.qc_dryer_vf2_sepat },
          ]),
          prodTable: hasDryer ? {
            pic: 'Produksi',
            title: `Tabel Operasional Spray Dryer Tower ${tKey}`,
            tableName: dryerTable,
            rows: d.dryer?.raw_rows || [],
            columns: d.dryer?.columns || [],
          } : null,
          qcTable: (d.qc_raw?.dryer_vf2?.raw_rows?.length || d.qc_raw?.dryer?.raw_rows?.length) ? {
            pic: 'QC',
            title: `Tabel QC Dryer VF2 Tower ${tKey} (qc_dryer_${twSuffix})`,
            tableName: `qc_dryer_${twSuffix}`,
            rows: d.qc_raw?.dryer_vf2?.raw_rows?.length ? d.qc_raw.dryer_vf2.raw_rows : (d.qc_raw?.dryer?.raw_rows || []),
            columns: (d.qc_raw?.dryer_vf2?.raw_rows?.[0] || d.qc_raw?.dryer?.raw_rows?.[0]) ? Object.keys(d.qc_raw?.dryer_vf2?.raw_rows?.[0] || d.qc_raw?.dryer?.raw_rows?.[0]) : [],
          } : null,
          pic: { operasional: d.dryer?.operator_produksi || '-', qc: d.qc?.qc_dryer_vf2_pic || '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 6: PENGERJAAN ULANG / REWORK (Flow 3) - SETELAH DRYER
    // ══════════════════════════════════════════════════════════════
    'rework': {
      ...CLUSTER_CONFIG[5],
      subflows: [
        {
          flowNumber: 'Flow 3',
          title: 'REWORK',
          iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
          refDoc: 'Form F/PRD/03.090 & F/QC/01.030',
          isAvailable: false,
          pendingPicName: 'Produksi & QC',
          noticeText: 'Data pengerjaan ulang (rework) belum tercatat di database MySQL.',
          operationalTitle: 'Data Pengerjaan Ulang Rework (PIC Produksi)',
          fields: [],
          qcTitle: 'Analisa Kualitas Rework (Laboratorium QC)',
          qcMetrics: [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: '-', qc: '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 7: PENGEMASAN & BAHAN KEMAS (Flow 2 & Flow 12)
    // ══════════════════════════════════════════════════════════════
    'packing': {
      ...CLUSTER_CONFIG[6],
      subflows: [
        {
          flowNumber: 'Flow 2',
          title: 'PACKING',
          refDoc: 'Form F/PRD/05.022 & F/QC/01.030',
          isAvailable: hasPacking,
          pendingPicName: 'Produksi',
          processDate: packDate,
          operationalTitle: `Data Operasional Pengemasan Box Tower ${tKey} (PIC Produksi)`,
          fields: hasPacking ? cleanFields([
            { label: 'Waktu Proses', value: d.packing?.waktu_proses },
            { label: 'Shift Kerja', value: withPrefix(d.packing?.shift, 'Shift') },
            { label: 'Nama Operator Packing', value: d.packing?.operator_packing },
            { label: 'Nama Helper Packing', value: cleanVal(d.packing?.team) },
            { label: 'CCP Dehumidifier', value: withPrefix(d.packing?.dehumidifier, 'Dehumidifier:') },
            { label: 'Suhu & RH Ruang Packing', value: d.packing?.suhu_rh_packing },
            { label: 'Berat Box Netto', value: d.packing?.berat_box },
            { label: 'Total Box Lolos (OK)', value: withUnit(d.packing?.ok_box, 'Box'), badge: 'Netto' },
            { label: 'Total Box Hold', value: withUnit(d.packing?.hold_box, 'Box') },
            { label: 'Total Box BO', value: withUnit(d.packing?.bo_box, 'Box') },
            { label: 'Total Output Produk', value: cleanVal(d.packing?.total_output) || (d.packing?.total_output_kg ? withUnit(d.packing.total_output_kg, 'kg') : null) },
            { label: 'Catatan Abnormalitas', value: d.packing?.abnormalitas },
          ]) : [],
          qcTitle: 'Analisa Kualitas Finished Goods (Laboratorium QC)',
          qcMetrics: cleanMetrics([
            { label: 'Verifikasi Label', value: d.qc?.qc_packing_verifikasi_label, spec: 'Sesuai Spesifikasi' },
            { label: 'Kondisi Visual Kemasan', value: d.qc?.qc_packing_kondisi_kemasan, spec: 'Rapat & Tersegel' },
            { label: 'Kadar Air', value: withUnit(d.qc?.qc_packing_kadar_air, '%'), spec: 'Maks. 3,00%' },
            { label: 'Density (g/L)', value: withUnit(d.qc?.qc_packing_density, 'g/L'), spec: 'Std 240 - 260 g/L' },
            { label: 'Foreign Matter', value: d.qc?.qc_packing_fm, spec: 'Bebas Benda Asing' },
            { label: 'Visual', value: d.qc?.qc_packing_visual, spec: 'Sesuai Standar' },
            { label: 'Warna', value: d.qc?.qc_packing_warna, spec: 'Standar Agtron' },
            { label: 'Brix', value: d.qc?.qc_packing_brix, spec: 'Std Brix Rekonstitusi' },
            { label: 'pH', value: d.qc?.qc_packing_ph, spec: 'Std 5,10 - 5,50' },
            { label: 'Fluidity', value: d.qc?.qc_packing_fluidity, spec: 'Free Flowing' },
            { label: 'Solubility (Kelarutan)', value: withUnit(d.qc?.qc_packing_solubility, 'dtk'), spec: 'Maks. 30 detik' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_packing_wangi },
            { label: 'Pahit', value: d.qc?.qc_packing_pahit },
            { label: 'Asam', value: d.qc?.qc_packing_asam },
            { label: 'Body', value: d.qc?.qc_packing_body },
            { label: 'Sepat', value: d.qc?.qc_packing_sepat },
          ]),
          extraQcBlocks: d.qc?.qc_packing_mesh_gt600 ? [
            {
              title: 'Particle Size Analysis (Mesh Test Finished Goods)',
              badge: 'Mesh Analysis',
              items: cleanFields([
                { label: 'Mesh >600', value: withUnit(d.qc?.qc_packing_mesh_gt600, 'g') },
                { label: 'Mesh 425-600', value: withUnit(d.qc?.qc_packing_mesh_425_600, 'g') },
                { label: 'Mesh 300-425', value: withUnit(d.qc?.qc_packing_mesh_300_425, 'g') },
                { label: 'Mesh 250-300', value: withUnit(d.qc?.qc_packing_mesh_250_300, 'g') },
                { label: 'Mesh 212-250', value: withUnit(d.qc?.qc_packing_mesh_212_250, 'g') },
                { label: 'Mesh 180-212', value: withUnit(d.qc?.qc_packing_mesh_180_212, 'g') },
                { label: 'Mesh 150-180', value: withUnit(d.qc?.qc_packing_mesh_150_180, 'g') },
                { label: 'Mesh <150', value: withUnit(d.qc?.qc_packing_mesh_lt150, 'g') },
              ]),
            },
          ] : [],
          prodTable: hasPacking ? {
            pic: 'Produksi',
            title: `Tabel Operasional Pengemasan Box Tower ${tKey}`,
            tableName: packTable,
            rows: d.packing?.raw_rows || [],
            columns: d.packing?.columns || [],
          } : null,
          qcTable: d.qc_raw?.mesh?.raw_rows?.length ? {
            pic: 'QC',
            title: `Tabel QC Mesh Test Finished Goods (qc_mesh_${twSuffix})`,
            tableName: `qc_mesh_${twSuffix}`,
            rows: d.qc_raw.mesh.raw_rows,
            columns: d.qc_raw.mesh.raw_rows[0] ? Object.keys(d.qc_raw.mesh.raw_rows[0]) : [],
          } : null,
          pic: { operasional: d.packing?.operator_packing || '-', qc: d.qc?.qc_packing_pic || '-' },
        },
        {
          flowNumber: 'Flow 12',
          title: 'INCOMING BAHAN KEMAS',
          refDoc: 'Form F/FGW/02.004 & F/QC/01.030',
          isAvailable: hasFgw,
          pendingPicName: 'FGW & QC',
          noticeText: 'Data penerimaan bahan kemasan sekunder (karton & plastik) belum tercatat di database MySQL.',
          operationalTitle: 'Data Kedatangan Bahan Kemasan Karton & Plastik (PIC FGW)',
          fields: hasFgw ? cleanFields([
            { label: 'Tanggal Penerimaan', value: formatFlowDate(d.fgw?.tanggal_kemasan) },
            { label: 'Supplier Karton', value: d.fgw?.supplier_karton },
            { label: 'Supplier Plastik PE', value: d.fgw?.supplier_plastik },
            { label: 'Nomor Lot Karton', value: d.fgw?.lot_karton },
            { label: 'Nomor Lot Plastik', value: d.fgw?.lot_plastik },
          ]) : [],
          qcTitle: 'Hasil Pengujian Fisik Bahan Kemasan (QC Kemasan)',
          qcMetrics: hasFgw ? cleanMetrics([
            { label: 'Kekuatan Tekan BCT', value: d.fgw?.bct, spec: 'Min. 600 kgf' },
            { label: 'Ketebalan Plastik', value: d.fgw?.ketebalan, spec: 'Std 75 - 85 µm' },
          ]) : [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.fgw?.operator || '-', qc: d.fgw?.qc || '-' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 8: DISTRIBUSI PRODUK JADI (Flow 1)
    // ══════════════════════════════════════════════════════════════
    'distribusi': {
      ...CLUSTER_CONFIG[7],
      subflows: [
        {
          flowNumber: 'Flow 1',
          title: 'DISTRIBUSI',
          refDoc: 'Form F/LOG/01.035 & F/QC/01.030',
          isAvailable: hasFgw,
          pendingPicName: 'FGW & QA',
          noticeText: 'Data surat jalan armada pengiriman dan QA Release belum tercatat di database MySQL.',
          operationalTitle: 'Data Surat Jalan & Armada Distribusi Logistik (PIC FGW)',
          fields: hasFgw ? cleanFields([
            { label: 'Posisi Produk', value: d.fgw?.posisi_produk },
            { label: 'Waktu Pengiriman', value: formatFlowDate(d.fgw?.tanggal_distribusi) },
            { label: 'Nomor Surat Jalan', value: d.fgw?.no_sj },
            { label: 'Nomor Polisi Truk', value: d.fgw?.no_polisi },
            { label: 'Nama Pengemudi / Sopir', value: d.fgw?.sopir },
            { label: 'Tujuan Pengiriman', value: d.fgw?.tujuan },
            { label: 'Jumlah (Box)', value: d.fgw?.jumlah_box ? `${d.fgw.jumlah_box} Box` : null },
          ]) : [],
          qcTitle: 'Verifikasi Pelepasan Mutu & Armada Distribusi (QA/QC)',
          qcMetrics: hasFgw ? cleanMetrics([
            { label: 'Nomor CoA', value: d.fgw?.no_coa, spec: 'CoA/IC/SJA-SKD' },
            { label: 'Verifikasi Kendaraan', value: d.fgw?.kondisi_kendaraan, spec: 'Bersih & Tertutup' },
          ]) : [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.fgw?.sopir || '-', qc: d.fgw?.qa || '-' },
        },
      ],
    },
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
  window.getTraceItemValue = getTraceItemValue;
  window.startCounterAnimation = startCounterAnimation;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CLUSTER_CONFIG,
    buildClusterData,
    getTraceItemValue,
    formatFlowDate,
  };
}
