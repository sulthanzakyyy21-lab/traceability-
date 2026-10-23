const express = require('express');
const cors = require('cors');
const path = require('path');

// Keep server alive on unhandled errors
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/import', require('./routes/import'));
app.use('/api/trace', require('./routes/trace'));
app.use('/api/gsheet', require('./routes/gsheet'));

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



  // ──────────────────────────────────────────────────────────
  // AUTO-SYNC: Sinkronisasi otomatis dari Google Sheets setiap 5 menit
  // Ini memastikan data selalu real-time tanpa perlu tombol sync manual
  // ──────────────────────────────────────────────────────────
  const { syncUnifiedTables } = require('./services/googleSheetService');
  const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

  async function runAutoSync() {
    try {
      console.log('[AutoSync] Memulai sinkronisasi otomatis...', new Date().toISOString());
      const result = await syncUnifiedTables({ division: 'all', tower: 'all', force: false });
      const { totalImported, totalTables, durationSeconds } = result;
      console.log(`[AutoSync] Selesai: ${totalImported} baris baru dari ${totalTables} tabel dalam ${durationSeconds}`);
    } catch (e) {
      console.error('[AutoSync] Error:', e.message);
    }
  }

  // Jalankan sekali saat startup (delay 10 detik agar server stabil dulu)
  setTimeout(runAutoSync, 10000);
  // Lalu interval setiap 5 menit
  setInterval(runAutoSync, AUTO_SYNC_INTERVAL_MS);
  console.log(`🔄 Auto-sync aktif setiap ${AUTO_SYNC_INTERVAL_MS / 60000} menit`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[ERROR] Port ${PORT} sudah digunakan. Coba port lain atau hentikan proses yang memakai port tersebut.`);
  } else {
    console.error('[ERROR] Server error:', err.message);
  }
  process.exit(1);
});
