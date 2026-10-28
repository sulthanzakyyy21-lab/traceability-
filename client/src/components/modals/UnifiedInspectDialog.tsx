import React, { useState, useEffect, useMemo } from 'react';
import { Table2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CipChecklistTable } from './CipChecklistTable';
import type { InspectModalState } from '@/types/traceability';

interface Props {
  data: InspectModalState | null;
  onClose: () => void;
}

export const UnifiedInspectDialog: React.FC<Props> = ({ data, onClose }) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [cipFilter, setCipFilter] = useState<'all' | 'lt1' | 'lt2' | 'lt3' | 'swab'>('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(timer);
  }, [search]);

  if (!data) return null;

  const filteredCipItems = useMemo(() => {
    if (!data.cipChecklist?.items) return [];
    return data.cipChecklist.items.filter((item) => {
      const matchSearch = !debouncedSearch ||
        item.area.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(debouncedSearch.toLowerCase());
      if (!matchSearch) return false;
      if (cipFilter === 'lt1') return item.lokasi.includes('Lt. 1');
      if (cipFilter === 'lt2') return item.lokasi.includes('Lt. 2');
      if (cipFilter === 'lt3') return !item.lokasi.includes('Lt. 1') && !item.lokasi.includes('Lt. 2');
      if (cipFilter === 'swab') return item.swab_required;
      return true;
    });
  }, [data.cipChecklist, debouncedSearch, cipFilter]);

  const filteredRows = useMemo(() => {
    if (!data.rows) return [];
    if (!debouncedSearch) return data.rows;
    return data.rows.filter((r) =>
      Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [data.rows, debouncedSearch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/45 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl max-w-5xl xl:max-w-6xl w-full max-h-[82vh] flex flex-col overflow-hidden text-slate-800 my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 border-b border-blue-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100/90 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Table2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="blueSolid" className="uppercase font-mono text-[10px]">
                  INSPECT {data.type.toUpperCase()}
                </Badge>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {data.title}
                </h3>
                {data.refForm && <Badge variant="blue" className="font-mono">{data.refForm}</Badge>}
                {data.tableName && <Badge variant="secondary" className="font-mono">MySQL: {data.tableName}</Badge>}
              </div>
              {data.subtitle && <p className="text-[11.5px] text-slate-500 mt-0.5 truncate">{data.subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Cari data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-36 sm:w-56 h-8 text-xs bg-white"
            />
            <Button variant="secondary" size="sm" onClick={onClose} className="gap-1">
              <X className="w-3.5 h-3.5" /> Tutup
            </Button>
          </div>
        </div>

        {/* CIP Contextual Toolbar */}
        {data.type === 'cip' && (
          <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success" className="gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Terverifikasi DB: {data.recordedItems} / {data.totalItems} Titik
              </Badge>
              <Badge variant="warning" className="py-1">
                Belum Tercatat: {(data.totalItems || 0) - (data.recordedItems || 0)} Titik (-)
              </Badge>
              <Badge variant="outline" className="font-mono py-1">
                Sesi Terakhir: {data.latestCipDate}
              </Badge>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
              {(['all', 'lt1', 'lt2', 'lt3', 'swab'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCipFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    cipFilter === f ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'
                  }`}
                >
                  {f === 'all' ? `Semua (${data.totalItems})` : f === 'lt1' ? 'Lt. 1' : f === 'lt2' ? 'Lt. 2' : f === 'lt3' ? 'Lt. 3+' : 'Khusus Swab'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Table Container */}
        <div className="flex-1 overflow-auto bg-slate-100/70 p-3 sm:p-4">
          {data.type === 'cip' ? (
            <CipChecklistTable items={filteredCipItems} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-xs">
              <table className="param-stacked-table mb-0 w-full text-xs">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th className="param-th-no">No</th>
                    {data.columns?.map((col) => (
                      <th key={col} className="param-green-th">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="param-tr">
                      <td className="param-td-no">{rIdx + 1}</td>
                      {data.columns?.map((col) => (
                        <td key={col} className="param-td">{row[col] ?? '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {data.averages && Object.keys(data.averages).length > 0 && (
                  <tfoot>
                    <tr className="bg-blue-50/90 font-bold border-t-2 border-blue-300 text-blue-950">
                      <td className="param-td-no text-center font-extrabold uppercase text-[10px] bg-blue-100/80">Avg</td>
                      {data.columns?.map((col) => (
                        <td key={col} className="param-td font-semibold text-[11px]">
                          {data.averages?.[col] !== undefined ? (
                            <Badge variant="blue" className="font-mono">x̄ = {data.averages[col]}</Badge>
                          ) : '-'}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-mono text-[11px]">Single Source of Truth: MySQL db_traceability_sja</span>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};
