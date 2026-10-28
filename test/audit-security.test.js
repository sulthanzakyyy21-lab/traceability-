const { test, describe, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const { validatePasswordPolicy, COMMON_BLOCKLIST } = require('../server/utils/passwordPolicy');
const { loginRateLimiter, recordLoginFailure, resetLoginFailure, MAX_ATTEMPTS } = require('../server/middleware/loginRateLimiter');
const { securityHeaders } = require('../server/middleware/securityHeaders');
const { recordAuditLog, getRecentAuditLogs } = require('../server/services/auditLogService');

describe('SJA-PRAS v1.0 Security, Audit & DR Controls', () => {

  after(async () => {
    try {
      const pool = require('../server/db');
      await pool.end();
    } catch {}
  });

  test('TC-11: Kebijakan Password NIST SP 800-63B-4 (>=15 Karakter & Blocklist)', () => {
    const shortPass = validatePasswordPolicy('Abc12345678');
    assert.strictEqual(shortPass.valid, false);
    assert.ok(shortPass.error.includes('15 karakter'));

    for (const blocked of COMMON_BLOCKLIST.slice(0, 3)) {
      const blockedRes = validatePasswordPolicy(blocked);
      assert.strictEqual(blockedRes.valid, false);
      assert.ok(blockedRes.error.includes('terlalu umum') || blockedRes.error.includes('15 karakter'));
    }

    const validPass = validatePasswordPolicy('KopiSantosJayaAbadi2026!ProdStrongKey');
    assert.strictEqual(validPass.valid, true);
    assert.strictEqual(validPass.error, null);
  });

  test('TC-12: Proteksi Brute-Force Login Rate Limiting (Sliding Window)', () => {
    const mockReq = {
      headers: { 'x-forwarded-for': '192.168.100.42' },
      socket: { remoteAddress: '192.168.100.42' },
    };

    resetLoginFailure(mockReq);

    let nextCalled = false;
    let statusCode = null;
    const mockRes = {
      status: (c) => { statusCode = c; return { json: () => {} }; },
    };

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      nextCalled = false;
      loginRateLimiter(mockReq, mockRes, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true, `Attempt ${i + 1} harus diizinkan masuk`);
      recordLoginFailure(mockReq);
    }

    nextCalled = false;
    loginRateLimiter(mockReq, mockRes, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, false, 'Percobaan melebihi batas harus diblokir');
    assert.strictEqual(statusCode, 429, 'Status response harus HTTP 429 Too Many Requests');

    resetLoginFailure(mockReq);
    nextCalled = false;
    loginRateLimiter(mockReq, mockRes, () => { nextCalled = true; });
    assert.strictEqual(nextCalled, true, 'Setelah reset, request harus kembali diizinkan');
  });

  test('TC-13: HTTP Security Headers Middleware (OWASP ASVS & NIST SSDF)', () => {
    const headers = {};
    const mockReq = {};
    const mockRes = {
      setHeader: (k, v) => { headers[k] = v; },
      removeHeader: (k) => { delete headers[k]; },
    };

    headers['X-Powered-By'] = 'Express';
    let nextCalled = false;
    securityHeaders(mockReq, mockRes, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(headers['X-Content-Type-Options'], 'nosniff');
    assert.strictEqual(headers['X-Frame-Options'], 'SAMEORIGIN');
    assert.ok(headers['Strict-Transport-Security'].includes('max-age=31536000'));
    assert.ok(headers['Content-Security-Policy'].includes("default-src 'self'"));
    assert.strictEqual(headers['X-Powered-By'], undefined, 'Header X-Powered-By harus dihapus');
  });

  test('TC-14: Audit Trail Non-Repudiation (Pencatatan Mutasi Data Transaksi)', async () => {
    const logResult = await recordAuditLog({
      userId: 1,
      username: 'admin',
      role: 'admin',
      action: 'UPDATE',
      tableName: 'roasting_probat',
      recordId: '999',
      beforeData: { yield: '85.20' },
      afterData: { yield: '87.37' },
      ipAddress: '127.0.0.1',
      reason: 'Koreksi kalibrasi batch A370/26',
    });

    assert.strictEqual(logResult.success, true, 'Audit log harus berhasil disimpan');
    assert.ok(logResult.id > 0, 'Audit log ID harus terbuat');

    const logs = await getRecentAuditLogs({ limit: 5, tableName: 'roasting_probat' });
    assert.ok(Array.isArray(logs));
    assert.ok(logs.length > 0);
    const target = logs.find(l => l.record_id === '999');
    assert.ok(target, 'Log koreksi batch harus ditemukan dalam riwayat');
    assert.strictEqual(target.action, 'UPDATE');
    assert.strictEqual(target.reason, 'Koreksi kalibrasi batch A370/26');
  });

  test('TC-15: Bukti Drill Pemulihan Bencana (NIST SP 800-34 Actual Restore Evidence)', () => {
    const evidencePath = path.resolve(__dirname, '../docs/audit/LATEST_RESTORE_DRILL_EVIDENCE.json');
    assert.ok(fs.existsSync(evidencePath), 'File evidence restore drill harus tersedia');

    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    assert.strictEqual(evidence.drillStatus, 'VERIFIED_SUCCESSFUL', 'Status drill harus VERIFIED_SUCCESSFUL');
    assert.ok(evidence.sha256 && evidence.sha256.length === 64, 'Checksum SHA-256 backup harus valid');
    assert.ok(evidence.reconciledTables >= 9, 'Tabel yang direkonsiliasi harus mencakup tabel produksi');
    assert.ok(evidence.drillExecutionTime, 'Waktu eksekusi drill harus tercatat');
  });

});
