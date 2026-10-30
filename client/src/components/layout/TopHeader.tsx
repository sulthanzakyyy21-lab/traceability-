import React from 'react';
import { Search, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Props {
  batchInput: string;
  setBatchInput: (val: string) => void;
  tower: string;
  setTower: (val: string) => void;
  onSearch: () => void;
  loading: boolean;
  dbConnected: boolean;
}

export const TopHeader: React.FC<Props> = ({
  batchInput,
  setBatchInput,
  tower,
  setTower,
  onSearch,
  loading,
  dbConnected,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <header className="bg-white border-b border-stone-200/90 shadow-2xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coffee-800 text-white font-black flex items-center justify-center text-xs tracking-wider shadow-xs">
            SJA
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-stone-900 tracking-tight leading-tight">
              PT. Santos Jaya Abadi
            </h1>
            <p className="text-[10.5px] font-bold text-coffee-800 uppercase tracking-widest">
              Sistem Traceability & Penelusuran Mutu
            </p>
          </div>
        </div>

        {/* Search controls */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
          {/* Tower Selector */}
          <div className="inline-flex rounded-xl bg-stone-100 p-0.5 border border-stone-200 text-xs">
            <button
              type="button"
              onClick={() => setTower('1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                tower === '1' ? 'bg-coffee-800 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tower 1
            </button>
            <button
              type="button"
              onClick={() => setTower('2')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                tower === '2' ? 'bg-coffee-800 text-white shadow-2xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tower 2
            </button>
          </div>

          {/* Batch Input */}
          <div className="relative w-40 sm:w-56">
            <Input
              type="text"
              placeholder="Contoh: A370/26"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              className="pl-8 font-mono font-bold uppercase text-xs"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <Button type="submit" disabled={loading} size="sm" className="gap-1.5">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Cari Batch</span>
          </Button>

          {/* DB Indicator */}
          <Badge variant={dbConnected ? 'success' : 'destructive'} className="gap-1 py-1 font-mono text-[10px]">
            <Database className="w-3 h-3" />
            <span>{dbConnected ? 'DB Terhubung' : 'DB Terputus'}</span>
          </Badge>
        </form>
      </div>
    </header>
  );
};

