const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { securityHeaders } = require('./middleware/securityHeaders');
const { migrateUsersTable } = require('./db/migrations/createUsersTable');
const { migrateAuditLogsTable } = require('./db/migrations/createAuditLogsTable');
const { verifyToken, requireRole } = require('./middleware/auth');
const { getRecentAuditLogs } = require('./services/auditLogService');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (process.env[key] === undefined) process.env[key] = val;
    }
  });
}

// Keep server alive on unhandled errors
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err.message, err.stack));
process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Standard Middleware
app.use(securityHeaders);
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/import', require('./routes/import'));
app.use('/api/trace', require('./routes/trace'));
app.use('/api/gsheet', require('./routes/gsheet'));

// Audit Logs Endpoint (Admin only)
app.get('/api/audit-logs', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const logs = await getRecentAuditLogs({ limit: req.query.limit, tableName: req.query.tableName });
    res.json({ success: true, count: logs.length, logs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Auto-migrate tables on start
migrateUsersTable().catch(e => console.error('[AuthMigration] Error:', e.message));
migrateAuditLogsTable().catch(e => console.error('[AuditMigration] Error:', e.message));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`\n🏭 Traceability System - PT. Santos Jaya Abadi`);
  console.log(`📡 Server running at http://localhost:${PORT}`);
  console.log(`📊 Database: db_traceability_sja @ localhost\n`);

  const isAutoSyncEnabled = process.env.AUTO_SYNC_ENABLED === 'true';
  const intervalMinutes = parseInt(process.env.AUTO_SYNC_INTERVAL_MINUTES, 10) || 5;

  if (isAutoSyncEnabled) {
    const { syncUnifiedTables } = require('./services/googleSheetService');
    const AUTO_SYNC_INTERVAL_MS = intervalMinutes * 60 * 1000;

    async function runAutoSync() {
      try {
        console.log('[AutoSync] Memulai sinkronisasi otomatis...', new Date().toISOString());
        const result = await syncUnifiedTables({ division: 'all', tower: 'all', force: false });
        console.log(`[AutoSync] Selesai: ${result.totalImported} baris baru dari ${result.totalTables} tabel dalam ${result.durationSeconds}`);
      } catch (e) {
        console.error('[AutoSync] Error:', e.message);
      }
    }

    setTimeout(runAutoSync, 10000);
    setInterval(runAutoSync, AUTO_SYNC_INTERVAL_MS);
    console.log(`🔄 Auto-sync aktif setiap ${intervalMinutes} menit`);
  } else {
    console.log(`⏸️ Auto-sync otomatis dinonaktifkan (AUTO_SYNC_ENABLED=false). Sinkronisasi dapat dilakukan manual.`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERROR] Port ${PORT} sudah digunakan. Coba port lain atau hentikan proses yang memakai port tersebut.`);
  } else {
    console.error('[ERROR] Server error:', err.message);
  }
  process.exit(1);
});
