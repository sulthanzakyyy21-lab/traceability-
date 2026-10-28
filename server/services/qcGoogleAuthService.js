const { GoogleAuth } = require('google-auth-library');
const path = require('path');
const fs = require('fs');

const QC_KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS_QC
  ? path.resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS_QC)
  : path.resolve(process.cwd(), 'file_penghubung/qc.json');

let authInstance = null;
let cachedEmail = null;

function getQcAuth() {
  if (!fs.existsSync(QC_KEY_PATH)) {
    authInstance = null;
    cachedEmail = null;
    throw new Error('Gagal terhubung ke API Google: Kredensial API tidak ditemukan.');
  }
  if (!authInstance) {
    try {
      const raw = JSON.parse(fs.readFileSync(QC_KEY_PATH, 'utf8'));
      cachedEmail = raw.client_email || 'checklist-qc@traceability-512303.iam.gserviceaccount.com';
    } catch {
      cachedEmail = 'checklist-qc@traceability-512303.iam.gserviceaccount.com';
    }
    authInstance = new GoogleAuth({
      keyFile: QC_KEY_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
      ],
    });
  }
  return authInstance;
}

async function getQcAccessToken() {
  const auth = getQcAuth();
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token;
}

async function fetchQcSheetBuffer(sheetId) {
  const token = await getQcAccessToken();
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'Traceability-SJA-QC/1.0',
    },
    redirect: 'follow',
  });

  if (!res.ok) {
    const emailInfo = cachedEmail ? ` (${cachedEmail})` : '';
    throw new Error(
      `Gagal mengunduh spreadsheet QC [${sheetId}] (HTTP ${res.status}). Pastikan file spreadsheet telah dibagikan ke Service Account QC${emailInfo}.`
    );
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function getQcConnectorStatus() {
  const exists = fs.existsSync(QC_KEY_PATH);
  return {
    keyFile: 'file_penghubung/qc.json',
    active: exists,
    clientEmail: cachedEmail || (exists ? 'checklist-qc@traceability-512303.iam.gserviceaccount.com' : null),
  };
}

module.exports = {
  fetchQcSheetBuffer,
  getQcAccessToken,
  getQcConnectorStatus,
  QC_KEY_PATH,
};
