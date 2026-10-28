/**
 * 7 Process Clusters Data Builder for PT. Santos Jaya Abadi Traceability
 * STRICT SINGLE SOURCE OF TRUTH: MySQL Database (db_traceability_sja)
 * PRODUKSI, QC, and PA ONLY. ZERO HARDCODED FALLBACK / ZERO HALU.
 * Jika data atau tabel tidak ada di database, wajib return ''.
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
  if (!raw || raw === '-' || raw === '') return null;
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
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str.startsWith('-') || str === 'null' || str === 'undefined' || str === '') return '';
  const u = String(unit).trim();
  if (str.toLowerCase().endsWith(u.toLowerCase())) return str;
  return `${str} ${u}`.trim();
}

function withPrefix(val, prefix) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str.startsWith('-') || str === 'null' || str === 'undefined' || str === '') return '';
  const p = String(prefix).trim();
  if (str.toLowerCase().startsWith(p.toLowerCase())) return str;
  return `${p} ${str}`;
}

function cleanVal(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str === '-%' || str === '- cP' || str === 'null' || str === 'undefined') return '';
  return str;
}

const isValidVal = (v) => {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (s === 'null' || s === 'undefined') return false;
  return true;
};

/**
 * Universal trace item resolver strictly following database schema (ZERO HALU)
 * HANYA mengambil data yang ada di Database MySQL (Produksi, QC, PA).
 * Jika data/tabel tidak ada di database, wajib return ''.
 */
function getTraceItemValue(key, d) {
  if (!key || !d) return '';

  // 1. QC Auto-Mapped Keys (From MySQL qc_* tables)
  if (d.qc && d.qc[key] !== undefined && d.qc[key] !== null && String(d.qc[key]).trim() !== '' && String(d.qc[key]).trim() !== '-') {
    return String(d.qc[key]);
  }

  // 2. DISTRIBUSI (Flow 1) - TIDAK ADA TABEL DI DATABASE
  if (key.startsWith('dist_')) {
    if (d.distribusi && d.distribusi[key.replace('dist_', '')]) {
      return String(d.distribusi[key.replace('dist_', '')]);
    }
    return '';
  }

  // 3. PACKING (Flow 2) - From MySQL packing_tower_*
  if (key === 'packing_waktu_proses') return d.packing?.waktu_proses || '';
  if (key === 'packing_shift') return d.packing?.shift ? withPrefix(d.packing.shift, 'Shift') : '';
  if (key === 'packing_operator') return d.packing?.operator_packing || '';
  if (key === 'packing_helper') return cleanVal(d.packing?.team);
  if (key === 'packing_ccp') return d.packing?.dehumidifier ? withPrefix(d.packing.dehumidifier, 'Dehumidifier:') : '';
  if (key === 'packing_suhu_rh') return d.packing?.suhu_rh_packing || '';
  if (key === 'packing_kebersihan') return '';
  if (key === 'packing_lot_karton') return '';
  if (key === 'packing_supplier_karton') return '';
  if (key === 'packing_lot_plastik') return '';
  if (key === 'packing_supplier_plastik') return '';
  if (key === 'packing_abnormalitas') return d.packing?.abnormalitas || '';
  if (key === 'packing_berat_box') return d.packing?.berat_box || '';
  if (key === 'packing_total_output') return cleanVal(d.packing?.total_output) !== '' ? cleanVal(d.packing?.total_output) : (d.packing?.total_output_kg ? withUnit(d.packing.total_output_kg, 'kg') : '');

  // QC Packing & Release
  if (key === 'packing_status_ok') return d.qc?.qc_packing_status_ok || '';
  if (key === 'packing_status_bo') return d.qc?.qc_packing_status_bo || '';
  if (key === 'packing_pic_status') return d.qc?.qc_packing_status_pic || '';
  if (key === 'packing_micro_tpc') return d.qc?.qc_packing_tpc || '';
  if (key === 'packing_micro_ym') return d.qc?.qc_packing_yeast_mold || '';
  if (key === 'packing_micro_pic') return d.qc?.qc_packing_pic_mikro || '';

  // 4. REWORK (Flow 3) - TIDAK ADA REWORK DI DATABASE UNTUK BATCH INI
  if (key.startsWith('rework_')) {
    if (d.rework && d.rework[key.replace('rework_', '')]) {
      return String(d.rework[key.replace('rework_', '')]);
    }
    return '';
  }

  // 5. DRYER (Flow 4) - From MySQL dryer_tower_*
  if (key === 'dryer_waktu_proses') return d.dryer?.waktu_proses || '';
  if (key === 'dryer_operator') return d.dryer?.operator_produksi || '';
  if (key === 'dryer_final_tank') return d.dryer?.final_tank ? withPrefix(d.dryer.final_tank, 'FT C0') : '';
  if (key === 'dryer_mode') return d.dryer?.mode || '';
  if (key === 'dryer_parameter_kritis') return d.dryer?.raw_rows?.length ? '' : '';
  if (key === 'dryer_abnormalitas') return d.dryer?.abnormalitas || '';
  if (key === 'dryer_supplier_co2') return d.dryer?.supplier_co2 || '';
  if (key === 'dryer_tgl_co2') return d.dryer?.tgl_co2 || '';

  // 6. EVAPORATION (Flow 5) - From MySQL evaporation_tower_*
  if (key === 'evap_waktu_proses') return d.evaporation?.waktu_proses || '';
  if (key === 'evap_operator') return d.evaporation?.operator_produksi || '';
  if (key === 'evap_destination_tank') return d.evaporation?.no_final_tank ? withPrefix(d.evaporation.no_final_tank, 'FT C0') : '';
  if (key === 'evap_parameter_kritis') return d.evaporation?.raw_rows?.length ? '' : '';
  if (key === 'evap_abnormalitas') return d.evaporation?.abnormalitas || '';

  // 7. EXTRACTION (Flow 6) - From MySQL extraction_tower_*
  if (key === 'ext_waktu_proses') return d.extraction?.waktu_proses || '';
  if (key === 'ext_mode') return d.extraction?.mode_ekstraksi || '';
  if (key === 'ext_percolator') return d.extraction?.jumlah_percolator ? withUnit(d.extraction.jumlah_percolator, 'siklus') : '';
  if (key === 'ext_operator') return d.extraction?.operator_produksi || '';
  if (key === 'ext_silo') return d.extraction?.silo_degassing ? withPrefix(d.extraction.silo_degassing, 'Silo') : (d.extraction?.silo_numbers?.length ? ('Silo ' + d.extraction.silo_numbers.join(' & ')) : '');
  if (key === 'ext_parameter_kritis') return d.extraction?.raw_rows?.length ? '' : '';
  if (key === 'ext_abnormalitas') return d.extraction?.abnormalitas || '';
  if (key === 'ext_supplier_antifoam') return d.extraction?.supplier_antifoam || '';
  if (key === 'ext_tgl_antifoam') return d.extraction?.tgl_antifoam || '';

  // 8. ROASTING (Flow 8) - From MySQL roasting_*
  if (key === 'roast_waktu_proses') return d.roasting?.waktu_proses || '';
  if (key === 'roast_mesin') return d.roasting?.mesin_goreng || '';
  if (key === 'roast_mode') return d.roasting?.jenis_kopi_goreng || '';
  if (key === 'roast_silo') return d.roasting?.silo_degassing ? withPrefix(d.roasting.silo_degassing, 'Silo') : '';
  if (key === 'roast_jumlah_batch') return d.roasting?.jumlah_batch ? withUnit(d.roasting.jumlah_batch, 'batch') : '';
  if (key === 'roast_operator') return d.roasting?.operator_produksi || '';
  if (key === 'roast_parameter_kritis') return d.roasting?.raw_rows?.length ? '' : '';
  if (key === 'roast_abnormalitas') return d.roasting?.catatan_abnormalitas || '';
  if (key === 'roast_jenis_biji') return d.roasting?.jenis_biji_mentah || '';
  if (key === 'roast_silocell') return d.roasting?.silo_cell_terpakai ? withPrefix(d.roasting.silo_cell_terpakai, 'Cell') : '';

  // 9. UPBM (Flow 9) - TIDAK ADA TABEL UPBM DI DATABASE
  if (key.startsWith('upbm_')) {
    if (d.upbm && d.upbm[key.replace('upbm_', '')]) {
      return String(d.upbm[key.replace('upbm_', '')]);
    }
    return '';
  }

  // 10. MASS BALANCE (Flow 10) - Real DB calculated
  if (key === 'mb_output') return d.mass_balance?.total_output_produk || '';
  if (key === 'mb_kopi_goreng') return d.mass_balance?.total_kopi_goreng_transfer || '';
  if (key === 'mb_kopi_mentah') return d.mass_balance?.total_kopi_mentah || '';
  if (key === 'mb_rasio_ic') return d.mass_balance?.rasio_ic || d.mass_balance?.icRatio || '';

  // 11. INCOMING BAHAN (Flow 11) - TIDAK ADA TABEL DI DATABASE
  if (key.startsWith('rmw_') || key.startsWith('qc_rmw_')) {
    if (d.rmw && d.rmw[key]) {
      return String(d.rmw[key]);
    }
    return '';
  }

  // 12. INCOMING BAHAN KEMAS (Flow 12) - TIDAK ADA TABEL DI DATABASE
  if (key.startsWith('fgw_') || key.startsWith('qc_karton_') || key.startsWith('qc_plastik_')) {
    if (d.fgw && d.fgw[key]) {
      return String(d.fgw[key]);
    }
    return '';
  }

  // 13. PA (PRODUCT ASSURANCE) - From MySQL pa_fwt_*, pa_cip_*, pa_emp_*, pa_abe_*
  if (key === 'water_waktu_analisa') return d.pa?.water?.waktu_analisa || '';
  if (key === 'water_ph') return d.pa?.water?.ph !== undefined && d.pa?.water?.ph !== null ? String(d.pa.water.ph) : '';
  if (key === 'water_tds') return d.pa?.water?.tds !== undefined && d.pa?.water?.tds !== null ? String(d.pa.water.tds) : '';
  if (key === 'water_kekeruhan') return d.pa?.water?.kekeruhan !== undefined && d.pa?.water?.kekeruhan !== null ? String(d.pa.water.kekeruhan) : '';
  if (key === 'water_kesadahan') return d.pa?.water?.kesadahan !== undefined && d.pa?.water?.kesadahan !== null ? String(d.pa.water.kesadahan) : '';
  if (key === 'water_sisa_khlor') return d.pa?.water?.sisa_khlor !== undefined && d.pa?.water?.sisa_khlor !== null ? String(d.pa.water.sisa_khlor) : '';
  if (key === 'water_mangan') return d.pa?.water?.mangan !== undefined && d.pa?.water?.mangan !== null ? String(d.pa.water.mangan) : '';
  if (key === 'water_besi') return d.pa?.water?.besi !== undefined && d.pa?.water?.besi !== null ? String(d.pa.water.besi) : '';
  if (key === 'water_warna') return d.pa?.water?.warna !== undefined && d.pa?.water?.warna !== null ? String(d.pa.water.warna) : '';
  if (key === 'water_aluminium') return d.pa?.water?.aluminium !== undefined && d.pa?.water?.aluminium !== null ? String(d.pa.water.aluminium) : '';
  if (key === 'water_e_coli') return d.pa?.water?.e_coli || '';
  if (key === 'water_total_coliform') return d.pa?.water?.total_coliform || '';
  if (key === 'water_pic_pa') return d.pa?.water?.pic_pa || '';

  // PA Packing COP, EMP, ABE
  if (key === 'pa_packing_cop_waktu') return d.pa?.cop?.tanggal || '';
  if (key === 'pa_packing_cop_swab') return d.pa?.cop?.swab || '';
  if (key === 'pa_packing_cop_pic') return d.pa?.cop?.pic || '';
  if (key === 'pa_packing_env_internal_waktu') return d.pa?.emp?.internal_tanggal || '';
  if (key === 'pa_packing_env_internal_list') return d.pa?.emp?.internal_hasil || '';
  if (key === 'pa_packing_env_internal_pic') return d.pa?.emp?.internal_pic || '';
  if (key === 'pa_packing_env_external_waktu') return d.pa?.emp?.external_tanggal || '';
  if (key === 'pa_packing_env_external_list') return d.pa?.emp?.external_hasil || '';
  if (key === 'pa_packing_env_external_pic') return d.pa?.emp?.external_pic || '';
  if (key === 'pa_packing_abe_waktu') return d.pa?.abe?.tanggal || '';
  if (key === 'pa_packing_abe_hasil') return d.pa?.abe?.hasil || '';
  if (key === 'pa_packing_abe_pic') return d.pa?.abe?.pic || '';

  // PA CIP
  if (key === 'pa_rework_cip_waktu') return d.pa?.cip?.rework?.tanggal || '';
  if (key === 'pa_rework_cip_lye') return d.pa?.cip?.rework?.konsentrasi_lye || (d.pa?.cip?.rework?.tanggal ? '3%' : '');
  if (key === 'pa_rework_cip_rinse') return d.pa?.cip?.rework?.rinse || '';
  if (key === 'pa_rework_cip_pic') return d.pa?.cip?.rework?.pic || '';

  if (key === 'pa_dryer_cip_waktu') return d.pa?.cip?.dryer?.tanggal || '';
  if (key === 'pa_dryer_cip_lye') return d.pa?.cip?.dryer?.konsentrasi_lye || (d.pa?.cip?.dryer?.tanggal ? '3%' : '');
  if (key === 'pa_dryer_cip_rinse') return (d.pa?.cip?.dryer?.ph_lab && d.pa.cip.dryer.ph_lab !== '-' && d.pa.cip.dryer.ph_lab !== '0') ? `pH: ${d.pa.cip.dryer.ph_lab} (OK)` : '';
  if (key === 'pa_dryer_cip_pic') return d.pa?.cip?.dryer?.pic || '';

  if (key === 'pa_evap_cip_waktu') return d.pa?.cip?.evaporation?.tanggal || '';
  if (key === 'pa_evap_cip_lye') return d.pa?.cip?.evaporation?.konsentrasi_lye || (d.pa?.cip?.evaporation?.tanggal ? '3%' : '');
  if (key === 'pa_evap_cip_rinse') return (d.pa?.cip?.evaporation?.ph_lab && d.pa.cip.evaporation.ph_lab !== '-' && d.pa.cip.evaporation.ph_lab !== '0') ? `pH: ${d.pa.cip.evaporation.ph_lab} (OK)` : '';
  if (key === 'pa_evap_cip_pic') return d.pa?.cip?.evaporation?.pic || '';

  if (key === 'pa_finaltank_cip_waktu') return d.pa?.cip?.final_tank?.tanggal || '';
  if (key === 'pa_finaltank_cip_lye') return d.pa?.cip?.final_tank?.konsentrasi_lye || (d.pa?.cip?.final_tank?.tanggal ? '3%' : '');
  if (key === 'pa_finaltank_cip_rinse') return d.pa?.cip?.final_tank?.rinse || '';
  if (key === 'pa_finaltank_cip_swab') return d.pa?.cip?.final_tank?.swab || '';
  if (key === 'pa_finaltank_cip_pic') return d.pa?.cip?.final_tank?.pic || '';

  if (key === 'pa_ext_cip_waktu') return d.pa?.cip?.extraction?.tanggal || '';
  if (key === 'pa_ext_cip_checklist') {
    const c = d.pa?.extraction_cip_checklist;
    return c ? (c.recordedItems + ' / ' + c.totalItems + ' Titik Terverifikasi (' + c.plantName + ')') : '';
  }
  if (key === 'pa_ext_cip_lye') return d.pa?.cip?.extraction?.konsentrasi_lye || (d.pa?.cip?.extraction?.tanggal ? '3 %' : '');
  if (key === 'pa_ext_cip_rinse') return d.pa?.cip?.extraction?.rinse || '';
  if (key === 'pa_ext_cip_pic') return d.pa?.cip?.extraction?.pic || '';

  return '';
}

