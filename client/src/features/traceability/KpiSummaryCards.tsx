import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TraceResult } from '@/types/traceability';

interface Props {
  data: TraceResult | null;
}

export const KpiSummaryCards: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const packing = data.packing;
  const productName = packing?.nama_produk || packing?.product_name || 'KAPAL API SPECIAL MIX';
  const yieldVal = packing?.yield_val ?? packing?.yield ?? '-';
  const rasioVal = packing?.rasio_val ?? packing?.rasio ?? '-';
  const outputKg = packing?.total_output_kg ?? packing?.output_kg ?? '-';
  const outputBox = packing?.total_output_box ?? packing?.output_box ?? '-';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <Card className="border-l-4 border-l-coffee-800">
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">No. Batch FG</p>
          <p className="text-sm font-extrabold font-mono text-coffee-800 mt-0.5 truncate">
            {data.input.noBatchFull}
          </p>
          <Badge variant="outline" className="mt-1 text-[9px] font-mono">Tower {data.input.tower}</Badge>
        </CardContent>
      </Card>

      <Card className="col-span-2 sm:col-span-1">
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Nama Produk</p>
          <p className="text-xs font-bold text-stone-900 mt-0.5 truncate" title={productName}>
            {productName}
          </p>
          <span className="text-[9.5px] text-stone-400">Form F/QC/01.030</span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Total Output (Kg)</p>
          <p className="text-sm font-extrabold font-mono text-stone-900 mt-0.5">
            {outputKg} <span className="text-[10px] font-normal text-stone-500">kg</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Total Output (Box)</p>
          <p className="text-sm font-extrabold font-mono text-stone-900 mt-0.5">
            {outputBox} <span className="text-[10px] font-normal text-stone-500">box</span>
          </p>
        </CardContent>
      </Card>

      <Card className="bg-emerald-50/50 border-emerald-200">
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Yield Recovery</p>
          <p className="text-sm font-extrabold font-mono text-emerald-900 mt-0.5">
            {yieldVal} {yieldVal !== '-' && '%'}
          </p>
          <span className="text-[9px] text-emerald-700">Formula SJA Valid</span>
        </CardContent>
      </Card>

      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="p-3.5">
          <p className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Rasio IC</p>
          <p className="text-sm font-extrabold font-mono text-amber-900 mt-0.5">
            {rasioVal}
          </p>
          <span className="text-[9px] text-amber-700">Standar Mutu QC</span>
        </CardContent>
      </Card>
    </div>
  );
};
