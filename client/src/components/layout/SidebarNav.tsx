import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  FileCheck,
  CloudDownload,
  Database,
  Menu,
  ChevronLeft,
} from 'lucide-react';

interface Props {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dbConnected: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  subtext: string;
  icon: React.ReactNode;
}

export const SidebarNav: React.FC<Props> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  dbConnected,
}) => {
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subtext: 'Operations Overview',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'pipeline',
      label: 'Batch Traceability',
      subtext: 'Direktori & Penelusuran',
      icon: <GitBranch className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'report',
      label: 'Quality Audit Report',
      subtext: 'Form F/QC/01.030',
      icon: <FileCheck className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'sync',
      label: 'Data Ingestion',
      subtext: 'Cloud Sync & Upload',
      icon: <CloudDownload className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'pic',
      label: 'Data Explorer',
      subtext: 'Database Records',
      icon: <Database className="w-5 h-5 shrink-0" />,
    },
  ];

  return (
    <aside
      className={`app-sidebar flex-shrink-0 flex flex-col sticky top-0 h-screen select-none z-30 ${
        sidebarOpen
          ? 'w-64 bg-white border-r border-stone-200 shadow-xs'
          : 'w-16 is-collapsed bg-transparent border-r-0 shadow-none'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div
        className={`h-16 flex items-center transition-colors duration-200 ${
          sidebarOpen ? 'justify-between px-4 border-b border-stone-200/80 bg-white' : 'justify-center px-0 bg-transparent'
        }`}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-coffee-800 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                SJA
              </div>
              <div className="whitespace-nowrap overflow-hidden leading-tight">
                <div className="font-extrabold text-xs text-stone-900 tracking-tight">PT. Santos Jaya Abadi</div>
                <div className="text-[10px] text-coffee-700 font-semibold">Traceability Platform</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-stone-400 hover:text-stone-800 p-1.5 rounded-lg hover:bg-stone-100 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="relative group">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="w-10 h-10 rounded-xl bg-transparent hover:bg-stone-200/60 text-stone-600 hover:text-stone-950 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="sidebar-gemini-tooltip">
              <div className="font-bold text-xs text-white">Buka Navigasi</div>
              <div className="text-[10px] text-stone-300 font-normal">PT. Santos Jaya Abadi</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav
        className={`flex-1 py-4 px-2 space-y-2 bg-transparent ${
          sidebarOpen ? 'overflow-y-auto overflow-x-hidden' : 'overflow-visible'
        }`}
      >
        {sidebarOpen && (
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Main Menu
          </div>
        )}

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item ${
                  isActive ? 'active' : ''
                } ${!sidebarOpen ? 'sidebar-item-collapsed' : ''}`}
              >
                {item.icon}
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.label}</div>
                    <div className="text-[10px] text-stone-500 sidebar-subtext font-normal truncate">
                      {item.subtext}
                    </div>
                  </div>
                )}
              </button>

              {!sidebarOpen && (
                <div className="sidebar-gemini-tooltip">
                  <div className="font-bold text-xs text-white">{item.label}</div>
                  <div className="text-[10px] text-stone-300 font-normal">{item.subtext}</div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Status Indicator */}
      <div
        className={`p-3 transition-colors space-y-2.5 ${
          sidebarOpen ? 'border-t border-stone-200/80 bg-stone-50 text-[11px]' : 'border-t-0 bg-transparent text-[11px] overflow-visible'
        }`}
      >
        {sidebarOpen ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-[10.5px]">
              <span>Database:</span>
              <span className={`flex items-center gap-1.5 font-bold ${dbConnected ? 'text-emerald-700' : 'text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full inline-block ${dbConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {dbConnected ? 'Active' : 'Offline'}
              </span>
            </div>
            <div className="text-[9.5px] text-stone-400 font-mono truncate">
              db_traceability_sja @ MySQL
            </div>
          </div>
        ) : (
          <div className="relative group flex justify-center py-1">
            <span
              className={`w-2.5 h-2.5 rounded-full inline-block cursor-pointer shadow-xs transition-transform hover:scale-125 ${
                dbConnected ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-red-500 ring-2 ring-red-500/20'
              }`}
            />
            <div className="sidebar-gemini-tooltip">
              <div className="font-bold text-xs text-white">Database: {dbConnected ? 'Active' : 'Offline'}</div>
              <div className="text-[10px] text-stone-300 font-normal font-mono">db_traceability_sja @ MySQL</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

