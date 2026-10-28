const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const PROD_KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_PROD
  ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS_PROD)
  : path.resolve(process.cwd(), 'file_penghubung/produksi.json');

let authInstance = null;
let cachedEmail = null;

function getProdAuth() {
  if (!fs.existsSync(PROD_KEY_PATH)) {
    authInstance = null;
    cachedEmail = null;
    throw new Error('Gagal terhubung ke API Google: Kredensial API tidak ditemukan.');
  }
  if (!authInstance) {
    try {
      const raw = JSON.parse(fs.readFileSync(PROD_KEY_PATH, 'utf8'));
      cachedEmail = raw.client_email || 'cheklist-produksi@traceability-512303.iam.gserviceaccount.com';
    } catch {
      cachedEmail = 'cheklist-produksi@traceability-512303.iam.gserviceaccount.com';
    }
    authInstance = new GoogleAuth({
      keyFile: PROD_KEY_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });
  }
  return authInstance;
}

async function getProdAccessToken() {
  const auth = getProdAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function fetchProdSheetBuffer(sheetId) {
  const token = await getProdAccessToken();
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Traceability-SJA-Produksi/1.0',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    const emailInfo = cachedEmail ? ` (${cachedEmail})` : '';
    throw new Error(
      `Gagal mengunduh spreadsheet Produksi [${sheetId}] (HTTP ${res.status}). Pastikan spreadsheet telah dibagikan ke Service Account Produksi${emailInfo}.`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getProdConnectorStatus() {
  const exists = fs.existsSync(PROD_KEY_PATH);
  return {
    keyFile: 'file_penghubung/produksi.json',
    active: exists,
    clientEmail: cachedEmail || (exists ? 'cheklist-produksi@traceability-512303.iam.gserviceaccount.com' : null),
  };
}

module.exports = {
  fetchProdSheetBuffer,
  getProdAccessToken,
  getProdConnectorStatus,
  PROD_KEY_PATH,
};
