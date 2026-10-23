const { getProdAccessToken } = require('./prodGoogleAuthService');
const { getQcAccessToken } = require('./qcGoogleAuthService');

async function getSpreadsheetFingerprint(sheetId, isQc = false) {
  try {
    const token = isQc ? await getQcAccessToken() : await getProdAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties(title,gridProperties(rowCount,columnCount))`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.sheets || [])
      .map(s => `${s.properties.title}:${s.properties.gridProperties?.rowCount || 0}`)
      .join('|');
  } catch {
    return null;
  }
}

module.exports = {
  getSpreadsheetFingerprint,
};
