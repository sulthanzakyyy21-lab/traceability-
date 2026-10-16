/**
 * Helper utilities for Traceability batch parsing, formatting, and tank extraction.
 */

function parseBatch(noBatchFull) {
  if (!noBatchFull) return { batch: null, tahun: null };
  const str = String(noBatchFull).trim();
  const batchMatch = str.replace(/[^0-9\/]/g, '');
  const parts = batchMatch.split('/');
  const batch = parts[0] ? parseInt(parts[0], 10) : null;
  let tahun = null;
  if (parts[1]) {
    const yr = parseInt(parts[1], 10);
    tahun = yr < 100 ? 2000 + yr : yr;
  }
  return { batch, tahun };
}

function formatDateDisplay(val) {
  if (!val) return '';
  let d = new Date(val);
  if (isNaN(d.getTime())) {
    const m = String(val).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
    return String(val).trim();
  }
  d = new Date(d.getTime() + 30000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function extractTime(val) {
  if (!val) return '';
  const s = String(val).trim();
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return '';
}

function formatDT(dateVal, timeVal) {
  const d = formatDateDisplay(dateVal);
  const t = extractTime(timeVal);
  if (d && t) return `${d} ${t}`;
  return d || t || '-';
}

function parseSiloNums(arr) {
  const nums = new Set();
  arr.forEach((v) => {
    if (!v) return;
    String(v)
      .split(/[+,\s&]+/)
      .forEach((part) => {
        const n = parseInt(part.trim(), 10);
        if (!isNaN(n)) nums.add(n);
      });
  });
  return [...nums].sort((a, b) => a - b);
}

function extractTankNo(val) {
  if (!val) return '-';
  const m = String(val).match(/\d+/g);
  if (!m) return val;
  let num = parseInt(m[m.length - 1], 10);
  if (isNaN(num)) return val;
  if (num >= 100 && num % 100 === 0) num = num / 100;
  return String(num);
}

function uniqueJoin(arr, sep = ' & ') {
  const seen = new Set();
  const result = [];
  arr.forEach((v) => {
    if (!v) return;
    const s = String(v).trim();
    if (!s || s === 'null' || s === 'undefined' || s === '-') return;
    const sLower = s.toLowerCase();
    if (!seen.has(sLower)) {
      seen.add(sLower);
      const cap = s
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      result.push(cap);
    }
  });
  return result.join(sep);
}

module.exports = {
  parseBatch,
  formatDateDisplay,
  extractTime,
  formatDT,
  parseSiloNums,
  extractTankNo,
  uniqueJoin,
};
