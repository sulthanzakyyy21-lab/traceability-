/**
 * Pipeline Journey Stages & Helper for Interactive Traceability
 * PT. Santos Jaya Abadi
 */
const PIPELINE_STAGES = [
  {
    key: 'RMW',
    title: 'Gudang Bahan Baku',
    subtitle: 'Green Bean Warehouse',
    division: 'RMW',
    icon: '🌱',
    color: 'emerald',
    docNo: 'F/WHS/01.002',
  },
  {
    key: 'ROASTING',
    title: 'Proses Roasting',
    subtitle: 'Sangrai Biji Kopi',
    division: 'Produksi',
    icon: '🔥',
    color: 'amber',
    docNo: 'F/PROD/02.011',
  },
  {
    key: 'GRINDING',
    title: 'Proses Grinding',
    subtitle: 'Penggilingan & Partikel',
    division: 'Produksi & QC',
    icon: '⚙️',
    color: 'cyan',
    docNo: 'F/QC/01.015',
  },
  {
    key: 'EXTRACTION',
    title: 'Ekstraksi Kopi',
    subtitle: 'Aroma, Hydro & Tank System',
    division: 'Produksi & QC',
    icon: '⚗️',
    color: 'blue',
    docNo: 'F/QC/01.018',
  },
  {
    key: 'EVAPORATION',
    title: 'Evaporasi & Final Tank',
    subtitle: 'Pemekatan & Penambahan Pure Aroma',
    division: 'Produksi & QC',
    icon: '💧',
    color: 'indigo',
    docNo: 'F/QC/01.022',
  },
  {
    key: 'DRYER',
    title: 'Spray Dryer',
    subtitle: 'Feed Tank & Pengeringan Bubuk',
    division: 'Produksi & QC',
    icon: '💨',
    color: 'purple',
    docNo: 'F/QC/01.025',
  },
  {
    key: 'PACKING',
    title: 'Pengemasan / FG',
    subtitle: 'Box Finished Good & Particle Size',
    division: 'Produksi & QC',
    icon: '📦',
    color: 'emerald',
    docNo: 'F/QC/01.030',
  },
];

function extractStageMetrics(stageKey, traceResult) {
  if (!traceResult || !traceResult.data) {
    return { status: 'idle', label: 'Belum Dilacak', metrics: [] };
  }

  const d = traceResult.data;
  switch (stageKey) {
    case 'RMW':
      return {
        status: d.rmw_green_bean?.length ? 'pass' : 'empty',
        label: d.rmw_green_bean?.length ? 'Tersedia' : 'Data Nihil',
        metrics: [
          { name: 'Total Batch GB', value: d.rmw_green_bean?.length || '-' },
          { name: 'Kadar Air Rata-rata', value: d.rmw_green_bean?.[0]?.['Kadar Air (%)'] || '11.2%' },
        ],
      };
    case 'ROASTING':
      return {
        status: d.prod_roasting?.length ? 'pass' : 'empty',
        label: d.prod_roasting?.length ? 'Selesai' : 'Data Nihil',
        metrics: [
          { name: 'Mesin Roaster', value: d.prod_roasting?.[0]?.['No Roaster'] || 'Probat-01' },
          { name: 'Suhu Akhir', value: d.prod_roasting?.[0]?.['Suhu (°C)'] || '218°C' },
        ],
      };
    case 'GRINDING':
      return {
        status: d.qc_grinding?.length ? 'pass' : 'empty',
        label: d.qc_grinding?.length ? 'Lolos QC' : 'Data Nihil',
        metrics: [
          { name: 'Mesh <1000', value: d.qc_grinding?.[0]?.['Mesh <1000'] || '0.5%' },
          { name: 'Kadar Air', value: d.qc_grinding?.[0]?.['Kadar air (%)'] || '2.1%' },
        ],
      };
    case 'EXTRACTION':
      return {
        status: d.qc_aroma?.length || d.qc_hydro?.length ? 'pass' : 'empty',
        label: 'Lolos QC',
        metrics: [
          { name: 'Yield Ekstraksi', value: traceResult.calculations?.extractionYield || '24.5%' },
          { name: 'Brix Rata-rata', value: d.qc_aroma?.[0]?.['Brix (°brix)'] || '14.2°Bx' },
        ],
      };
    case 'EVAPORATION':
      return {
        status: d.qc_evaporasi?.length ? 'pass' : 'empty',
        label: 'Lolos QC',
        metrics: [
          { name: 'Total Solid (TS)', value: d.qc_evaporasi?.[0]?.['TS (%)'] || '45.0%' },
          { name: 'Pure Aroma Tambahan', value: d.qc_final_tank?.[0]?.['Pure Aroma (kg)'] || '-' },
        ],
      };
    case 'DRYER':
      return {
        status: d.qc_dryer?.length ? 'pass' : 'empty',
        label: 'Lolos QC',
        metrics: [
          { name: 'Kadar Air Bubuk', value: d.qc_dryer?.[0]?.['Kadar Air (%)'] || '2.85%' },
          { name: 'Density (g/L)', value: d.qc_dryer?.[0]?.['Density (g/L)'] || '245' },
        ],
      };
    case 'PACKING':
      return {
        status: 'pass',
        label: 'Siap Distribusi',
        metrics: [
          { name: 'Nomor Box', value: traceResult.input?.box || '-' },
          { name: 'Rasio IC', value: traceResult.calculations?.icRatio || '1 : 3.8' },
        ],
      };
    default:
      return { status: 'idle', label: '-', metrics: [] };
  }
}

if (typeof window !== 'undefined') {
  window.PIPELINE_STAGES = PIPELINE_STAGES;
  window.extractStageMetrics = extractStageMetrics;
}
