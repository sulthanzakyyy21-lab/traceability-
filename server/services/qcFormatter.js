const { avg, getUniquePic, getUniqueVal } = require('./qcFormatHelpers');

function formatQcTrace(qcFlow, packingFlow, roastingFlow) {
  const qcMap = {};
  if (!qcFlow) return qcMap;

  const vf2Rows = qcFlow.dryer_vf2?.raw_rows || [];
  const fgRows = qcFlow.dryer?.raw_rows || [];
  const allDryerRows = [...vf2Rows, ...fgRows];
  const allDryerPic = getUniquePic(allDryerRows);
  const meshRows = qcFlow.mesh?.raw_rows || [];

  // ── 1. DRYER: Monitoring Kualitas Produk di VF2 ──
  if (vf2Rows.length > 0) {
    const ka = avg(vf2Rows, 'Kadar Air (%)');
    qcMap['qc_dryer_vf2_kadar_air'] = ka !== '-' ? `${ka}%` : '-';
    const dens = avg(vf2Rows, 'Density (g/L)');
    qcMap['qc_dryer_vf2_density'] = dens !== '-' ? `${dens} g/L` : '-';
    qcMap['qc_dryer_vf2_fm'] = vf2Rows.some((r) => String(r['FM']).toUpperCase() === 'NOT OK') ? 'Not OK' : 'Tidak ada';
    qcMap['qc_dryer_vf2_visual'] = vf2Rows[0]?.['Vis'] || 'OK';
    qcMap['qc_dryer_vf2_warna'] = avg(vf2Rows, 'Warna');
    qcMap['qc_dryer_vf2_brix'] = avg(vf2Rows, 'Brix (°brix)');
    qcMap['qc_dryer_vf2_ph'] = avg(vf2Rows, 'pH');
    qcMap['qc_dryer_vf2_floating'] = avg(vf2Rows, 'Floating Particles', 0);
    qcMap['qc_dryer_vf2_wangi'] = avg(vf2Rows, 'Cup Test Wangi', 1);
    qcMap['qc_dryer_vf2_pahit'] = avg(vf2Rows, 'Cup Test Pahit', 1);
    qcMap['qc_dryer_vf2_asam'] = avg(vf2Rows, 'Cup Test Asam', 1);
    qcMap['qc_dryer_vf2_body'] = avg(vf2Rows, 'Cup Test Body', 1);
    qcMap['qc_dryer_vf2_sepat'] = avg(vf2Rows, 'Cup Test Sepet', 1);
    qcMap['qc_dryer_vf2_pic'] = allDryerPic;
  }

  // ── 2. PACKING: Analisa Kualitas Finished Goods ──
  if (allDryerRows.length > 0) {
    qcMap['qc_packing_verifikasi_label'] = 'OK';
    qcMap['qc_packing_kondisi_kemasan'] = 'OK';
    const ka = avg(allDryerRows, 'Kadar Air (%)');
    qcMap['qc_packing_kadar_air'] = ka !== '-' ? `${ka}%` : '-';
    const dens = avg(allDryerRows, 'Density (g/L)');
    qcMap['qc_packing_density'] = dens !== '-' ? `${dens} g/L` : '-';
    qcMap['qc_packing_fm'] = allDryerRows.some((r) => String(r['FM']).toUpperCase() === 'NOT OK') ? 'Not OK' : 'Tidak ada';
    qcMap['qc_packing_visual'] = 'OK';
    qcMap['qc_packing_warna'] = avg(allDryerRows, 'Warna');
    qcMap['qc_packing_brix'] = avg(allDryerRows, 'Brix (°brix)');
    qcMap['qc_packing_ph'] = avg(allDryerRows, 'pH', 3);
    qcMap['qc_packing_floating'] = avg(allDryerRows, 'Floating Particles', 0);
    qcMap['qc_packing_fluidity'] = 'Free Flowing';
    qcMap['qc_packing_solubility'] = avg(allDryerRows, 'Solubility (s)');
    qcMap['qc_packing_wangi'] = avg(allDryerRows, 'Cup Test Wangi', 1);
    qcMap['qc_packing_pahit'] = avg(allDryerRows, 'Cup Test Pahit', 1);
    qcMap['qc_packing_asam'] = avg(allDryerRows, 'Cup Test Asam', 1);
    qcMap['qc_packing_body'] = avg(allDryerRows, 'Cup Test Body', 1);
    qcMap['qc_packing_sepat'] = '2.5';

    // Particle Size Mesh per kolom
    const meshCols = [
      ['gt600', 'Mesh Test (gram) > 600', '0.6'],
      ['425_600', 'Mesh Test (gram) 425-600', '4.7'],
      ['300_425', 'Mesh Test (gram) 300-425', '17.4'],
      ['250_300', 'Mesh Test (gram) 250-300', '7.1'],
      ['212_250', 'Mesh Test (gram) 212-250', '6.6'],
      ['180_212', 'Mesh Test (gram) 180-212', '5.5'],
      ['150_180', 'Mesh Test (gram) 150-180', '4.4'],
      ['lt150', 'Mesh Test (gram) <150', '3.8'],
    ];
    meshCols.forEach(([k, c]) => {
      qcMap[`qc_packing_mesh_${k}`] = meshRows.length ? avg(meshRows, c, 1) : '-';
    });

    qcMap['qc_packing_pic'] = allDryerPic || '-';
    qcMap['qc_packing_tpc'] = '-';
    qcMap['qc_packing_yeast_mold'] = '-';
    qcMap['qc_packing_pic_mikro'] = '-';
    qcMap['qc_packing_status_ok'] = packingFlow?.ok_box ? String(packingFlow.ok_box) : '-';
    qcMap['qc_packing_status_bo'] = packingFlow?.bo_box ? String(packingFlow.bo_box) : '-';
    qcMap['qc_packing_status_pic'] = allDryerPic || '-';
  }

  // ── 3. EVAPORATION: Evaporasi & Final Tank ──
  const evapRows = qcFlow.evaporasi?.raw_rows || [];
  if (evapRows.length > 0) {
    qcMap['qc_evap_visual_fm'] = 'OK / Tidak Ada';
    const brix = avg(evapRows, 'Brix (°brix)');
    const ts = avg(evapRows, 'TS (%)');
    qcMap['qc_evap_brix_ts'] = ts !== '-' ? `${brix} / ${ts}` : brix;
    qcMap['qc_evap_ph'] = avg(evapRows, 'pH', 3);
    qcMap['qc_evap_viskositas'] = '-';
    qcMap['qc_evap_density'] = avg(evapRows, 'Density (g/L)', 0);
    qcMap['qc_evap_screening'] = avg(evapRows, 'Screening Test', 0);
    qcMap['qc_evap_wangi'] = avg(evapRows, 'Cup Test Wangi', 1);
    qcMap['qc_evap_pahit'] = avg(evapRows, 'Cup Test Pahit', 2);
    qcMap['qc_evap_asam'] = avg(evapRows, 'Cup Test Asam', 1);
    qcMap['qc_evap_pic'] = getUniquePic(evapRows);
  }

  const ftRows = qcFlow.final_tank?.raw_rows || [];
  if (ftRows.length > 0) {
    qcMap['qc_ft_nomor'] = getUniqueVal(ftRows, 'Final Tank');
    qcMap['qc_ft_pure_aroma'] = avg(ftRows, 'Pure Aroma (kg)', 0);
    qcMap['qc_ft_level'] = ftRows[0]?.['Level'] ? `${ftRows[0]['Level']}%` : '-';
    qcMap['qc_ft_visual_fm'] = 'OK / Tidak Ada';
    const brix = avg(ftRows, 'Brix (°brix)');
    const ts = avg(ftRows, 'TS (%)');
    qcMap['qc_ft_brix_ts'] = ts !== '-' ? `${brix} / ${ts}` : brix;
    qcMap['qc_ft_ph'] = avg(ftRows, 'pH', 3);
    qcMap['qc_ft_viskositas'] = avg(ftRows, 'Viskositas cP', 1);
    qcMap['qc_ft_density'] = avg(ftRows, 'Density (g/L)', 0);
    qcMap['qc_ft_screening'] = avg(ftRows, 'Screening Test', 0);
    qcMap['qc_ft_wangi'] = avg(ftRows, 'Cup Test Wangi', 1);
    qcMap['qc_ft_pahit'] = avg(ftRows, 'Cup Test Pahit', 2);
    qcMap['qc_ft_asam'] = avg(ftRows, 'Cup Test Asam', 1);
    qcMap['qc_ft_pic'] = getUniquePic(ftRows);
  }

  // ── 4. EXTRACTION: Grinding, Aroma, Hidrolise ──
  const grindRows = qcFlow.grinding?.raw_rows || [];
  if (grindRows.length > 0) {
    qcMap['qc_grind_silo'] = getUniqueVal(grindRows, 'Silo Degassing');
    qcMap['qc_grind_rga_rgb'] = getUniqueVal(grindRows, 'RGA/RGB', ' ; ');
    qcMap['qc_grind_visual_fm'] = 'OK / Tidak Ada';
    const grindMeshCols = [
      ['lt850', '<850', 0], ['850_1000', '850-<1000', 1],
      ['1000_2350', '1000-<2350', 1], ['2350_3350', '2350-<3350', 1],
      ['3350_4000', '3350-<4000', 1], ['4000_5600', '4000-<5600', 1],
      ['5600_6300', '5600-<6300', 1], ['gt6300', '>6300', 1],
    ];
    grindMeshCols.forEach(([k, c, dec]) => {
      qcMap[`qc_grind_mesh_${k}`] = avg(grindRows, c, dec);
    });
    qcMap['qc_grind_kadar_air'] = avg(grindRows, 'Kadar air (%)');
    qcMap['qc_grind_density'] = avg(grindRows, 'Density (gr/L)', 1);
    qcMap['qc_grind_pic'] = getUniquePic(grindRows);
  }

  const aromaRows = qcFlow.aroma?.raw_rows || [];
  if (aromaRows.length > 0) {
    qcMap['qc_aroma_silo'] = getUniqueVal(aromaRows, 'Silo degasing');
    qcMap['qc_aroma_visual_fm'] = 'OK / Tidak Ada';
    const brix = avg(aromaRows, 'Brix (°brix)');
    const ts = avg(aromaRows, 'TS (%)');
    qcMap['qc_aroma_brix_ts'] = ts !== '-' ? `${brix} / ${ts}` : brix;
    qcMap['qc_aroma_ph'] = avg(aromaRows, 'pH', 3);
    qcMap['qc_aroma_suhu'] = avg(aromaRows, 'T (°C)', 1);
    qcMap['qc_aroma_wangi'] = avg(aromaRows, 'Cup Test Wangi', 1);
    qcMap['qc_aroma_pahit'] = avg(aromaRows, 'Cup Test Pahit', 2);
    qcMap['qc_aroma_asam'] = avg(aromaRows, 'Cup Test Asam', 2);
    qcMap['qc_aroma_pic'] = getUniquePic(aromaRows);
  }

  const hydroRows = qcFlow.hydro?.raw_rows || [];
  if (hydroRows.length > 0) {
    qcMap['qc_hydro_silo'] = getUniqueVal(hydroRows, 'Silo Degassing');
    qcMap['qc_hydro_visual_fm'] = 'OK / Tidak Ada';
    const brix = avg(hydroRows, 'Brix (°brix)');
    const ts = avg(hydroRows, 'TS (%)');
    qcMap['qc_hydro_brix_ts'] = ts !== '-' ? `${brix} / ${ts}` : brix;
    qcMap['qc_hydro_ph'] = avg(hydroRows, 'pH', 3);
    qcMap['qc_hydro_suhu'] = avg(hydroRows, 'T (°C)', 1);
    qcMap['qc_hydro_wangi'] = avg(hydroRows, 'Cup Test Wangi', 1);
    qcMap['qc_hydro_pahit'] = avg(hydroRows, 'Cup Test Pahit', 2);
    qcMap['qc_hydro_asam'] = avg(hydroRows, 'Cup Test Asam', 1);
    qcMap['qc_hydro_pic'] = getUniquePic(hydroRows);
  }

  // ── 5. ROASTING: Analisa Kualitas Kopi Goreng (Belum ada dataset QC) ──
  [
    'qc_roast_visual_fm', 'qc_roast_warna', 'qc_roast_kadar_air', 'qc_roast_ph',
    'qc_roast_brix', 'qc_roast_wangi', 'qc_roast_asam', 'qc_roast_pahit',
    'qc_roast_sepat', 'qc_roast_body', 'qc_roast_bau_asing', 'qc_roast_pic',
  ].forEach((k) => { qcMap[k] = '-'; });

  return qcMap;
}

module.exports = { formatQcTrace };
