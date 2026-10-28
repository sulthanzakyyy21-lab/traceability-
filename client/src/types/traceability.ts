export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'produksi' | 'qc' | 'viewer';
  nama?: string;
}

export interface CipItem {
  no: number;
  area: string;
  lokasi: string;
  swab_label: string;
  swab_required: boolean;
  status_db: boolean;
  waktu_cip: string;
  ph: string | number;
  conductivity: string | number;
  swab_result: string | number;
  status: 'SESUAI' | 'BELUM TERCATAT';
}

export interface CipChecklistData {
  flowKey: string;
  title: string;
  tableName: string;
  refForm: string;
  latestCipDate: string;
  totalItems: number;
  recordedItems: number;
  items: CipItem[];
}

export interface InspectModalState {
  type: 'cip' | 'table';
  title: string;
  subtitle?: string;
  refForm?: string;
  tableName?: string;
  cipChecklist?: CipChecklistData;
  columns?: string[];
  rows?: Record<string, any>[];
  averages?: Record<string, any>;
  totalItems?: number;
  recordedItems?: number;
  latestCipDate?: string;
}

export interface TraceResult {
  input: {
    noBatchFull: string;
    tower: string;
    batch: string | number;
    tahun: string | number;
  };
  packing?: any;
  dryer?: any;
  evaporation?: any;
  extraction?: {
    siloNumbers?: string[];
    extractionStartStr?: string;
    cipChecklist?: CipChecklistData;
    [key: string]: any;
  };
  roasting?: any;
  upbm?: any;
  mass_balance?: any;
  qc?: any;
  pa?: {
    extraction_cip_checklist?: CipChecklistData;
    [key: string]: any;
  };
}

