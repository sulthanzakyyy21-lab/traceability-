import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { CipItem } from '@/types/traceability';

interface Props {
  items: CipItem[];
}

export const CipChecklistTable: React.FC<Props> = ({ items }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-xs">
      <table className="w-full min-w-[980px] text-left text-xs border-collapse">
        <thead className="sticky top-0 bg-blue-700 text-white z-10 text-[11px] font-bold uppercase tracking-wider">
          <tr>
            <th className="py-2.5 px-3 w-12 text-center border-r border-blue-600">No.</th>
            <th className="py-2.5 px-3 min-w-[240px] border-r border-blue-600">Instrument / Area</th>
            <th className="py-2.5 px-3 w-20 text-center border-r border-blue-600">Lokasi</th>
            <th className="py-2.5 px-3 w-24 text-center border-r border-blue-600">Swab Test</th>
            <th className="py-2.5 px-3 min-w-[150px] text-center border-r border-blue-600">Waktu CIP Terakhir</th>
            <th className="py-2.5 px-3 w-20 text-right border-r border-blue-600">pH Lab</th>
            <th className="py-2.5 px-3 w-24 text-right border-r border-blue-600">Conductivity</th>
            <th className="py-2.5 px-3 w-28 text-center border-r border-blue-600">Hasil Swab</th>
            <th className="py-2.5 px-3 w-28 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.no} className="hover:bg-blue-50/50 transition-colors">
              <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200">{item.no}</td>
              <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-200">{item.area}</td>
              <td className="py-2 px-3 text-center font-mono text-[11px] border-r border-slate-200">{item.lokasi}</td>
              <td className="py-2 px-3 text-center font-bold border-r border-slate-200">{item.swab_label}</td>
              <td className="py-2 px-3 text-center font-mono text-[11px] text-slate-700 border-r border-slate-200">{item.waktu_cip || '-'}</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">{item.ph || '-'}</td>
              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 border-r border-slate-200">{item.conductivity || '-'}</td>
              <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800 border-r border-slate-200">{item.swab_result ?? '-'}</td>
              <td className="py-2 px-3 text-center">
                <Badge variant={item.status === 'SESUAI' ? 'success' : 'warning'}>{item.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

