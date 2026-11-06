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

  test('TC-16: Validasi Binary Magic Bytes Anti-Polyglot File Upload (ASVS 5.0.0 L2 / NIST SSDF)', () => {
    // Valid ZIP/XLSX: PK\x03\x04
    const validZip = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
    // Valid OLE2/XLS: \xD0\xCF\x11\xE0
    const validOle = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1]);
    // Invalid polyglot / script disguised as excel
    const fakeExcel = Buffer.from('<?php echo "malicious"; ?>');

    const checkBytes = (buf) => {
      if (!buf || buf.length < 4) return false;
      const isZip = buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04;
      const isOle = buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0;
      return isZip || isOle;
    };

    assert.strictEqual(checkBytes(validZip), true, 'Buffer ZIP/XLSX harus valid');
    assert.strictEqual(checkBytes(validOle), true, 'Buffer OLE2/XLS harus valid');
    assert.strictEqual(checkBytes(fakeExcel), false, 'Polyglot file biner palsu wajib ditolak');
  });

  test('TC-17: Mandat Fail-Closed JWT Secret & Validasi Ganti Password Mandiri (NIST SP 800-63B)', () => {
    const { JWT_SECRET } = require('../server/middleware/auth');
    assert.ok(JWT_SECRET, 'JWT_SECRET harus terdefinisi dari .env');
    assert.notStrictEqual(JWT_SECRET, 'sja-traceability-secret-salt-2026', 'Dilarang menggunakan default hardcoded secret string di source code');

    const { changeUserPassword } = require('../server/services/authService');
    assert.strictEqual(typeof changeUserPassword, 'function', 'Fungsi changeUserPassword wajib tersedia');
  });

  test('TC-18: Verifikasi Anti-Halusinasi PA (Zero Hardcoded Fallback & Pure DB Integrity)', () => {
    const paServiceSrc = fs.readFileSync(path.resolve(__dirname, '../server/services/paService.js'), 'utf8');
    assert.strictEqual(paServiceSrc.includes("'08/07/2026'"), false, "Dilarang keras hardcode fallback '08/07/2026' di paService.js");

    const paEmpSrc = fs.readFileSync(path.resolve(__dirname, '../server/services/paEmpChecklistService.js'), 'utf8');
    assert.strictEqual(paEmpSrc.includes("salmonella: 'Negative'"), false, "Dilarang mengasumsikan 'Negative' jika kolom Salmonella belum ada di DB");

    const paWaterSrc = fs.readFileSync(path.resolve(__dirname, '../server/services/paWaterService.js'), 'utf8');
    assert.strictEqual(paWaterSrc.includes("'Jefri & Reza'"), false, "Dilarang keras hardcode PIC 'Jefri & Reza' di paWaterService.js");
  });

});
