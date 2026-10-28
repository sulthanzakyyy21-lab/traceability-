import flowSectionsData from './flowSections.json';

export interface FlowItem {
  label: string;
  isHeader: boolean;
  key: string;
}

export interface FlowBlock {
  pic: string;
  docs: string[];
  items: FlowItem[];
}

export interface FlowSection {
  name: string;
  totalRows: number;
  blocks: FlowBlock[];
}

export const FLOW_SECTIONS = flowSectionsData as FlowSection[];

