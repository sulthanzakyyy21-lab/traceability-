const { QC_TABLE_COLUMNS_MAP_T1 } = require('./qcColumnsT1');
const { QC_TABLE_COLUMNS_MAP_T2 } = require('./qcColumnsT2');

const QC_TABLE_COLUMNS_MAP = {
  ...QC_TABLE_COLUMNS_MAP_T1,
  ...QC_TABLE_COLUMNS_MAP_T2,
};

module.exports = {
  QC_TABLE_COLUMNS_MAP,
  QC_TABLE_COLUMNS_MAP_T1,
  QC_TABLE_COLUMNS_MAP_T2,
};
