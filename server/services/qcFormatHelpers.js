/**
 * Helper functions for QC formatting calculations.
 */

function avg(arr, col, decimals = 2) {
  if (!arr || !arr.length) return '-';
  const nums = arr
    .map((r) => parseFloat(String(r[col]).replace(',', '.')))
    .filter((n) => !isNaN(n) && n > 0);
  if (!nums.length) return '-';
  const a = nums.reduce((s, x) => s + x, 0) / nums.length;
  return a.toFixed(decimals);
}

function getUniquePic(rows) {
  if (!rows || !rows.length) return '-';
  const pics = [...new Set(rows.map((r) => r['TTD'] || r['PIC']).filter((t) => t && t !== 'null' && String(t).trim() !== ''))];
  return pics.length ? pics.join(' , ') : '-';
}

function getUniqueVal(rows, col, sep = ' , ') {
  if (!rows || !rows.length) return '-';
  const vals = [...new Set(rows.map((r) => r[col]).filter((t) => t && t !== 'null' && String(t).trim() !== '' && String(t).trim() !== '0'))];
  return vals.length ? vals.join(sep) : '-';
}

module.exports = { avg, getUniquePic, getUniqueVal };
