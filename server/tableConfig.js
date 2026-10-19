const { TABLE_COLUMNS_MAP: PROD_COLUMNS } = require('./config/columns');
const { QC_TABLE_COLUMNS_MAP } = require('./config/qcColumns');
const { TABLE_METADATA: PROD_METADATA } = require('./config/metadata');
const { QC_TABLE_METADATA } = require('./config/qcMetadata');

const TABLE_COLUMNS_MAP = {
  ...PROD_COLUMNS,
  ...QC_TABLE_COLUMNS_MAP,
};

const TABLE_METADATA = {
  ...PROD_METADATA,
  ...QC_TABLE_METADATA,
};

const ALLOWED_TABLES = Object.keys(TABLE_COLUMNS_MAP);

module.exports = {
  TABLE_COLUMNS_MAP,
  ALLOWED_TABLES,
  TABLE_METADATA,
};

