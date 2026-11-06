const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const GBB_KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_GBB
  ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS_GBB)
  : path.resolve(process.cwd(), 'file_penghubung/gbb.json');

let authInstance = null;
let cachedEmail = null;

function getGbbAuth() {
  if (!fs.existsSync(GBB_KEY_PATH)) {
    authInstance = null;
    cachedEmail = null;
    throw new Error('Gagal terhubung ke API Google: Kredensial API GBB tidak ditemukan.');
  }
  if (!authInstance) {
    try {
      const raw = JSON.parse(fs.readFileSync(GBB_KEY_PATH, 'utf8'));
      cachedEmail = raw.client_email || 'cheklist-warehouse@traceability-512303.iam.gserviceaccount.com';
    } catch {
      cachedEmail = 'cheklist-warehouse@traceability-512303.iam.gserviceaccount.com';
    }
    authInstance = new GoogleAuth({
      keyFile: GBB_KEY_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });
  }
  return authInstance;
}

async function getGbbAccessToken() {
  const auth = getGbbAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function fetchGbbSheetBuffer(sheetId) {
  const token = await getGbbAccessToken();
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Traceability-SJA-GBB/1.0',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    const emailInfo = cachedEmail ? ` (${cachedEmail})` : '';
    throw new Error(
      `Gagal mengunduh spreadsheet GBB [${sheetId}] (HTTP ${res.status}). Pastikan spreadsheet telah dibagikan ke Service Account GBB${emailInfo}.`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getGbbConnectorStatus() {
  const exists = fs.existsSync(GBB_KEY_PATH);
  return {
    keyFile: 'file_penghubung/gbb.json',
    active: exists,
    clientEmail: cachedEmail || (exists ? 'cheklist-warehouse@traceability-512303.iam.gserviceaccount.com' : null),
  };
}

module.exports = {
  fetchGbbSheetBuffer,
  getGbbAccessToken,
  getGbbConnectorStatus,
  GBB_KEY_PATH,
};

