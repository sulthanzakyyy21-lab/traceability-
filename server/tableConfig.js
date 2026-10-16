const { TABLE_COLUMNS_MAP } = require('./config/columns');
const { TABLE_METADATA } = require('./config/metadata');

const ALLOWED_TABLES = Object.keys(TABLE_COLUMNS_MAP);

module.exports = {
  TABLE_COLUMNS_MAP,
  ALLOWED_TABLES,
  TABLE_METADATA,
};
