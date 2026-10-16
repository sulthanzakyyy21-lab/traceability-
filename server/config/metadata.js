/**
 * Metadata for auto-detection of tables by PIC, Tower, and Column/Sheet signatures
 */
const TABLE_METADATA = {
  packing_tower_1: {
    key: 'packing_tower_1',
    label: 'Packing Tower 1',
    flow: 'PACKING',
    pic: 'Produksi',
    tower: 'Tower 1',
    sheetKeyword: 't1',
    keywords: ['pin', 'ok (box)', 'hold (box)', 'sapuan', 'dehumidifier', 'bibir karton', 'packing'],
  },
  packing_tower_2: {
    key: 'packing_tower_2',
    label: 'Packing Tower 2',
    flow: 'PACKING',
    pic: 'Produksi',
    tower: 'Tower 2',
    sheetKeyword: 't2',
    keywords: ['pin', 'ok (box)', 'hold (box)', 'over size', 'dehumidifier', 'bibir karton', 'packing'],
  },
  dryer_tower_1: {
    key: 'dryer_tower_1',
    label: 'Dryer Tower 1',
    flow: 'DRYER',
    pic: 'Produksi',
    tower: 'Tower 1',
    sheetKeyword: 't1',
    keywords: ['final tank', 'sfb', 'vf1', 'vf2', 'co2', 'main air', 'nozzle pressure', 'dryer'],
  },
  dryer_tower_2: {
    key: 'dryer_tower_2',
    label: 'Dryer Tower 2',
    flow: 'DRYER',
    pic: 'Produksi',
    tower: 'Tower 2',
    sheetKeyword: 't2',
    keywords: ['final tank', 'hydrolyse', 'sfb', 'chamber', 'feed extract', 'main air', 'dryer'],
  },
  extraction_tower_1: {
    key: 'extraction_tower_1',
    label: 'Extraction Tower 1',
    flow: 'EXTRACTION',
    pic: 'Produksi',
    tower: 'Tower 1',
    sheetKeyword: 't1',
    keywords: ['degassing', 'perculator', 'hydrolysis extract', 'aroma extract', 'destination tank post extraction', 'extraction'],
  },
  extraction_tower_2: {
    key: 'extraction_tower_2',
    label: 'Extraction Tower 2',
    flow: 'EXTRACTION',
    pic: 'Produksi',
    tower: 'Tower 2',
    sheetKeyword: 't2',
    keywords: ['degassing', 'perculator', 'hydrolysis extract', 'aroma extract', 'nomor batch', 'destination tank post extraction', 'extraction'],
  },
  evaporation_tower_1: {
    key: 'evaporation_tower_1',
    label: 'Evaporation Tower 1',
    flow: 'EVAPORATION',
    pic: 'Produksi',
    tower: 'Tower 1',
    sheetKeyword: 't1',
    keywords: ['separated tank', 'pure aroma', 'sedimen', 'destination final tank', 'temp. output evap', 'evaporasi', 'evaporation'],
  },
  evaporation_tower_2: {
    key: 'evaporation_tower_2',
    label: 'Evaporation Tower 2',
    flow: 'EVAPORATION',
    pic: 'Produksi',
    tower: 'Tower 2',
    sheetKeyword: 't2',
    keywords: ['separated tank', 'pure aroma', 'sedimen', 'destination final tank', 'temp, output evap', 'evaporasi', 'evaporation'],
  },
  roasting_probat: {
    key: 'roasting_probat',
    label: 'Roasting Probat',
    flow: 'ROASTING',
    pic: 'Produksi',
    tower: 'Non-Tower',
    sheetKeyword: 'roasti',
    keywords: ['roasting time', 'silocell', 'destoner', 'susut goreng', 'jenis kopi mentah', 'mode goreng', 'roasting'],
  },
};

const { QC_TABLE_METADATA } = require('./qcMetadata');
Object.assign(TABLE_METADATA, QC_TABLE_METADATA);

module.exports = { TABLE_METADATA };

