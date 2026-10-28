import React from 'react';
import { Eye, CheckCircle2, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FlowSection } from '@/constants/flowSections';
import type { CipChecklistData, InspectModalState } from '@/types/traceability';

interface Props {
  section: FlowSection;
  index: number;
  traceResult: any;
  cipChecklist?: CipChecklistData;
  onOpenInspect: (modal: InspectModalState) => void;
}

export const ProcessSectionCard: React.FC<Props> = ({
  section,
  index,
  traceResult,
  cipChecklist,
  onOpenInspect,
}) => {
  const isExtraction = section.name === 'EKSTRAKSI';

  const getItemValue = (key: string): string => {
    if (!traceResult) return '-';
    // Deep search in traceResult across domains
    const domains = ['packing', 'dryer', 'evaporation', 'extraction', 'roasting', 'upbm', 'qc', 'pa'];
    for (const d of domains) {
      if (traceResult[d] && traceResult[d][key] !== undefined && traceResult[d][key] !== null) {
        return String(traceResult[d][key]);
      }
    }
    return '-';
  };

  const handleInspectCip = () => {
    if (!cipChecklist) return;
    onOpenInspect({
      type: 'cip',
      title: 'CHECKLIST CIP & FLUSHING AREA EXTRACTION (PLANT 1)',
      subtitle: 'Pengambilan data waktu CIP terakhir untuk setiap titik instrument/area ekstraksi.',
      refForm: cipChecklist.refForm || 'QF/PDQC/SS/010',
      tableName: cipChecklist.tableName || 'pa_cip_t1',
      cipChecklist,
      totalItems: cipChecklist.totalItems,
      recordedItems: cipChecklist.recordedItems,
      latestCipDate: cipChecklist.latestCipDate,
    });
  };

  return (
    <Card className="overflow-hidden border border-stone-200/90 shadow-2xs">
      <CardHeader className="bg-stone-50/70 border-b border-stone-200/80 p-3.5 sm:p-4 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-coffee-800 text-white text-[11px] font-black flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <CardTitle className="text-xs sm:text-sm font-extrabold text-stone-900 tracking-tight truncate">
            {section.name}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex font-mono">
            {section.totalRows} Parameter
          </Badge>
        </div>

        {/* Action Trigger Buttons for Inspect Pop-up Modals */}
        <div className="flex items-center gap-2 shrink-0">
          {isExtraction && cipChecklist && (
            <Button
              type="button"
              variant="blueOutline"
              size="sm"
              onClick={handleInspectCip}
              className="gap-1.5 h-7 text-[11px]"
              title="Buka checklist sanitasi CIP di pop-up modal"
            >
              <Eye className="w-3.5 h-3.5 text-blue-700" />
              <span>Inspect Checklist CIP</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.2 rounded border border-blue-200 font-bold text-blue-800">
                {cipChecklist.recordedItems} / {cipChecklist.totalItems} Titik
              </span>
              <Badge variant="blueSolid" className="text-[9px] px-1 py-0 h-4">Pop-up</Badge>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-4">
        {section.blocks.map((block, bIdx) => (
          <div key={bIdx} className="space-y-2 mb-4 last:mb-0">
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
              <span className="text-[11px] font-bold text-coffee-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                PIC: {block.pic}
              </span>
              {block.docs?.[0] && (
                <span className="text-[10.5px] font-mono text-stone-400 flex items-center gap-1 truncate max-w-[280px]">
                  <FileText className="w-3 h-3 text-stone-400 shrink-0" />
                  {block.docs[0]}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {block.items.map((item, iIdx) => {
                const val = getItemValue(item.key);
                return (
                  <div
                    key={iIdx}
                    className="p-2.5 rounded-xl border border-stone-200/70 bg-stone-50/40 flex flex-col justify-between"
                  >
                    <span className="text-[10.5px] font-medium text-stone-500 leading-snug">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold mt-1 ${
                        val !== '-' ? 'text-stone-900' : 'text-stone-300'
                      }`}
                    >
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
