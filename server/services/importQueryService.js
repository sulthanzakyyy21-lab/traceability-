const pool = require('../db');

async function getTableEquipments(tableName) {
  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );
  const colNames = cols.map(c => c.COLUMN_NAME);
  const eqCol = colNames.find(c => ['peralatan', 'titik uji'].includes(c.toLowerCase()));

  if (!eqCol) {
    return { tableName, hasEquipment: false, equipmentCol: null, equipments: [] };
  }

  const [eqRows] = await pool.query(
    `SELECT DISTINCT \`${eqCol}\` AS eq FROM \`${tableName}\` WHERE \`${eqCol}\` IS NOT NULL AND TRIM(\`${eqCol}\`) != '' ORDER BY \`${eqCol}\` ASC`
  );

  return {
    tableName,
    hasEquipment: true,
    equipmentCol: eqCol,
    equipments: eqRows.map(r => r.eq)
  };
}

async function getTableRows(tableName, queryParams) {
  const { page, limit, search, year, month, date, bean, equipment } = queryParams;
  const offset = (page - 1) * limit;

  const [cols] = await pool.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME != 'id' ORDER BY ORDINAL_POSITION`,
    [tableName]
  );
  const columns = cols.map(c => c.COLUMN_NAME);
  const whereClauses = [];
  const params = [];

  const isRoast = tableName.toLowerCase().startsWith('roasting');
  const isCip = tableName.toLowerCase().includes('_cip_');
  const isEmp = tableName.toLowerCase().includes('_emp_');
  const isAbe = tableName.toLowerCase().includes('_abe_');
  const isFwt = tableName.toLowerCase().includes('_fwt_');

  const eqCol = columns.find(c => ['peralatan', 'titik uji'].includes(c.toLowerCase()));
  const hasEquipmentFilter = Boolean(equipment && equipment.trim() && eqCol);
  if (hasEquipmentFilter) {
    whereClauses.push(`\`${eqCol}\` = ?`);
    params.push(equipment.trim());
  }

  const hasSearch = Boolean(search && search.trim());
  if (hasSearch) {
    const clean = search.trim();
    let searchColKeywords;
    if (isCip) {
      searchColKeywords = ['peralatan', 'waktu', 'keterangan'];
    } else if (isEmp || isAbe) {
      searchColKeywords = ['titik', 'area', 'team', 'jenis', 'noted'];
    } else if (isFwt) {
      searchColKeywords = ['noted'];
    } else if (isRoast) {
      searchColKeywords = ['jenis', 'kopi', 'mentah', 'biji', 'mode', 'nama', 'batch'];
    } else {
      searchColKeywords = ['batch', 'tanggal', 'waktu', 'nama', 'shift', 'team', 'pin', 'mode', 'produk', 'jenis', 'peralatan'];
    }

    const textCols = columns.filter(c => {
      const l = c.toLowerCase();
      return searchColKeywords.some(k => l.includes(k));
    });

    if (textCols.length > 0) {
      whereClauses.push('(' + textCols.map(c => `(\`${c}\` LIKE ? OR REPLACE(\`${c}\`, ' ', '') LIKE ?)`).join(' OR ') + ')');
      textCols.forEach(() => params.push(`%${clean}%`, `%${clean.replace(/\s+/g, '')}%`));
    }
  }

  if (bean && bean.trim()) {
    const beanCol = columns.find(c => c.toLowerCase() === 'jenis kopi mentah') || columns.find(c => c.toLowerCase().includes('jenis') && c.toLowerCase().includes('kopi'));
    if (beanCol) { whereClauses.push(`\`${beanCol}\` LIKE ?`); params.push(`%${bean.trim()}%`); }
  }

  const dateCol = columns.find(c => {
    const l = c.toLowerCase().trim();
    return l === 'tanggal' || l === 'tanggal & waktu' || l.startsWith('tanggal');
  }) || columns.find(c => {
    const l = c.toLowerCase().trim();
    return l === 'date' || l.startsWith('date');
  }) || columns.find(c => c.toLowerCase().includes('tanggal') || c.toLowerCase().includes('date'))
    || columns.find(c => c.toLowerCase().includes('stamp'));
  const stampCol = columns.find(c => c.toLowerCase().trim() === 'stamp' && c !== dateCol);

  const isCipOrPaSearch = (isCip || isEmp || isAbe) && hasSearch;
  const shouldApplyDateCutoff = (hasEquipmentFilter || isCipOrPaSearch) && Boolean(date && date.includes('-'));

  if (dateCol) {
    if (shouldApplyDateCutoff) {
      const cutoff = `${date.trim()} 23:59:59`;
      if (stampCol) {
        whereClauses.push(`(COALESCE(\`${stampCol}\`, \`${dateCol}\`) <= ? OR \`${dateCol}\` <= ?)`);
        params.push(cutoff, cutoff);
      } else {
        whereClauses.push(`\`${dateCol}\` <= ?`);
        params.push(cutoff);
      }
    } else if (date && date.includes('-')) {
      const [y, m, d] = date.split('-');
      whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
      params.push(`%${y}-${m}-${d}%`, `%${d}/${m}/${y}%`, `%${d}-${m}-${y}%`);
    } else {
      const mStr = month ? String(month).padStart(2, '0') : '';
      if (year && mStr) {
        whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
        params.push(`%${year}-${mStr}%`, `%/${mStr}/${year}%`, `%${year}/${mStr}%`);
      } else if (year || mStr) {
        whereClauses.push(`(\`${dateCol}\` LIKE ? OR \`${dateCol}\` LIKE ?)`);
        params.push(year ? `%${year}-%` : `%-${mStr}-%`, year ? `%/${year}%` : `%/${mStr}/%`);
      }
    }
  }

  let orderClause = 'ORDER BY id ASC';
  if (hasEquipmentFilter || isCipOrPaSearch) {
    if (stampCol && dateCol) {
      orderClause = `ORDER BY COALESCE(\`${stampCol}\`, \`${dateCol}\`) DESC, id DESC`;
    } else if (dateCol) {
      orderClause = `ORDER BY \`${dateCol}\` DESC, id DESC`;
    } else {
      orderClause = `ORDER BY id DESC`;
    }
  }

  const where = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
  const [countRows] = await pool.execute(`SELECT COUNT(*) as cnt FROM \`${tableName}\` ${where}`, params);
  const totalRows = countRows[0].cnt;
  const [rows] = await pool.execute(`SELECT * FROM \`${tableName}\` ${where} ${orderClause} LIMIT ${limit} OFFSET ${offset}`, params);

  return { table: tableName, columns, totalRows, page, limit, totalPages: Math.ceil(totalRows / limit) || 1, rows };
}

module.exports = {
  getTableEquipments,
  getTableRows
};

