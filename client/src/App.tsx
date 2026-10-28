import { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { TopHeader } from '@/components/layout/TopHeader';
import { KpiSummaryCards } from '@/features/traceability/KpiSummaryCards';
import { ProcessSectionCard } from '@/features/traceability/ProcessSectionCard';
import { UnifiedInspectDialog } from '@/components/modals/UnifiedInspectDialog';
import { FLOW_SECTIONS } from '@/constants/flowSections';
import type { TraceResult, InspectModalState } from '@/types/traceability';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'report';
  });
  const [batchInput, setBatchInput] = useState('A370/26');
  const [tower, setTower] = useState('1');
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(true);
  const [traceResult, setTraceResult] = useState<TraceResult | null>(null);
  const [inspectModal, setInspectModal] = useState<InspectModalState | null>(null);

  // Browser History Navigation (Back / Forward Button Support)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (inspectModal) {
        setInspectModal(null);
        return;
      }
      const tab = e.state?.tab || window.location.hash.replace('#', '') || 'report';
      setActiveTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inspectModal]);

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    window.history.pushState({ tab }, '', `#${tab}`);
  };

  // Initial health & auto-search preset audit
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        setDbConnected(res.ok);
        if (res.ok) handleSearchTrace();
      })
      .catch(() => setDbConnected(false));
  }, []);

  const handleSearchTrace = async () => {
    if (!batchInput) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trace?noBatchFull=${encodeURIComponent(batchInput)}&tower=${tower}`);
      if (!res.ok) throw new Error('Data traceability tidak ditemukan di DB');
      const data = await res.json();
      setTraceResult(data);
      setDbConnected(true);
    } catch (err) {
      console.error('[TraceQueryError]', err);
    } finally {
      setLoading(false);
    }
  };

  const cipChecklist = traceResult?.pa?.extraction_cip_checklist || traceResult?.extraction?.cipChecklist;

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-stone-900 flex flex-row font-sans">
      {/* 120 FPS Ultra-Smooth Hardware-Accelerated Sidebar Navigation */}
      <SidebarNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        dbConnected={dbConnected}
      />

      {/* Main Content Wrapper */}
      <div className="main-content-wrap flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader
          batchInput={batchInput}
          setBatchInput={setBatchInput}
          tower={tower}
          setTower={setTower}
          onSearch={handleSearchTrace}
          loading={loading}
          dbConnected={dbConnected}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <KpiSummaryCards data={traceResult} />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-stone-900 tracking-tight">
                  Alur Proses Form F/QC/01.030
                </h2>
                <p className="text-xs text-stone-500">
                  Data penelusuran multi-echelon terverifikasi MySQL db_traceability_sja.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-coffee-800 bg-coffee-100/70 px-2.5 py-1 rounded-xl">
                {FLOW_SECTIONS.length} Tahapan Proses
              </span>
            </div>

            <div className="space-y-3.5">
              {FLOW_SECTIONS.map((section, idx) => (
                <ProcessSectionCard
                  key={section.name}
                  section={section}
                  index={idx}
                  traceResult={traceResult}
                  cipChecklist={section.name === 'EKSTRAKSI' ? cipChecklist : undefined}
                  onOpenInspect={(modal) => setInspectModal(modal)}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Unified Inspect Pop-up Modal (DevTools style) */}
      <UnifiedInspectDialog
        data={inspectModal}
        onClose={() => setInspectModal(null)}
      />
    </div>
  );
}

export default App;
