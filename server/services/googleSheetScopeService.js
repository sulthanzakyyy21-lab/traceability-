const pool = require('../db');
const { PROD_TABLE_MAP, QC_TABLES_BY_TOWER, PA_TABLE_METADATA } = require('../config/sheetConfig');

async function hasEmptyTablesInScope(division, tower) {
  try {
    const activeTower = String(tower).toLowerCase();
    if (division === 'all' || division === 'produksi') {
      for (const [tblKey, config] of Object.entries(PROD_TABLE_MAP)) {
        if (activeTower === '1' && config.tower !== 'Tower 1' && config.tower !== 'Non-Tower') continue;
        if (activeTower === '2' && config.tower !== 'Tower 2' && config.tower !== 'Non-Tower') continue;
        if ((activeTower === 'non-tower' || activeTower === 'nontower') && config.tower !== 'Non-Tower') continue;
        const [r] = await pool.query(`SELECT 1 FROM \`${tblKey}\` LIMIT 1`);
        if (r.length === 0) return true;
      }
    }
    if (division === 'all' || division === 'qc') {
      const towers = (tower === 'all' || tower === 'both') ? ['1', '2'] : [String(tower)];
      for (const t of towers) {
        for (const tbl of (QC_TABLES_BY_TOWER[t] || [])) {
          const [r] = await pool.query(`SELECT 1 FROM \`${tbl}\` LIMIT 1`);
          if (r.length === 0) return true;
        }
      }
    }
    if (division === 'all' || division === 'pa') {
      for (const [tblKey, config] of Object.entries(PA_TABLE_METADATA)) {
        if (activeTower === '1' && config.tower !== 'Tower 1') continue;
        if (activeTower === '2' && config.tower !== 'Tower 2') continue;
        const [r] = await pool.query(`SELECT 1 FROM \`${tblKey}\` LIMIT 1`);
        if (r.length === 0) return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

module.exports = {
  hasEmptyTablesInScope,
};
