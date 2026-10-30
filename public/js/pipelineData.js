/**
 * Pipeline Journey Stages & Helper for Interactive Traceability
 * PT. Santos Jaya Abadi - Clean SVG Line Icons & Scroll Reveal
 */

const PIPELINE_STAGES = [
  {
    key: 'RMW',
    title: 'Gudang Bahan Baku',
    subtitle: 'Green Bean Warehouse & Silo',
    division: 'RMW',
    docNo: 'F/WHS/01.002',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
  },
  {
    key: 'ROASTING',
    title: 'Proses Roasting',
    subtitle: 'Sangrai Biji Kopi (Probat & Silo)',
    division: 'Produksi',
    docNo: 'F/PROD/02.011',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
  },
  {
    key: 'GRINDING',
    title: 'Proses Grinding',
    subtitle: 'Penggilingan & Uji Partikel Mesh',
    division: 'Produksi & QC',
    docNo: 'F/QC/01.015',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  },
  {
    key: 'EXTRACTION',
    title: 'Ekstraksi Kopi',
    subtitle: 'Aroma, Hydro & Tank System',
    division: 'Produksi & QC',
    docNo: 'F/QC/01.018',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path><path d="M8.5 2h7"></path><path d="M7 16h10"></path></svg>',
  },
  {
    key: 'EVAPORATION',
    title: 'Evaporasi & Final Tank',
    subtitle: 'Pemekatan & Penambahan Aroma',
    division: 'Produksi & QC',
    docNo: 'F/QC/01.022',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 2v6"></path><path d="m4.93 10.93 4.24 4.24"></path><path d="M2 18h6"></path><path d="M20 18h2"></path><path d="m19.07 10.93-4.24 4.24"></path><ellipse cx="12" cy="18" rx="8" ry="4"></ellipse></svg>',
  },
  {
    key: 'DRYER',
    title: 'Spray Dryer',
    subtitle: 'Feed Tank & Pengeringan Bubuk',
    division: 'Produksi & QC',
    docNo: 'F/QC/01.025',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',
  },
  {
    key: 'PACKING',
    title: 'Pengemasan / FG',
    subtitle: 'Box Finished Good & Particle Size',
    division: 'Produksi & QC',
    docNo: 'F/QC/01.030',
    iconSvg: '<svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
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

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!elements.length) return;

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    // Elemen hidden (v-show=false) punya rect semua 0 — tetap reveal agar
    // langsung terlihat saat v-show berubah jadi true
    const isHidden = rect.width === 0 && rect.height === 0;
    if (isHidden || rect.top < window.innerHeight + 150) {
      el.classList.add('is-revealed');
    }
  });

  if (typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05 });

    elements.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });
  } else {
    elements.forEach(el => el.classList.add('is-revealed'));
  }
}

if (typeof window !== 'undefined') {
  window.PIPELINE_STAGES = PIPELINE_STAGES;
  window.extractStageMetrics = extractStageMetrics;
  window.initScrollReveal = initScrollReveal;
}
