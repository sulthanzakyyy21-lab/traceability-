const { QC_TABLE_METADATA_T1 } = require('./qcMetadataT1');
const { QC_TABLE_METADATA_T2 } = require('./qcMetadataT2');

const QC_TABLE_METADATA = {
  ...QC_TABLE_METADATA_T1,
  ...QC_TABLE_METADATA_T2,
};

module.exports = {
  QC_TABLE_METADATA,
  QC_TABLE_METADATA_T1,
  QC_TABLE_METADATA_T2,
};