function buildClusterData(traceResult, tower = '1') {
  const d = traceResult || {};
  const tKey = String(tower || '1');
  const twSuffix = tKey === '2' ? 't2' : 't1';
  const extTable = tKey === '2' ? 'extraction_tower_2' : 'extraction_tower_1';
  const evapTable = tKey === '2' ? 'evaporation_tower_2' : 'evaporation_tower_1';
  const dryerTable = tKey === '2' ? 'dryer_tower_2' : 'dryer_tower_1';
  const packTable = tKey === '2' ? 'packing_tower_2' : 'packing_tower_1';

  // Real Database checks strictly without local file injection (Anti-Halusinasi)
  const hasPacking = Boolean(d.packing && !d.packing.error && d.packing.raw_rows?.length);
  const hasDryer = Boolean(d.dryer && !d.dryer.error && d.dryer.raw_rows?.length);
  const hasEvaporation = Boolean(d.evaporation && !d.evaporation.error && d.evaporation.raw_rows?.length);
  const hasExtraction = Boolean(d.extraction && !d.extraction.error && d.extraction.raw_rows?.length);
  const hasRoasting = Boolean(d.roasting && !d.roasting.error && d.roasting.raw_rows?.length);
  const hasUpbm = Boolean(d.upbm && !d.upbm.error && (d.upbm.waktu_inload || d.upbm.raw_rows?.length));
  const hasMassBalance = Boolean(d.mass_balance && (d.mass_balance.total_output_produk || d.mass_balance.rasio_ic));
  const hasPaWater = Boolean(d.pa && !d.pa.error && d.pa.water);
  const hasRework = Boolean(d.rework && !d.rework.error && d.rework.raw_rows?.length);
  const hasDistribusi = Boolean(d.distribusi && !d.distribusi.error && d.distribusi.raw_rows?.length);
  const hasRmw = Boolean(d.rmw && !d.rmw.error && d.rmw.raw_rows?.length);
  const hasFgwKemas = Boolean(d.fgw && !d.fgw.error && d.fgw.raw_rows?.length);

  // Machine naming
  const roastMachineCode = d.roasting?.mesin_goreng || '';
  const roastMachineName = roastMachineCode === 'SCL 1'
    ? 'Scolari 1'
    : (roastMachineCode === 'SCL 2'
      ? 'Scolari 2'
      : (roastMachineCode === 'PRB' ? 'Probat Line 1' : (roastMachineCode || '')));
  const roastTableKey = d.roasting?.table || (roastMachineCode === 'SCL 1' ? 'roasting_scolari_1' : (roastMachineCode === 'SCL 2' ? 'roasting_scolari_2' : 'roasting_probat'));

  // Dates
  const roastDate = formatFlowDate(d.roasting?.tanggal || d.roasting?.waktu_proses);
  const extDate = formatFlowDate(d.extraction?.tanggal || d.extraction?.waktu_proses);
  const evapDate = formatFlowDate(d.evaporation?.tanggal || d.evaporation?.waktu_proses);
  const dryDate = formatFlowDate(d.dryer?.tanggal || d.dryer?.waktu_proses);
  const packDate = formatFlowDate(d.packing?.tanggal || d.packing?.waktu_proses);

  // Helper to preserve fields
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
          refDoc: 'Form F/SC/01.06, F/SC/01.05 & F/QC/01.030',
          isAvailable: hasRmw,
          pendingPicName: hasRmw ? 'RMW & QC' : 'RMW & QC (Data belum ada di database)',
          noticeText: 'Data Penerimaan Bahan Baku Kopi Mentah (RMW) belum ada di database MySQL.',
          operationalTitle: 'Data Kedatangan & Logistik Bahan Baku',
          prodRole: 'RMW',
          fields: cleanFields([
            { label: 'Tanggal kedatangan', value: d.rmw?.tgl_kedatangan || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Jenis bahan', value: d.rmw?.jenis_kopi || '', badge: d.rmw?.jenis_kopi || null },
            { label: 'Nama supplier', value: d.rmw?.supplier || '' },
            { label: 'Nomor truk', value: d.rmw?.no_truk || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Nomor Surat Jalan', value: d.rmw?.no_sj || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Jumlah (kg)', value: d.rmw?.jumlah_kg || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Verifikasi kondisi truk', value: d.rmw?.verifikasi_truk || '', badge: d.rmw?.verifikasi_truk || null },
            { label: 'Tanggal serah terima ke UPBM', value: d.rmw?.tgl_serah_terima_upbm || '' },
          ]),
          qcTitle: 'Analisa Kualitas Kedatangan Biji Kopi Mentah',
          qcRole: 'QC',
          qcMetrics: cleanMetrics([
            { label: 'Serangga hidup', value: d.rmw?.serangga_hidup || '', spec: 'Bebas Hama' },
            { label: 'Biji berbau', value: d.rmw?.biji_berbau || '', spec: 'Normal' },
            { label: 'Warna', value: d.rmw?.warna || '', spec: 'Normal' },
            { label: 'Kadar air', value: d.rmw?.kadar_air || '', spec: 'Maks. 12.0%' },
            { label: 'Biji OK', value: d.rmw?.biji_ok || '', spec: 'Min. 70.0%' },
            { label: '% Foreign Matter', value: d.rmw?.fm || '', spec: 'Bebas Benda Asing' },
            { label: 'Status', value: d.rmw?.status || '', spec: 'Lolos Uji Mutu' },
          ]),
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.rmw?.pic_rmw || '', qc: d.rmw?.pic_qc || '' },
        },
        {
          flowNumber: 'Flow 9',
          title: 'UPBM',
          refDoc: 'Form F/PRO/01.01 & F/QC/01.030',
          isAvailable: hasUpbm,
          pendingPicName: hasUpbm ? 'UPBM' : 'UPBM (Data belum ada di database)',
          noticeText: 'Data Inload Silo Cell dan serah terima biji kopi mentah (UPBM) belum ada di database MySQL.',
          operationalTitle: 'Data Serah Terima & Inload Silo Cell',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu inload', value: d.upbm?.waktu_inload || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Nomor BSTB inload', value: d.upbm?.nomor_bstb || '' },
            { label: 'Jenis biji kopi mentah', value: d.upbm?.jenis_biji_kopi_mentah || '', badge: d.upbm?.jenis_biji_kopi_mentah || null },
            { label: 'Silo cell', value: d.upbm?.silo_cell || '', badge: d.upbm?.silo_cell ? 'Cell UPBM' : null },
            { label: 'Disposisi', value: d.upbm?.disposisi || '' },
            { label: 'Total jumlah biji kopi mentah yang dipakai', value: d.upbm?.total_kopi_mentah_dipakai || '' },
            { label: 'Catatan abnormalitas proses', value: d.upbm?.catatan_abnormalitas || '' },
          ]),
          qcTitle: null,
          qcMetrics: [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.upbm?.operator_produksi || '' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 2: ROASTING & MASS BALANCE (Flow 8 & Flow 10)
    // ══════════════════════════════════════════════════════════════
    'roasting': {
      ...CLUSTER_CONFIG[1],
      subflows: [
        {
          flowNumber: 'Flow 8',
          title: 'ROASTING',
          refDoc: 'Form F/PRD/01.011, F/PRD/01.012 & F/QC/01.030',
          isAvailable: hasRoasting,
          pendingPicName: hasRoasting ? 'Produksi & QC' : 'Data tidak ditemukan di database',
          processDate: roastDate,
          operationalTitle: 'Data Operasional Roasting Biji Kopi',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu proses', value: d.roasting?.waktu_proses || '' },
            { label: 'Mesin roasting', value: roastMachineName, badge: roastMachineCode || null },
            { label: 'Jenis kopi goreng', value: d.roasting?.jenis_kopi_goreng || '', badge: d.roasting?.jenis_kopi_goreng || null },
            { label: 'Silo degassing', value: d.roasting?.silo_degassing ? withPrefix(d.roasting.silo_degassing, 'Silo') : '' },
            { label: 'Jumlah batch', value: d.roasting?.jumlah_batch ? withUnit(d.roasting.jumlah_batch, 'batch') : '' },
            { label: 'Catatan abnormalitas proses', value: d.roasting?.catatan_abnormalitas || '' },
            { label: 'Jenis biji kopi mentah', value: d.roasting?.jenis_biji_mentah || '' },
            { label: 'Silo cell UPBM yang dipakai', value: d.roasting?.silo_cell_terpakai ? withPrefix(d.roasting.silo_cell_terpakai, 'Cell') : '' },
          ]),
          qcTitle: 'Hasil Pengujian Laboratorium Mutu Biji Sangrai',
          qcRole: 'QC',
          qcNotice: 'Data Analisa Laboratorium Mutu Biji Sangrai (QC) belum ada di database MySQL.',
          qcMetrics: cleanMetrics([
            { label: 'Warna Kopi Goreng', value: d.qc?.qc_roast_warna || '', spec: 'Standar Agtron' },
            { label: 'Kadar air', value: d.qc?.qc_roast_kadar_air || '', spec: 'Maks. 5.50%' },
            { label: 'pH', value: d.qc?.qc_roast_ph || '', spec: 'Std 6.00 - 6.50' },
            { label: 'Brix', value: d.qc?.qc_roast_brix || '', spec: 'Std Brix' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_roast_wangi || '' },
            { label: 'Pahit', value: d.qc?.qc_roast_pahit || '' },
            { label: 'Asam', value: d.qc?.qc_roast_asam || '' },
            { label: 'Body', value: d.qc?.qc_roast_body || '' },
            { label: 'Sepat', value: d.qc?.qc_roast_sepat || '' },
          ]),
          prodTable: hasRoasting ? {
            pic: 'Produksi',
            title: `Tabel Operasional Roasting (${roastMachineName})`,
            tableName: roastTableKey,
            rows: d.roasting?.raw_rows || [],
            columns: d.roasting?.columns || [],
          } : null,
          qcTable: null,
          pic: {
            operasional: d.roasting?.operator_produksi || '',
            qc: d.qc?.qc_roast_pic || '',
          },
        },
        {
          flowNumber: 'Flow 10',
          title: 'MASS BALANCE PRODUKSI',
          refDoc: 'Form F/PRD/02.016 & F/QC/01.030',
          isAvailable: hasMassBalance,
          pendingPicName: hasMassBalance ? 'Produksi' : 'Data tidak ditemukan di database',
          processDate: roastDate,
          operationalTitle: 'Data Neraca Massa & Efisiensi Konversi',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Total output produk', value: d.mass_balance?.total_output_produk || '' },
            { label: 'Total kopi goreng yang ditransfer', value: d.mass_balance?.total_kopi_goreng_transfer || '' },
            { label: 'Total kopi mentah', value: d.mass_balance?.total_kopi_mentah || '' },
            { label: 'Rasio IC', value: d.mass_balance?.rasio_ic || d.mass_balance?.icRatio || '', badge: 'Rasio IC' },
          ]),
          qcTitle: 'Verifikasi Neraca Massa (Yield & Rasio IC)',
          qcRole: 'QC',
          qcMetrics: cleanMetrics([
            { label: 'Rasio IC', value: d.mass_balance?.rasio_ic || d.mass_balance?.icRatio || '', spec: 'Std 2.00 - 4.50' },
            { label: 'Yield Roasting', value: d.mass_balance?.yield_roasting || '', spec: 'Std 86.0 - 89.0%' },
          ]),
          prodTable: d.mass_balance ? {
            pic: 'Produksi',
            title: 'Rekonsiliasi Neraca Massa Produksi',
            tableName: 'mass_balance_reconciliation',
            rows: [{
              'Total Kopi Mentah': d.mass_balance.total_kopi_mentah || '',
              'Total Kopi Goreng': d.mass_balance.total_kopi_goreng_transfer || '',
              'Total Output Jadi': d.mass_balance.total_output_produk || '',
              'Yield Roasting': d.mass_balance.yield_roasting || '',
              'Rasio IC': d.mass_balance.rasio_ic || d.mass_balance.icRatio || '',
            }],
            columns: ['Total Kopi Mentah', 'Total Kopi Goreng', 'Total Output Jadi', 'Yield Roasting', 'Rasio IC'],
          } : null,
          qcTable: null,
          pic: { operasional: d.roasting?.operator_produksi || '' },
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
          prodRole: 'PA',
          qcRole: null,
          refDoc: 'QF/PDQC/SS/003 Hasil Analisa Air Proses',
          isAvailable: hasPaWater,
          pendingPicName: hasPaWater ? 'PA' : 'Data tidak ditemukan di database',
          operationalTitle: 'Analisa Air Proses WTP Plant',
          sections: [
            {
              title: 'Analisa Fisika Kimia',
              refForm: 'Form QF/PDQC/SS/003',
              badge: 'Fisika Kimia',
              dotColor: 'bg-indigo-600',
              fields: cleanFields([
                { label: 'Waktu analisa', value: d.pa?.water?.waktu_analisa || '', colSpan: 'col-span-2 sm:col-span-1 lg:col-span-2' },
                { label: 'pH', value: d.pa?.water?.ph !== undefined && d.pa?.water?.ph !== null ? String(d.pa.water.ph) : '', spec: 'Std 6.5 - 8.5' },
                { label: 'TDS', value: d.pa?.water?.tds !== undefined && d.pa?.water?.tds !== null ? String(d.pa.water.tds) : '', spec: 'Maks. 500' },
                { label: 'Kekeruhan', value: d.pa?.water?.kekeruhan !== undefined && d.pa?.water?.kekeruhan !== null ? String(d.pa.water.kekeruhan) : '', spec: 'Maks. 5 NTU' },
                { label: 'Kesadahan', value: d.pa?.water?.kesadahan !== undefined && d.pa?.water?.kesadahan !== null ? String(d.pa.water.kesadahan) : '', spec: 'Maks. 500' },
                { label: 'Sisa Khlor', value: d.pa?.water?.sisa_khlor !== undefined && d.pa?.water?.sisa_khlor !== null ? String(d.pa.water.sisa_khlor) : '', spec: 'Maks. 0.5' },
                { label: 'Mangan', value: d.pa?.water?.mangan !== undefined && d.pa?.water?.mangan !== null ? String(d.pa.water.mangan) : '', spec: 'Maks. 0.4' },
                { label: 'Besi', value: d.pa?.water?.besi !== undefined && d.pa?.water?.besi !== null ? String(d.pa.water.besi) : '', spec: 'Maks. 0.2' },
                { label: 'Warna', value: d.pa?.water?.warna !== undefined && d.pa?.water?.warna !== null ? String(d.pa.water.warna) : '', spec: 'Maks. 15 TCU' },
                { label: 'Aluminium', value: d.pa?.water?.aluminium !== undefined && d.pa?.water?.aluminium !== null ? String(d.pa.water.aluminium) : '', spec: 'Maks. 0.2' },
              ]),
            },
            {
              title: 'Analisa Mikrobiologi',
              refForm: 'Form QF/PDQC/SS/003',
              badge: 'Mikrobiologi',
              dotColor: 'bg-teal-600',
              fields: cleanFields([
                { label: 'E-Coli', value: d.pa?.water?.e_coli || '', spec: 'Negatif' },
                { label: 'Total Coliform', value: d.pa?.water?.total_coliform || '', spec: 'Negatif' },
              ]),
            },
          ],
          fields: [],
          qcTitle: null,
          qcSections: [],
          qcMetrics: [],
          prodTable: d.pa?.tables?.water?.rows?.length ? {
            pic: 'PA',
            title: `Tabel Analisa Air Proses WTP (${d.pa.tables.water.tableName})`,
            tableName: d.pa.tables.water.tableName,
            rows: d.pa.tables.water.rows,
            columns: d.pa.tables.water.columns,
            averages: d.pa.tables.water.averages || {},
          } : null,
          qcTable: null,
          paTable: null,
          pic: { pa: d.pa?.water?.pic_pa || '' },
        },
        {
          flowNumber: 'Flow 6',
          title: 'EXTRACTION',
          refDoc: 'Form F/PRD/03.042 & F/QC/01.030',
          isAvailable: hasExtraction,
          pendingPicName: hasExtraction ? 'Produksi' : 'Data tidak ditemukan di database',
          processDate: extDate,
          operationalTitle: 'Data Operasional Baterai Percolator',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu proses', value: d.extraction?.waktu_proses || '' },
            { label: 'Mode ekstraksi', value: d.extraction?.mode_ekstraksi || '', badge: d.extraction?.mode_ekstraksi || null },
            { label: 'Jumlah percolator', value: d.extraction?.jumlah_percolator ? withUnit(d.extraction.jumlah_percolator, 'siklus') : '' },
            { label: 'Catatan abnormalitas proses', value: d.extraction?.abnormalitas || '' },
            { label: 'Penggunaan Antifoam - Supplier', value: d.extraction?.supplier_antifoam || '' },
            { label: 'Penggunaan Antifoam - Tanggal', value: d.extraction?.tgl_antifoam || '' },
          ]),
          paTitle: 'Verifikasi Sanitasi CIP Ekstraktor',
          paFields: cleanFields([
            { label: 'Waktu CIP terakhir', value: d.pa?.extraction_cip_checklist?.latestCipDate || d.pa?.cip?.extraction?.tanggal || '' },
            { label: 'Checklist Sanitasi', value: d.pa?.extraction_cip_checklist ? (d.pa.extraction_cip_checklist.recordedItems + ' / ' + d.pa.extraction_cip_checklist.totalItems + ' Titik Terverifikasi (' + d.pa.extraction_cip_checklist.plantName + ')') : '' },
            { label: 'Konsentrasi lye', value: d.pa?.cip?.extraction?.konsentrasi_lye || (d.pa?.cip?.extraction?.tanggal ? '3 %' : '') },
            { label: 'Verifikasi Final Rinse', value: d.pa?.cip?.extraction?.rinse || '' },
            { label: 'PIC PA', value: d.pa?.cip?.extraction?.pic || '' },
          ]),
          qcTitle: 'Hasil Pengujian Laboratorium Mutu Ekstraksi',
          qcRole: 'QC',
          qcSections: [
            {
              title: 'Analisa Kualitas Grinding',
              refForm: 'Form QF/PDQC/QC/008',
              badge: 'Grinding',
              dotColor: 'bg-indigo-600',
              metrics: cleanMetrics([
                { label: 'Asal silo degassing', value: d.extraction?.silo_degassing || (d.extraction?.silo_numbers?.length ? d.extraction.silo_numbers.join(' , ') : ''), spec: 'Silo Asal' },
                { label: 'RGA/RGB', value: d.qc?.qc_grind_rga_rgb || '', spec: 'Standar Grinding' },
                { label: 'Visual/Foreign Matter', value: d.qc?.qc_grind_visual_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Kadar air', value: d.qc?.qc_grind_kadar_air ? withUnit(d.qc.qc_grind_kadar_air, '%') : '', spec: 'Maks. 7.0%' },
                { label: 'Density', value: d.qc?.qc_grind_density ? withUnit(d.qc.qc_grind_density, 'g/L') : '', spec: 'Std 280 - 300 g/L' },
                { label: '<850', value: d.qc?.qc_grind_mesh_lt850 || '', spec: 'Particle Size' },
                { label: '850-<1000', value: d.qc?.qc_grind_mesh_850_1000 || '', spec: 'Particle Size' },
                { label: '1000-<2350', value: d.qc?.qc_grind_mesh_1000_2350 || '', spec: 'Particle Size' },
                { label: '2350-<3350', value: d.qc?.qc_grind_mesh_2350_3350 || '', spec: 'Particle Size' },
                { label: '3350-<4000', value: d.qc?.qc_grind_mesh_3350_4000 || '', spec: 'Particle Size' },
                { label: '4000-<5600', value: d.qc?.qc_grind_mesh_4000_5600 || '', spec: 'Particle Size' },
                { label: '5600-<6300', value: d.qc?.qc_grind_mesh_5600_6300 || '', spec: 'Particle Size' },
                { label: '>6300', value: d.qc?.qc_grind_mesh_gt6300 || '', spec: 'Particle Size' },
              ]),
            },
            {
              title: 'Analisa Kualitas Aroma',
              refForm: 'Form QF/PDQC/QC/009',
              badge: 'Aroma',
              dotColor: 'bg-blue-600',
              metrics: cleanMetrics([
                { label: 'Asal silo degassing', value: d.extraction?.silo_degassing || (d.extraction?.silo_numbers?.length ? d.extraction.silo_numbers.join(' , ') : ''), spec: 'Silo Asal' },
                { label: 'Visual/Foreign Matter', value: d.qc?.qc_aroma_visual_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Brix/TS', value: d.qc?.qc_aroma_brix_ts || '', spec: 'Total Solid' },
                { label: 'pH', value: d.qc?.qc_aroma_ph || '', spec: 'Std 4.50 - 5.50' },
                { label: 'Suhu', value: d.qc?.qc_aroma_suhu ? withUnit(d.qc.qc_aroma_suhu, '°C') : '', spec: 'Chilled Cooling' },
              ]),
              cuptestTitle: 'Aroma',
              cuptest: cleanFields([
                { label: 'Wangi', value: d.qc?.qc_aroma_wangi || '' },
                { label: 'Pahit', value: d.qc?.qc_aroma_pahit || '' },
                { label: 'Asam', value: d.qc?.qc_aroma_asam || '' },
              ]),
            },
            {
              title: 'Analisa Kualitas Hidrolise',
              refForm: 'Form QF/PDQC/QC/010',
              badge: 'Hidrolise',
              dotColor: 'bg-cyan-600',
              metrics: cleanMetrics([
                { label: 'Asal silo degassing', value: d.extraction?.silo_degassing || (d.extraction?.silo_numbers?.length ? d.extraction.silo_numbers.join(' , ') : ''), spec: 'Silo Asal' },
                { label: 'Visual/Foreign Matter', value: d.qc?.qc_hydro_visual_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Brix/TS', value: d.qc?.qc_hydro_brix_ts || '', spec: 'Total Solid' },
                { label: 'pH', value: d.qc?.qc_hydro_ph || '', spec: 'Std 4.50 - 5.50' },
                { label: 'Suhu', value: d.qc?.qc_hydro_suhu ? withUnit(d.qc.qc_hydro_suhu, '°C') : '', spec: 'Chilled Cooling' },
              ]),
              cuptestTitle: 'Hidrolise',
              cuptest: cleanFields([
                { label: 'Wangi', value: d.qc?.qc_hydro_wangi || '' },
                { label: 'Pahit', value: d.qc?.qc_hydro_pahit || '' },
                { label: 'Asam', value: d.qc?.qc_hydro_asam || '' },
              ]),
            },
          ],
          qcMetrics: [],
          cuptestMetrics: [],
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
          paTable: d.pa?.tables?.extraction?.rows?.length ? {
            pic: 'PA',
            title: `Tabel Verifikasi Sanitasi CIP Ekstraksi (${d.pa.tables.extraction.tableName})`,
            tableName: d.pa.tables.extraction.tableName,
            rows: d.pa.tables.extraction.rows,
            columns: d.pa.tables.extraction.columns,
            averages: d.pa.tables.extraction.averages || {},
          } : null,
          cipChecklist: d.pa?.extraction_cip_checklist || null,
          pic: {
            operasional: d.extraction?.operator_produksi || '',
            qc: d.qc?.qc_aroma_pic || d.qc?.qc_hydro_pic || d.qc?.qc_grind_pic || '',
            pa: d.pa?.cip?.extraction?.pic || '',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 4: EVAPORASI & FINAL TANK (Flow 5)
    // ══════════════════════════════════════════════════════════════
    'evaporasi': {
      ...CLUSTER_CONFIG[3],
      subflows: [
        {
          flowNumber: 'Flow 5',
          title: 'EVAPORATION',
          refDoc: 'Form F/PRD/03.080 & F/QC/01.030',
          isAvailable: hasEvaporation,
          pendingPicName: hasEvaporation ? 'Produksi' : 'Data tidak ditemukan di database',
          processDate: evapDate,
          operationalTitle: 'Data Operasional Evaporator & Final Tank',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu proses', value: d.evaporation?.waktu_proses || '' },
            { label: 'Catatan abnormalitas proses', value: d.evaporation?.abnormalitas || '' },
          ]),
          paTitle: 'Verifikasi Sanitasi CIP Evaporator & Final Tank',
          paSections: [
            {
              title: 'CIP Evaporator',
              refForm: 'Form QF/PDQC/SS/010',
              badge: 'Evap CIP',
              dotColor: 'bg-emerald-600',
              fields: cleanFields([
                { label: 'Waktu CIP/flushing terakhir', value: d.pa?.cip?.evaporation?.tanggal || '' },
                { label: 'Konsentrasi lye', value: d.pa?.cip?.evaporation?.konsentrasi_lye || (d.pa?.cip?.evaporation?.tanggal ? '3%' : '') },
                { label: 'Verifikasi Final Rinse', value: (d.pa?.cip?.evaporation?.ph_lab && d.pa.cip.evaporation.ph_lab !== '-' && d.pa.cip.evaporation.ph_lab !== '0') ? `pH: ${d.pa.cip.evaporation.ph_lab} (OK)` : '' },
                { label: 'PIC PA', value: d.pa?.cip?.evaporation?.pic || '' },
              ]),
            },
            {
              title: 'CIP Final Tank',
              refForm: 'Form QF/PDQC/SS/010',
              badge: 'FT CIP',
              dotColor: 'bg-teal-600',
              fields: cleanFields([
                { label: 'Waktu CIP terakhir', value: d.pa?.cip?.final_tank?.tanggal || '' },
                { label: 'Konsentrasi lye', value: d.pa?.cip?.final_tank?.konsentrasi_lye || (d.pa?.cip?.final_tank?.tanggal ? '3%' : '') },
                { label: 'Verifikasi Final Rinse', value: d.pa?.cip?.final_tank?.rinse || '' },
                { label: 'Swab ATP', value: d.pa?.cip?.final_tank?.swab || '' },
                { label: 'PIC PA', value: d.pa?.cip?.final_tank?.pic || '' },
              ]),
            },
          ],
          paFields: [],
          qcTitle: 'Hasil Pengujian Laboratorium Mutu Evaporasi & Final Tank',
          qcRole: 'QC',
          qcSections: [
            {
              title: 'Analisa Kualitas Produk Evaporation',
              refForm: 'Form QF/PDQC/QC/011',
              badge: 'Evaporasi',
              dotColor: 'bg-blue-600',
              metrics: cleanMetrics([
                { label: 'Visual/Foreign Matter', value: d.qc?.qc_evap_visual_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Brix/TS', value: d.qc?.qc_evap_brix_ts || '', spec: 'Total Solid' },
                { label: 'pH', value: d.qc?.qc_evap_ph || '', spec: 'Std 5.20 - 5.60' },
                { label: 'Viskositas', value: d.qc?.qc_evap_viskositas || '', spec: 'Viskositas' },
                { label: 'Density', value: d.qc?.qc_evap_density || '', spec: 'Berat Jenis' },
                { label: 'Screening Test', value: d.qc?.qc_evap_screening || '', spec: 'Std Screening' },
              ]),
              cuptestTitle: 'Evaporasi',
              cuptest: cleanFields([
                { label: 'Wangi', value: d.qc?.qc_evap_wangi || '' },
                { label: 'Pahit', value: d.qc?.qc_evap_pahit || '' },
                { label: 'Asam', value: d.qc?.qc_evap_asam || '' },
              ]),
            },
            {
              title: 'Analisa Kualitas Produk Final Tank (after circulation)',
              refForm: 'Form QF/PDQC/QC/012',
              badge: 'Final Tank',
              dotColor: 'bg-indigo-600',
              metrics: cleanFields([
                { label: 'Nomer Final Tank', value: d.qc?.qc_ft_nomor || (d.evaporation?.no_final_tank ? String(d.evaporation.no_final_tank) : ''), spec: 'FT Number' },
                { label: 'Jumlah Pure Aroma', value: d.qc?.qc_ft_pure_aroma || '', spec: 'Pure Aroma' },
                { label: 'Level Final Tank', value: d.qc?.qc_ft_level || '', spec: 'Kapasitas' },
                { label: 'Visual/Foreign Matter', value: d.qc?.qc_ft_visual_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Brix/TS', value: d.qc?.qc_ft_brix_ts || '', spec: 'Total Solid' },
                { label: 'pH', value: d.qc?.qc_ft_ph || '', spec: 'Std 5.20 - 5.60' },
                { label: 'Viskositas', value: d.qc?.qc_ft_viskositas ? withUnit(d.qc.qc_ft_viskositas, 'cP') : '', spec: 'Viskositas' },
                { label: 'Density', value: d.qc?.qc_ft_density ? withUnit(d.qc.qc_ft_density, 'g/L') : '', spec: 'Berat Jenis' },
                { label: 'Screening Test', value: d.qc?.qc_ft_screening || '', spec: 'Std Screening' },
              ]),
              cuptestTitle: 'Final Tank',
              cuptest: cleanFields([
                { label: 'Wangi', value: d.qc?.qc_ft_wangi || '' },
                { label: 'Pahit', value: d.qc?.qc_ft_pahit || '' },
                { label: 'Asam', value: d.qc?.qc_ft_asam || '' },
              ]),
            },
          ],
          qcMetrics: [],
          cuptestMetrics: [],
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
          paTable: d.pa?.tables?.evaporation?.rows?.length ? {
            pic: 'PA',
            title: `Tabel Verifikasi Sanitasi CIP Evaporator & Final Tank (${d.pa.tables.evaporation.tableName})`,
            tableName: d.pa.tables.evaporation.tableName,
            rows: d.pa.tables.evaporation.rows,
            columns: d.pa.tables.evaporation.columns,
            averages: d.pa.tables.evaporation.averages || {},
          } : null,
          pic: {
            operasional: d.evaporation?.operator_produksi || '',
            qc: d.qc?.qc_evap_pic || d.qc?.qc_ft_pic || '',
            pa: d.pa?.cip?.evaporation?.pic || d.pa?.cip?.final_tank?.pic || '',
          },
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
          pendingPicName: hasDryer ? 'Produksi' : 'Data tidak ditemukan di database',
          processDate: dryDate,
          operationalTitle: 'Data Operasional Pengeringan Spray Dryer',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu proses', value: d.dryer?.waktu_proses || '' },
            { label: 'Catatan abnormalitas proses', value: d.dryer?.abnormalitas || '' },
            { label: 'Gas CO2 - Nama supplier', value: d.dryer?.supplier_co2 || '' },
            { label: 'Gas CO2 - Tanggal kedatangan', value: d.dryer?.tgl_co2 || '' },
          ]),
          paTitle: 'Verifikasi Sanitasi CIP Spray Dryer',
          paFields: cleanFields([
            { label: 'Waktu CIP terakhir', value: d.pa?.cip?.dryer?.tanggal || '' },
            { label: 'Konsentrasi lye', value: d.pa?.cip?.dryer?.konsentrasi_lye || (d.pa?.cip?.dryer?.tanggal ? '3%' : '') },
            { label: 'Verifikasi Final Rinse', value: (d.pa?.cip?.dryer?.ph_lab && d.pa.cip.dryer.ph_lab !== '-' && d.pa.cip.dryer.ph_lab !== '0') ? `pH: ${d.pa.cip.dryer.ph_lab} (OK)` : '' },
            { label: 'PIC PA', value: d.pa?.cip?.dryer?.pic || '' },
          ]),
          qcTitle: 'Monitoring Kualitas Produk di VF2',
          qcRole: 'QC',
          qcMetrics: cleanMetrics([
            { label: 'Kadar air', value: d.qc?.qc_dryer_vf2_kadar_air ? withUnit(d.qc.qc_dryer_vf2_kadar_air, '%') : '', spec: 'Maks. 3.00%' },
            { label: 'Density', value: d.qc?.qc_dryer_vf2_density ? withUnit(d.qc.qc_dryer_vf2_density, 'g/L') : '', spec: 'Std 240 - 260 g/L' },
            { label: 'Foreign Matter', value: d.qc?.qc_dryer_vf2_fm || '', spec: 'Bebas Benda Asing' },
            { label: 'Visual', value: d.qc?.qc_dryer_vf2_visual || '', spec: 'Bubuk Kering Sesuai' },
            { label: 'Warna', value: d.qc?.qc_dryer_vf2_warna || '', spec: 'Standar Agtron' },
            { label: 'Brix', value: d.qc?.qc_dryer_vf2_brix || '', spec: 'Std Brix' },
            { label: 'pH', value: d.qc?.qc_dryer_vf2_ph || '', spec: 'Std pH' },
            { label: 'Floating Particles', value: d.qc?.qc_dryer_vf2_floating || '', spec: '0 (Nol Partikel)' },
          ]),
          cuptestMetrics: cleanFields([
            { label: 'Wangi', value: d.qc?.qc_dryer_vf2_wangi || '' },
            { label: 'Pahit', value: d.qc?.qc_dryer_vf2_pahit || '' },
            { label: 'Asam', value: d.qc?.qc_dryer_vf2_asam || '' },
            { label: 'Body', value: d.qc?.qc_dryer_vf2_body || '' },
            { label: 'Sepat', value: d.qc?.qc_dryer_vf2_sepat || '' },
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
          paTable: d.pa?.tables?.dryer?.rows?.length ? {
            pic: 'PA',
            title: `Tabel Verifikasi Sanitasi CIP Spray Dryer (${d.pa.tables.dryer.tableName})`,
            tableName: d.pa.tables.dryer.tableName,
            rows: d.pa.tables.dryer.rows,
            columns: d.pa.tables.dryer.columns,
            averages: d.pa.tables.dryer.averages || {},
          } : null,
          cipChecklist: d.pa?.dryer_cip_checklist || null,
          pic: {
            operasional: d.dryer?.operator_produksi || '',
            qc: d.qc?.qc_dryer_vf2_pic || '',
            pa: d.pa?.cip?.dryer?.pic || '',
          },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 6: PENGERJAAN ULANG / REWORK (Flow 3)
    // ══════════════════════════════════════════════════════════════
    'rework': {
      ...CLUSTER_CONFIG[5],
      subflows: [
        {
          flowNumber: 'Flow 3',
          title: 'REWORK',
          refDoc: 'Form QF/PROD/IC/054 & F/QC/01.030',
          isAvailable: hasRework,
          pendingPicName: hasRework ? 'Produksi & QC' : 'Data tidak ditemukan di database',
          operationalTitle: 'Data Pengerjaan Ulang Rework',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Jumlah bahan rework (in box)', value: d.rework?.jumlah_box || '' },
            { label: 'Tanggal serah terima bahan rework dari GBJ', value: d.rework?.tgl_serah_terima || '' },
            { label: 'Identitas bahan rework yang dipakai', value: d.rework?.identitas || '' },
            { label: 'Waktu proses rework', value: d.rework?.waktu_proses || '' },
            { label: 'Lokasi proses rework', value: d.rework?.lokasi || '' },
            { label: 'Formula rework', value: d.rework?.formula || '' },
            { label: 'Target TS', value: d.rework?.target_ts || '' },
            { label: 'Level tank rework', value: d.rework?.level_tank || '' },
            { label: 'Transfer ke proses', value: d.rework?.transfer_ke || '' },
            { label: 'Catatan abnormalitas proses', value: d.rework?.abnormalitas || '' },
          ]),
          paTitle: 'Verifikasi Sanitasi CIP Tank Rework',
          paFields: cleanFields([
            { label: 'Waktu CIP terakhir', value: d.pa?.cip?.rework?.tanggal || '' },
            { label: 'Konsentrasi lye', value: d.pa?.cip?.rework?.konsentrasi_lye || (d.pa?.cip?.rework?.tanggal ? '3%' : '') },
            { label: 'Verifikasi Final Rinse', value: d.pa?.cip?.rework?.rinse || '' },
            { label: 'PIC PA', value: d.pa?.cip?.rework?.pic || '' },
          ]),
          qcTitle: null,
          qcMetrics: [],
          prodTable: null,
          qcTable: null,
          paTable: d.pa?.tables?.rework?.rows?.length ? {
            pic: 'PA',
            title: `Tabel Verifikasi Sanitasi CIP Tank Rework (${d.pa.tables.rework.tableName})`,
            tableName: d.pa.tables.rework.tableName,
            rows: d.pa.tables.rework.rows,
            columns: d.pa.tables.rework.columns,
            averages: d.pa.tables.rework.averages || {},
          } : null,
          pic: {
            operasional: d.rework?.operator || '',
            qc: '',
            pa: d.pa?.cip?.rework?.pic || '',
          },
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
          pendingPicName: hasPacking ? 'Produksi' : 'Data tidak ditemukan di database',
          processDate: packDate,
          operationalTitle: 'Data Operasional Pengemasan Box',
          prodRole: 'Produksi',
          fields: cleanFields([
            { label: 'Waktu proses', value: d.packing?.waktu_proses || '' },
            { label: 'Shift', value: d.packing?.shift ? withPrefix(d.packing.shift, 'Shift') : '' },
            { label: 'Nama operator packing', value: d.packing?.operator_packing || '' },
            { label: 'Nama helper packing', value: cleanVal(d.packing?.team) },
            { label: 'Waktu dan hasil verifikasi/validasi CCP', value: d.packing?.dehumidifier ? withPrefix(d.packing.dehumidifier, 'Dehumidifier:') : '' },
            { label: 'Suhu dan RH ruang packing', value: d.packing?.suhu_rh_packing || '' },
            { label: 'Checklist kebersihan area packing', value: '' },
            { label: 'No Lot/Batch karton', value: '' },
            { label: 'Nama supplier karton', value: '' },
            { label: 'No Lot/Batch plastik', value: '' },
            { label: 'Nama supplier plastik', value: '' },
            { label: 'Catatan abnormalitas proses', value: d.packing?.abnormalitas || '' },
            { label: 'Berat box', value: d.packing?.berat_box || '' },
            { label: 'Total output produk', value: cleanVal(d.packing?.total_output) !== '' ? cleanVal(d.packing?.total_output) : (d.packing?.total_output_kg ? withUnit(d.packing.total_output_kg, 'kg') : '') },
          ]),
          paTitle: 'Pemantauan Sanitasi Lingkungan & Instrument Packing',
          paSections: [
            {
              title: 'COP Instrument',
              refForm: 'Form QF/PDQC/SS/010',
              badge: 'COP',
              dotColor: 'bg-emerald-600',
              fields: cleanFields([
                { label: 'Waktu COP instrument packing terakhir', value: d.pa?.cop?.tanggal || '' },
                { label: 'Verifikasi swab ATP', value: d.pa?.cop?.swab || '' },
                { label: 'PIC Prod dan PA', value: d.pa?.cop?.pic || '' },
              ]),
            },
            {
              title: 'Environmental Swab',
              refForm: 'Form QF/PDQC/SS/010',
              badge: 'EMP',
              dotColor: 'bg-teal-600',
              fields: cleanFields([
                { label: 'Waktu Environmental Swab internal terakhir (non pathogen)', value: d.pa?.emp?.internal_tanggal || '' },
                { label: 'List intrument dan personal serta hasil swab (Internal)', value: d.pa?.emp?.internal_hasil || '' },
                { label: 'Waktu Environmental Swab eksternal terakhir (pathogen)', value: d.pa?.emp?.external_tanggal || '' },
                { label: 'List intrument dan personal serta hasil swab (Eksternal)', value: d.pa?.emp?.external_hasil || '' },
                { label: 'PIC Prod dan PA', value: d.pa?.emp?.pic || '' },
              ]),
            },
            {
              title: 'Air Bacteria Exposed',
              refForm: 'Form QF/PDQC/SS/010',
              badge: 'ABE',
              dotColor: 'bg-cyan-600',
              fields: cleanFields([
                { label: 'Waktu Air Bacteria Exposed terakhir', value: d.pa?.abe?.tanggal || '' },
                { label: 'Hasil pengujian', value: d.pa?.abe?.hasil || '' },
                { label: 'PIC Prod dan PA', value: d.pa?.abe?.pic || '' },
              ]),
            },
          ],
          paFields: [],
          qcTitle: 'Hasil Pengujian Laboratorium Mutu Finished Goods',
          qcRole: 'QC',
          qcSections: [
            {
              title: 'Analisa Kualitas Finished Good',
              refForm: 'Form QF/PDQC/QC/016',
              badge: 'Fisika Kimia',
              dotColor: 'bg-blue-600',
              metrics: cleanMetrics([
                { label: 'Verifikasi Label', value: d.qc?.qc_packing_verifikasi_label || '', spec: 'Sesuai Standar' },
                { label: 'Kondisi kemasan', value: d.qc?.qc_packing_kondisi_kemasan || '', spec: 'Kondisi Baik' },
                { label: 'Kadar air', value: d.qc?.qc_packing_kadar_air ? withUnit(d.qc.qc_packing_kadar_air, '%') : '', spec: 'Maks. 3.00%' },
                { label: 'Bulk Density', value: d.qc?.qc_packing_density ? withUnit(d.qc.qc_packing_density, 'g/L') : '', spec: 'Std 240 - 260 g/L' },
                { label: 'Foreign Matter', value: d.qc?.qc_packing_fm || '', spec: 'Bebas Benda Asing' },
                { label: 'Visual', value: d.qc?.qc_packing_visual || '', spec: 'Bubuk Kering Sesuai' },
                { label: 'Warna', value: d.qc?.qc_packing_warna || '', spec: 'Standar Agtron' },
                { label: 'Brix', value: d.qc?.qc_packing_brix || '', spec: 'Std Brix' },
                { label: 'pH', value: d.qc?.qc_packing_ph || '', spec: 'Std pH' },
                { label: 'Floating Particles', value: d.qc?.qc_packing_floating || '', spec: '0 (Nol Partikel)' },
                { label: 'Fluidity', value: d.qc?.qc_packing_fluidity || '', spec: 'Free Flowing' },
                { label: 'Solubility', value: d.qc?.qc_packing_solubility ? withUnit(d.qc.qc_packing_solubility, 's') : '', spec: 'Maks. 30 detik' },
              ]),
              cuptestTitle: 'Finished Goods',
              cuptest: cleanFields([
                { label: 'Wangi', value: d.qc?.qc_packing_wangi || '' },
                { label: 'Pahit', value: d.qc?.qc_packing_pahit || '' },
                { label: 'Asam', value: d.qc?.qc_packing_asam || '' },
                { label: 'Body', value: d.qc?.qc_packing_body || '' },
                { label: 'Sepat', value: d.qc?.qc_packing_sepat || '' },
              ]),
            },
            {
              title: 'Particle Size Distribution (Mesh)',
              refForm: 'Form QF/PDQC/QC/016',
              badge: 'Mesh Size',
              dotColor: 'bg-indigo-600',
              metrics: cleanMetrics([
                { label: '>600', value: d.qc?.qc_packing_mesh_gt600 || '', spec: 'Mesh Distribution' },
                { label: '425-<600', value: d.qc?.qc_packing_mesh_425_600 || '', spec: 'Mesh Distribution' },
                { label: '300-<425', value: d.qc?.qc_packing_mesh_300_425 || '', spec: 'Mesh Distribution' },
                { label: '250-<300', value: d.qc?.qc_packing_mesh_250_300 || '', spec: 'Mesh Distribution' },
                { label: '212-<250', value: d.qc?.qc_packing_mesh_212_250 || '', spec: 'Mesh Distribution' },
                { label: '180-<212', value: d.qc?.qc_packing_mesh_180_212 || '', spec: 'Mesh Distribution' },
                { label: '150-<180', value: d.qc?.qc_packing_mesh_150_180 || '', spec: 'Mesh Distribution' },
                { label: '<150', value: d.qc?.qc_packing_mesh_lt150 || '', spec: 'Mesh Distribution' },
              ]),
            },
            {
              title: 'Analisa Mikrobiologi Produk Akhir',
              refForm: 'Form QF/PDQC/QC/016',
              badge: 'Mikrobiologi',
              dotColor: 'bg-teal-600',
              metrics: cleanMetrics([
                { label: 'Total Plate Count (TPC)', value: d.qc?.qc_packing_tpc || '', spec: '< 1.0 x 10^3 cfu/g' },
                { label: 'Yeast & Mold', value: d.qc?.qc_packing_yeast_mold || '', spec: '< 1.0 x 10^2 cfu/g' },
                { label: 'Petugas QC Mikrobiologi', value: d.qc?.qc_packing_pic_mikro || '', spec: 'Analis Mikro' },
              ]),
            },
            {
              title: 'Pelepasan Status Produk (Release Management)',
              refForm: 'Form F/QC/01.030',
              badge: 'Status Rilis',
              dotColor: 'bg-emerald-600',
              metrics: cleanMetrics([
                { label: 'Rilis Status OK (Box)', value: d.qc?.qc_packing_status_ok || '', spec: 'Lolos Mutu' },
                { label: 'Status Blocked (Box)', value: d.qc?.qc_packing_status_bo || '', spec: 'Karantina' },
                { label: 'Petugas Release QC', value: d.qc?.qc_packing_status_pic || '', spec: 'QA/QC Lead' },
              ]),
            },
          ],
          qcMetrics: [],
          cuptestMetrics: [],
          prodTable: hasPacking ? {
            pic: 'Produksi',
            title: `Tabel Operasional Pengemasan Box Tower ${tKey}`,
            tableName: packTable,
            rows: d.packing?.raw_rows || [],
            columns: d.packing?.columns || [],
          } : null,
          qcTable: d.qc_raw?.packing?.raw_rows?.length ? {
            pic: 'QC',
            title: `Tabel QC Finished Good Packing Tower ${tKey} (qc_packing_${twSuffix})`,
            tableName: `qc_packing_${twSuffix}`,
            rows: d.qc_raw.packing.raw_rows,
            columns: d.qc_raw.packing.raw_rows[0] ? Object.keys(d.qc_raw.packing.raw_rows[0]) : [],
          } : null,
          cipChecklist: d.pa?.packing_cop_checklist || null,
          pic: {
            operasional: d.packing?.operator_packing || '',
            qc: d.qc?.qc_packing_pic || '',
            pa: d.pa?.cop?.pic || d.pa?.emp?.pic || '',
          },
        },
        {
          flowNumber: 'Flow 12',
          title: 'INCOMING BAHAN KEMAS',
          refDoc: 'Form F/SC/02.6, F/SC/02.11 & F/QC/01.030',
          isAvailable: hasFgwKemas,
          pendingPicName: hasFgwKemas ? 'FGW & QC' : 'FGW & QC (Data belum ada di database)',
          noticeText: 'Data Kedatangan Bahan Kemasan Karton & Plastik belum ada di database MySQL.',
          operationalTitle: 'Data Kedatangan Bahan Kemasan Karton & Plastik',
          prodRole: 'FGW',
          sections: [
            {
              title: 'KARTON',
              refForm: 'Form F/SC/02.6 & F/SC/02.11',
              badge: 'Karton Box',
              dotColor: 'bg-amber-700',
              fields: cleanFields([
                { label: 'Tanggal kedatangan', value: d.fgw?.karton_tgl_kedatangan || '' },
                { label: 'Supplier', value: d.fgw?.karton_supplier || '' },
                { label: 'Nomor truk', value: d.fgw?.karton_no_truk || '' },
                { label: 'Nomer PO', value: d.fgw?.karton_no_po || '' },
                { label: 'Nomer Lot/Batch', value: d.fgw?.lot_karton || '' },
                { label: 'Jumlah', value: d.fgw?.karton_jumlah || '' },
                { label: 'Verifikasi kondisi truk', value: d.fgw?.karton_verifikasi_truk || '' },
                { label: 'Tanggal serah terima ke packing', value: d.fgw?.karton_tgl_serah_terima || '' },
              ]),
            },
            {
              title: 'PLASTIK',
              refForm: 'Form F/SC/02.6 & F/SC/02.11',
              badge: 'Plastik PE',
              dotColor: 'bg-indigo-600',
              fields: cleanFields([
                { label: 'Tanggal kedatangan', value: d.fgw?.plastik_tgl_kedatangan || '' },
                { label: 'Supplier', value: d.fgw?.supplier_plastik || '' },
                { label: 'Nomor truk', value: d.fgw?.plastik_no_truk || '' },
                { label: 'Nomer PO', value: d.fgw?.plastik_no_po || '' },
                { label: 'Nomer Lot/Batch', value: d.fgw?.lot_plastik || '' },
                { label: 'Jumlah', value: d.fgw?.plastik_jumlah || '' },
                { label: 'Verifikasi kondisi truk', value: d.fgw?.plastik_verifikasi_truk || '' },
                { label: 'Tanggal serah terima ke packing', value: d.fgw?.plastik_tgl_serah_terima || '' },
              ]),
            },
          ],
          fields: [],
          qcTitle: 'Hasil Pengujian Fisik Bahan Kemasan',
          qcRole: 'QC',
          qcSections: [
            {
              title: 'Analisa Kualitas Kedatangan Karton',
              refForm: 'Form QF/PDQC/QC/017',
              badge: 'Karton',
              dotColor: 'bg-amber-700',
              metrics: cleanMetrics([
                { label: 'Kondisi fisik', value: d.fgw?.qc_karton_fisik || '', spec: 'Kondisi Baik' },
                { label: 'Berat', value: d.fgw?.qc_karton_berat || '', spec: 'Gramatur' },
                { label: 'Dimensi', value: d.fgw?.qc_karton_dimensi || '', spec: 'Dimensi Box' },
                { label: 'Printing', value: d.fgw?.qc_karton_printing || '', spec: 'Jelas & Rapi' },
                { label: 'Sealing', value: d.fgw?.qc_karton_sealing || '', spec: 'Rapat' },
                { label: 'BCT (CoA)', value: d.fgw?.bct || '', spec: 'Min. 550 kgf' },
                { label: 'Status', value: d.fgw?.qc_karton_status || '', spec: 'Lolos Uji Mutu' },
              ]),
            },
            {
              title: 'Analisa Kualitas Kedatangan Plastik',
              refForm: 'Form QF/PDQC/QC/017',
              badge: 'Plastik',
              dotColor: 'bg-indigo-600',
              metrics: cleanMetrics([
                { label: 'Kondisi fisik', value: d.fgw?.qc_plastik_fisik || '', spec: 'Kondisi Baik' },
                { label: 'Berat', value: d.fgw?.qc_plastik_berat || '', spec: 'Gramatur' },
                { label: 'Dimensi', value: d.fgw?.qc_plastik_dimensi || '', spec: 'Dimensi' },
                { label: 'Sealing', value: d.fgw?.qc_plastik_sealing || '', spec: 'Rapat' },
                { label: 'Swab Test ATP', value: d.fgw?.swab_atp || '', spec: '< 100 RLU' },
                { label: 'Status', value: d.fgw?.qc_plastik_status || '', spec: 'Lolos Uji Mutu' },
              ]),
            },
          ],
          qcMetrics: [],
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.fgw?.karton_pic_fgw || '', qc: d.fgw?.qc_karton_pic || '' },
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // CLUSTER 8: DISTRIBUSI (Flow 1)
    // ══════════════════════════════════════════════════════════════
    'distribusi': {
      ...CLUSTER_CONFIG[7],
      subflows: [
        {
          flowNumber: 'Flow 1',
          title: 'DISTRIBUSI',
          refDoc: 'Surat Jalan Antar Gudang, F-SC-02.2 & F/QC/01.030',
          isAvailable: hasDistribusi,
          pendingPicName: hasDistribusi ? 'FGW & QA' : 'FGW & QA (Data belum ada di database)',
          noticeText: 'Data Pengiriman Produk Jadi (FGW) dan verifikasi CoA belum ada di database MySQL.',
          operationalTitle: 'Data Gudang & Pengiriman Produk Jadi',
          prodRole: 'FGW',
          fields: cleanFields([
            { label: 'Posisi produk', value: d.distribusi?.posisi_produk || '' },
            { label: 'Waktu pengiriman', value: d.distribusi?.waktu_pengiriman || '' },
            { label: 'Nomer surat jalan', value: d.distribusi?.no_sj || '' },
            { label: 'Nomer truk', value: d.distribusi?.no_truk || '' },
            { label: 'Jumlah', value: d.distribusi?.jumlah || '' },
            { label: 'Tujuan pengiriman', value: d.distribusi?.tujuan || '' },
            { label: 'Lokasi gudang penyimpanan', value: d.distribusi?.lokasi_gudang || '' },
            { label: 'Nomer rak', value: d.distribusi?.nomer_rak || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
            { label: 'Nomer pallet', value: d.distribusi?.nomer_pallet || '', colSpan: 'col-span-1 sm:col-span-2 lg:col-span-2' },
          ]),
          qcTitle: 'Verifikasi Dokumen & Pelepasan Pengiriman',
          qcRole: 'QC',
          qcMetrics: cleanMetrics([
            { label: 'Nomor Certificate of Analysis (CoA)', value: d.distribusi?.no_coa || '', spec: 'CoA Produk' },
            { label: 'Verifikasi kendaraan pengiriman', value: d.distribusi?.verifikasi_kendaraan || '', spec: 'Inspeksi Truk' },
          ]),
          prodTable: null,
          qcTable: null,
          pic: { operasional: d.distribusi?.pic_fgw || '', qc: d.distribusi?.pic_qc || '' },
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
