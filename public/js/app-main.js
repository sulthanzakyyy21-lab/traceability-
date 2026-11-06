const { createApp, ref, reactive, computed, onMounted, watch, nextTick } = Vue;

createApp({
  setup() {
    // ── Authentication & Role-Based Access Control (RBAC) ──
    const authRole = computed(() => (window.sjaAuth && window.sjaAuth.currentRole.value) || 'viewer');
    const authUser = computed(() => (window.sjaAuth && window.sjaAuth.state.user) || { full_name: 'Tamu / Auditor', role: 'viewer' });
    const authIsLoggedIn = computed(() => (window.sjaAuth && window.sjaAuth.isAuthenticated.value) || false);
    const isAdmin = computed(() => authRole.value === 'admin');
    const isProduksi = computed(() => authRole.value === 'produksi');
    const isPa = computed(() => authRole.value === 'pa');
    const isQc = computed(() => authRole.value === 'qc');
    const isViewer = computed(() => authRole.value === 'viewer');

    // ── High-Performance Interactive Tactile Tools ──
    const copiedToast = ref('');
    function copyToClipboard(text, label) {
      if (!text) return;
      navigator.clipboard.writeText(String(text)).then(() => {
        copiedToast.value = label ? `${label}: ${text}` : String(text);
        setTimeout(() => { copiedToast.value = ''; }, 1800);
      }).catch(() => {});
    }

    const portalRevealed = ref(false);
    const loginModalOpen = ref(false);
    const loginForm = reactive({
      username: '',
      password: '',
    });
    const loginLoading = ref(false);
    const loginError = ref('');
    const loginState = ref('idle'); // 'idle' | 'loading' | 'success'
    const showPassword = ref(false);
    const showModalPassword = ref(false);
    const usernameInputRef = ref(null);
    const modalUsernameRef = ref(null);
    const rememberMe = ref(false);
    const showDemoTraceModal = ref(false);

    function toggleDemoTraceModal() {
      showDemoTraceModal.value = !showDemoTraceModal.value;
    }

    function handleForgotPassword() {
      const u = String(loginForm.username || '').trim();
      if (u) {
        copiedToast.value = `Permintaan reset password user '${u}' telah diteruskan ke Admin IT.`;
        setTimeout(() => { copiedToast.value = ''; }, 3500);
      } else {
        copiedToast.value = 'Silakan isi username akun Anda pada kolom terlebih dahulu.';
        if (usernameInputRef.value) usernameInputRef.value.focus();
        setTimeout(() => { copiedToast.value = ''; }, 3000);
      }
    }

    function openLoginModal() {
      loginError.value = '';
      loginState.value = 'idle';
      loginModalOpen.value = true;
      nextTick(() => {
        if (modalUsernameRef.value) {
          modalUsernameRef.value.focus();
        }
      });
    }

    function fillQuickAccount(username, password) {
      loginForm.username = username;
      loginForm.password = password;
      loginError.value = '';
    }

    async function submitLogin() {
      if (loginState.value !== 'idle') return;
      loginLoading.value = true;
      loginState.value = 'loading';
      loginError.value = '';
      try {
        if (!window.sjaAuth) {
          throw new Error('Modul autentikasi belum siap.');
        }
        const res = await window.sjaAuth.login(loginForm.username, loginForm.password, true);
        if (!res.success) {
          loginError.value = res.error || 'Username atau kata sandi tidak valid.';
          loginState.value = 'idle';
        } else {
          try {
            if (rememberMe.value) {
              localStorage.setItem('sja_saved_username', loginForm.username);
            } else {
              localStorage.removeItem('sja_saved_username');
            }
          } catch {}
          loginState.value = 'success';
          // Tampilkan animasi tombol sukses sejenak sebelum beralih ke dashboard
          await new Promise((r) => setTimeout(r, 650));
          if (typeof res.commit === 'function') res.commit();
          loginModalOpen.value = false;
          loginState.value = 'idle';
        }
      } catch (err) {
        loginError.value = err.message || 'Terjadi kesalahan sistem.';
        loginState.value = 'idle';
      } finally {
        loginLoading.value = false;
      }
    }

    function logoutAuth() {
      if (window.sjaAuth) {
        window.sjaAuth.logout();
      }
    }

    async function enterAsGuest() {
      loginLoading.value = true;
      loginError.value = '';
      try {
        if (!window.sjaAuth) {
          throw new Error('Modul autentikasi belum siap.');
        }
        const res = await window.sjaAuth.loginAsGuest();
        if (!res.success) {
          loginError.value = res.error || 'Gagal masuk sebagai tamu.';
        } else {
          loginModalOpen.value = false;
        }
      } catch (err) {
        loginError.value = err.message || 'Terjadi kesalahan sistem.';
      } finally {
        loginLoading.value = false;
      }
    }

    const sidebarOpen = ref(true);
    const isScrolledPastHeader = ref(typeof window !== 'undefined' ? (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0) >= 56 : false);
    function handleScrollHeader() {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      isScrolledPastHeader.value = scrollY >= 56;
      // Sticky topbar shadow on scroll
      const topbar = document.getElementById('app-topbar');
      if (topbar) {
        if (scrollY > 10) {
          topbar.classList.add('is-scrolled');
        } else {
          topbar.classList.remove('is-scrolled');
        }
      }
    }
    const validTabs = ['dashboard', 'pipeline', 'report', 'sync', 'pic'];
    function getInitialTab() {
      try {
        const hash = window.location.hash.replace('#', '').toLowerCase();
        if (hash === 'data-explorer' || hash === 'explorer') return 'pic';
        if (validTabs.includes(hash)) return hash;
        const saved = localStorage.getItem('traceability_active_tab');
        if (saved && validTabs.includes(saved)) return saved;
      } catch {}
      return 'dashboard';
    }
    const activeTab = ref(getInitialTab());

    // ── Ultra-Smooth 120 FPS Hardware-Accelerated Sliding Pill Indicator ──
    function updateSlidingPill() {
      nextTick(() => {
        const nav = document.getElementById('sidebar-nav-container');
        const pill = document.getElementById('sidebar-active-pill');
        if (!nav || !pill) return;
        const targetGroup = nav.querySelector(`[data-tab="${activeTab.value}"]`);
        if (!targetGroup) return;
        const targetBtn = targetGroup.querySelector('.sidebar-item');
        if (!targetBtn) return;

        const navRect = nav.getBoundingClientRect();
        const btnRect = targetBtn.getBoundingClientRect();
        if (btnRect.width === 0 || btnRect.height === 0) return;

        const offsetX = Math.round(btnRect.left - navRect.left + nav.scrollLeft);
        const offsetY = Math.round(btnRect.top - navRect.top + nav.scrollTop);

        pill.style.width = `${Math.round(btnRect.width)}px`;
        pill.style.height = `${Math.round(btnRect.height)}px`;
        pill.style.left = '0';
        pill.style.right = 'auto';
        pill.style.marginLeft = '0';
        pill.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        pill.style.opacity = '1';
      });
    }
    const tracing = ref(false);
    const traceError = ref('');
    const traceResult = ref(null);
    const dbConnected = ref(true);

    // ── Industrial Operations Clock & Shift Indicator ──
    const currentTimeStr = ref('');
    const currentDateStr = ref('');
    const currentShift = computed(() => {
      const now = new Date();
      const h = now.getHours();
      if (h >= 7 && h < 15) {
        return {
          name: 'Shift 1',
          timeRange: '07:00 - 15:00',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
        };
      } else if (h >= 15 && h < 23) {
        return {
          name: 'Shift 2',
          timeRange: '15:00 - 23:00',
          badgeClass: 'bg-cyan-600 text-white border-cyan-700/60'
        };
      } else {
        return {
          name: 'Shift 3',
          timeRange: '23:00 - 07:00',
          badgeClass: 'bg-stone-800 text-stone-200 border-stone-600'
        };
      }
    });

    function updateClock() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      currentTimeStr.value = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;

      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      currentDateStr.value = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    }

    // ── Clean Data Ingestion State & Stepper Workflow ──
    const ingestionTab = ref('file'); // 'file' | 'sheet' | 'manual'
    const ingestionStep = ref(1); // 1: Pilih Sumber, 2: Periksa Data, 3: Kirim Selesai
    const ingestionConfirmed = ref(false);
    const ingestionSubmitting = ref(false);

    // Live Sync (Google Sheets) Controls
    const sheetSyncMode = ref('all'); // 'all' (Tarik Sekaligus) | 'single' (Pilih Satu-Satu)
    const sheetTower = ref('Semua Tower'); // 'Semua Tower' | 'Tower 1' | 'Tower 2'
    const sheetDivision = ref('Semua Divisi'); // 'Semua Divisi' | 'Produksi' | 'QC'
    const sheetSinglePic = ref('Produksi');
    const sheetSingleTower = ref('Tower 1');
    const sheetSingleTable = ref('dryer_tower_1');

    const sheetSingleAvailableTables = computed(() => {
      return tables.filter(t => {
        if (t.pic !== sheetSinglePic.value) return false;
        return t.tower === sheetSingleTower.value;
      });
    });

    // Manual Entry Controls — Hierarchical: Tower ➔ PIC ➔ Filtered Table
    const manualTower = ref('Tower 1');
    const manualPic = ref('Produksi');
    const manualTableKey = ref('dryer_tower_1');
    const manualColumns = ref([]);
    const manualColumnsLoading = ref(false);
    const manualFormValues = reactive({});

    const manualAvailablePics = computed(() => {
      if (manualTower.value === 'Non-Tower') {
        return ['Produksi', 'PA', 'RMW', 'FGW'];
      }
      return ['Produksi', 'QC'];
    });

    const manualFilteredTables = computed(() => {
      return tables.filter(t => {
        if (t.pic !== manualPic.value) return false;
        if (manualTower.value === 'Non-Tower') {
          return t.tower === 'Non-Tower';
        }
        return t.tower === manualTower.value;
      });
    });

    async function loadManualColumns(targetTable) {
      if (!targetTable) {
        manualColumns.value = [];
        return;
      }
      manualColumnsLoading.value = true;
      Object.keys(manualFormValues).forEach(k => delete manualFormValues[k]);
      try {
        const res = await fetch(`/api/import/${targetTable}/columns`);
        const d = await res.json();
        if (res.ok && d.columns) {
          manualColumns.value = d.columns;
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
          d.columns.forEach(c => {
            const low = c.COLUMN_NAME.toLowerCase();
            if (low.includes('tanggal') || low.includes('date')) manualFormValues[c.COLUMN_NAME] = todayStr;
            else if (low.includes('jam') || low.includes('waktu')) manualFormValues[c.COLUMN_NAME] = timeStr;
            else if (low === 'tower') manualFormValues[c.COLUMN_NAME] = manualTower.value === 'Tower 2' ? '2' : manualTower.value === 'Tower 1' ? '1' : '-';
            else manualFormValues[c.COLUMN_NAME] = '';
          });
        }
      } catch (err) {
        console.error('Failed to load manual columns:', err);
      } finally {
        manualColumnsLoading.value = false;
      }
    }

    function onManualTowerChange(tow) {
      manualTower.value = tow;
      const pics = manualAvailablePics.value;
      if (!pics.includes(manualPic.value)) {
        manualPic.value = pics[0] || 'Produksi';
      }
      const availTables = manualFilteredTables.value;
      if (availTables.length > 0) {
        manualTableKey.value = availTables[0].key;
      } else {
        manualTableKey.value = '';
      }
      if (manualTableKey.value) {
        loadManualColumns(manualTableKey.value);
      } else {
        manualColumns.value = [];
      }
    }

    function onManualPicChange(p) {
      manualPic.value = p;
      const availTables = manualFilteredTables.value;
      if (availTables.length > 0) {
        manualTableKey.value = availTables[0].key;
      } else {
        manualTableKey.value = '';
      }
      if (manualTableKey.value) {
        loadManualColumns(manualTableKey.value);
      } else {
        manualColumns.value = [];
      }
    }

    function onManualTableChange(k) {
      manualTableKey.value = k;
      loadManualColumns(k);
    }

    function onSheetSingleTowerChange(tow) {
      sheetSingleTower.value = tow;
      const avail = sheetSingleAvailableTables.value;
      if (avail.length > 0 && !avail.some(t => t.key === sheetSingleTable.value)) {
        sheetSingleTable.value = avail[0].key;
      }
    }

    function onSheetSinglePicChange(p) {
      sheetSinglePic.value = p;
      const avail = sheetSingleAvailableTables.value;
      if (avail.length > 0 && !avail.some(t => t.key === sheetSingleTable.value)) {
        sheetSingleTable.value = avail[0].key;
      }
    }

    // Preview and Summary Data for Step 2
    const previewSummary = reactive({ newCount: 0, dupCount: 0, errCount: 0 });
    const previewColumns = ref([]);
    const previewRows = ref([]);
    const previewTargetInfo = ref('');
    const lastIngestionSuccess = reactive({ newCount: 0, dupCount: 0, target: '' });

    function setIngestionTab(tab) {
      ingestionTab.value = tab;
      ingestionStep.value = 1;
      ingestionConfirmed.value = false;
      if (tab === 'manual' && manualColumns.value.length === 0) {
        loadManualColumns(manualTableKey.value);
      }
    }

    function goToInspectPreview() {
      if (!inspectState.data) return;
      const t = inspectState.data.table;
      previewTargetInfo.value = t;
      previewColumns.value = inspectState.data.columns || ['No Batch', 'Tanggal', 'Parameter'];
      const total = Number(inspectState.data.totalRows) || 1;
      previewSummary.newCount = total;
      previewSummary.dupCount = 0;
      previewSummary.errCount = 0;
      previewRows.value = [
        { 'No Batch': 'Contoh Baris 1', 'Tanggal': today.value, _status: 'new' },
        { 'No Batch': 'Contoh Baris 2', 'Tanggal': today.value, _status: 'new' },
      ];
      ingestionConfirmed.value = false;
      ingestionStep.value = 2;
    }

    function goToSheetPreview() {
      if (sheetSyncMode.value === 'all') {
        const towCode = sheetTower.value === 'Tower 1' ? '1' : sheetTower.value === 'Tower 2' ? '2' : 'all';
        const divCode = sheetDivision.value === 'Produksi' ? 'produksi' : sheetDivision.value === 'QC' ? 'qc' : 'all';
        const targetList = tables.filter(t => {
          if (divCode !== 'all' && t.pic.toLowerCase() !== divCode) return false;
          if (towCode !== 'all' && t.tower !== `Tower ${towCode}` && t.tower !== 'Non-Tower') return false;
          return true;
        });
        previewTargetInfo.value = `${targetList.length} Tabel MySQL (${sheetTower.value} • ${sheetDivision.value})`;
        previewColumns.value = ['Nama Tabel', 'PIC / Divisi', 'Tower', 'Status'];
        previewRows.value = targetList.slice(0, 8).map(t => ({
          'Nama Tabel': t.label,
          'PIC / Divisi': t.pic,
          'Tower': t.tower,
          'Status': 'Siap Sinkron',
          _status: 'new',
        }));
        previewSummary.newCount = targetList.length;
        previewSummary.dupCount = 0;
        previewSummary.errCount = 0;
      } else {
        const tObj = getTable(sheetSingleTable.value);
        previewTargetInfo.value = `${sheetSingleTable.value} (${tObj?.label || ''})`;
        previewColumns.value = ['Nama Tabel', 'PIC', 'Tower', 'Status'];
        previewRows.value = [
          {
            'Nama Tabel': tObj?.label || sheetSingleTable.value,
            'PIC': sheetSinglePic.value,
            'Tower': sheetSingleTower.value,
            'Status': 'Siap Tarik',
            _status: 'new',
          }
        ];
        previewSummary.newCount = 1;
        previewSummary.dupCount = 0;
        previewSummary.errCount = 0;
      }
      ingestionConfirmed.value = false;
      ingestionStep.value = 2;
    }

    function goToManualPreview() {
      const keys = Object.keys(manualFormValues);
      if (keys.length === 0) {
        alert('Struktur kolom belum dimuat.');
        return;
      }
      previewTargetInfo.value = manualTableKey.value;
      previewColumns.value = keys.map(k => formatFieldLabel(k));
      const rowObj = { _status: 'new' };
      keys.forEach(k => {
        rowObj[formatFieldLabel(k)] = manualFormValues[k] || '—';
      });
      previewRows.value = [rowObj];
      previewSummary.newCount = 1;
      previewSummary.dupCount = 0;
      previewSummary.errCount = 0;
      ingestionConfirmed.value = false;
      ingestionStep.value = 2;
    }

    async function executeConfirmedIngestion() {
      if (authRole.value !== 'admin') {
        alert('Akses Dibatasi: Penambahan data, impor file, dan sinkronisasi Google Sheets merupakan aksi kritis yang hanya diizinkan untuk Super Admin.');
        openLoginModal();
        return;
      }
      ingestionSubmitting.value = true;
      try {
        if (ingestionTab.value === 'file') {
          await executeAutoImport();
          lastIngestionSuccess.newCount = previewSummary.newCount;
          lastIngestionSuccess.dupCount = previewSummary.dupCount;
          lastIngestionSuccess.target = previewTargetInfo.value;
          ingestionStep.value = 3;
        } else if (ingestionTab.value === 'sheet') {
          if (sheetSyncMode.value === 'all') {
            const towCode = sheetTower.value === 'Tower 1' ? '1' : sheetTower.value === 'Tower 2' ? '2' : 'all';
            const divCode = sheetDivision.value === 'Produksi' ? 'produksi' : sheetDivision.value === 'QC' ? 'qc' : 'all';
            const res = await fetch('/api/gsheet/sync-unified', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tower: towCode, division: divCode, force: true }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || 'Gagal sinkronisasi');
            lastIngestionSuccess.newCount = d.totalImported || 0;
            lastIngestionSuccess.dupCount = d.totalDuplicates || 0;
            lastIngestionSuccess.target = `${d.totalTables || 0} Tabel MySQL`;
          } else {
            const res = await fetch(`/api/gsheet/sync/${sheetSingleTable.value}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ force: true }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || 'Gagal sinkronisasi tabel');
            lastIngestionSuccess.newCount = d.imported || 0;
            lastIngestionSuccess.dupCount = d.duplicates || 0;
            lastIngestionSuccess.target = sheetSingleTable.value;
          }
          await refreshAllCounts();
          ingestionStep.value = 3;
        } else if (ingestionTab.value === 'manual') {
          const res = await fetch(`/api/import/${manualTableKey.value}/row`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(manualFormValues),
          });
          const d = await res.json();
          if (!res.ok) throw new Error(d.error || 'Gagal menyimpan baris data');
          lastIngestionSuccess.newCount = 1;
          lastIngestionSuccess.dupCount = 0;
          lastIngestionSuccess.target = manualTableKey.value;
          await fetchCount(manualTableKey.value);
          ingestionStep.value = 3;
        }
      } catch (err) {
        alert('Gagal mengirim data: ' + err.message);
      } finally {
        ingestionSubmitting.value = false;
      }
    }

    function resetIngestion() {
      ingestionStep.value = 1;
      ingestionConfirmed.value = false;
      resetAutoInspect();
      Object.keys(manualFormValues).forEach(k => {
        manualFormValues[k] = '';
      });
    }


    // ── Data Preview State ──
    const previewDrawerOpen = ref(false);
    const previewTableData = reactive({
      tableName: '',
      label: '',
      columns: [],
      rows: [],
      loading: false,
      totalRows: 0,
    });

    // ── INFORMASI PELAKSANAAN TRACEABILITY (GLOBAL / ACTIVE SYNC) ──
    const auditSession = reactive({
      area: 'SJA Sukodono',
      tanggalPelaksanaan: '13 Oktober 2026',
      jenis: 'Backward', // 'Backward' | 'Forward'
      picPelaksana: 'Frengky Wahyudi',
      scenario: 'Simulasi traceability untuk audit eksternal FSSC',
      auditor: 'Pak Armando, Ibu Asih',
      auditee: 'Meisy, Dini, Udin, Yolanda',
      fstl: 'Suhendar Adikusuma',
      gambarProduk: 'Terlampir pada berkas sistem',
      catatan: 'Data penarikan traceability divalidasi dan diambil langsung dari database sistem operasional SCADA PIC Produksi PT. Santos Jaya Abadi.',
      manualWaktuStart: '',
      manualWaktuEnd: '',
      manualTotalWaktu: '',
      forward: {
        kategoriProduk: 'Instant Coffee',
        namaBahan: 'Biji Kopi Robusta Mentah',
        supplierBahan: 'PT. Santos Jaya Abadi Rekanan',
        tglKedatangan: '25 Agustus 2026',
        lokasiBahan: 'Gudang GBJ / Silo UPBM',
      },
    });

    // ── 8 Process Clusters (Industrial Coffee Theme) ──
    // Dalam pencarian Backward: Alur dimulai dari Distribusi -> Kemas -> ... -> Gudang Bahan Baku
    // Dalam pencarian Forward: Alur dimulai dari Gudang Bahan Baku -> ... -> Distribusi
    const clusterConfigList = computed(() => {
      const base = window.CLUSTER_CONFIG || [];
      if (auditSession.jenis === 'Backward') {
        return [...base].reverse();
      }
      return [...base];
    });

    const selectedClusterKey = ref('distribusi');

    watch(() => auditSession.jenis, (newJenis) => {
      if (newJenis === 'Backward') {
        selectedClusterKey.value = 'distribusi';
      } else if (newJenis === 'Forward') {
        selectedClusterKey.value = 'raw-material';
      }
    });

    const clusterDataStore = computed(() => {
      if (typeof window.buildClusterData === 'function') {
        return window.buildClusterData(traceResult.value, traceForm.tower);
      }
      return {};
    });
    const activeCluster = computed(() => {
      return clusterDataStore.value[selectedClusterKey.value] || clusterDataStore.value[clusterConfigList.value[0]?.key] || clusterDataStore.value['distribusi'] || clusterDataStore.value['raw-material'];
    });

    // ── 120Hz Animated Numerical Counters ──
    const counterOutputKg = ref(0);
    const counterBox = ref(0);
    const counterYield = ref(0);

    function triggerCounters() {
      const d = traceResult.value;
      const targetKg = Number(d?.packing?.total_output_kg) || 0;
      const targetBox = d?.packing?.ok_box ? Math.round(Number(d.packing.ok_box)) : 0;
      const rawYieldVal = d?.roasting?.yield_roasting_num ?? d?.mass_balance?.yield;
      const rawYieldStr = (rawYieldVal !== undefined && rawYieldVal !== null)
        ? String(rawYieldVal).replace(',', '.').replace('%', '').trim()
        : (d?.roasting?.yield_roasting ? String(d.roasting.yield_roasting).replace(',', '.').replace('%', '').trim() : null);
      const targetYield = rawYieldStr ? parseFloat(rawYieldStr) || 0 : null;

      if (typeof window.startCounterAnimation === 'function') {
        window.startCounterAnimation(targetKg, 1100, (v) => { counterOutputKg.value = Math.round(v); });
        window.startCounterAnimation(targetBox, 1100, (v) => { counterBox.value = Math.round(v); });
        if (targetYield !== null && targetYield > 0) {
          window.startCounterAnimation(targetYield, 1200, (v) => { counterYield.value = Number(v.toFixed(2)); });
        } else {
          counterYield.value = null;
        }
      } else {
        counterOutputKg.value = targetKg;
        counterBox.value = targetBox;
        counterYield.value = targetYield;
      }
    }

    // ── Push Notification & Kelengkapan Data Engine ──
    const showMissingDataModal = ref(false);
    const pushPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'denied');
    const pushNotifSent = ref(false);

    const missingDataSummary = computed(() => {
      const d = traceResult.value;
      if (!d) return { hasMissing: false, missingCount: 0, missingStages: [], missingStageNames: [], pendingPics: [] };

      const stages = [];
      const pendingPics = new Set();

      // 1. Gudang Bahan Baku RMW (Flow 11)
      if (!d.rmw || d.rmw.error) {
        stages.push({
          flow: 'Flow 11',
          name: 'INCOMING BAHAN',
          cluster: 'Gudang Bahan Baku & Silo UPBM',
          pic: 'RMW',
          reason: 'Tabel data kedatangan biji kopi mentah belum tersedia di database MySQL.',
          refDoc: 'F/WHS/01.002'
        });
        pendingPics.add('RMW');
      }

      // 2. Silo Cell UPBM (Flow 9)
      if (!d.upbm || d.upbm.error || !d.upbm.waktu_inload) {
        stages.push({
          flow: 'Flow 9',
          name: 'UPBM',
          cluster: 'Gudang Bahan Baku & Silo UPBM',
          pic: 'UPBM',
          reason: 'Rekaman BSTB dan Inload Silo Cell UPBM belum tercatat di database MySQL.',
          refDoc: 'F/UPBM/01.008'
        });
        pendingPics.add('UPBM');
      }

      // 3. Water Process (Flow 7)
      if (!d.pa || d.pa.error) {
        stages.push({
          flow: 'Flow 7',
          name: 'WATER PROCESS',
          cluster: 'Ekstraksi Kopi',
          pic: 'PA',
          reason: 'Rekaman pengujian mutu air proses WTP belum tersedia di database MySQL.',
          refDoc: 'F/PA/03.011'
        });
        pendingPics.add('PA');
      }

      // 4. Bahan Kemas Karton & Plastik (Flow 12)
      if (!d.fgw || d.fgw.error || !d.fgw.lot_karton) {
        stages.push({
          flow: 'Flow 12',
          name: 'INCOMING BAHAN KEMAS',
          cluster: 'Pengemasan Box',
          pic: 'FGW',
          reason: 'Rekaman lot bahan kemasan sekunder belum tersedia di database MySQL.',
          refDoc: 'F/FGW/02.004'
        });
        pendingPics.add('FGW');
      }

      // 5. Distribusi Produk Jadi (Flow 1)
      if (!d.fgw || d.fgw.error || !d.fgw.no_sj) {
        stages.push({
          flow: 'Flow 1',
          name: 'DISTRIBUSI',
          cluster: 'Distribusi Produk',
          pic: 'FGW & QA',
          reason: 'Surat jalan pengiriman dan QA Release belum tercatat di database MySQL.',
          refDoc: 'F/LOG/01.035'
        });
        pendingPics.add('FGW');
      }

      return {
        hasMissing: stages.length > 0,
        missingCount: stages.length,
        missingStages: stages,
        missingStageNames: [...new Set(stages.map(s => s.name))],
        pendingPics: Array.from(pendingPics)
      };
    });

    async function requestBrowserPushNotification() {
      if (typeof Notification === 'undefined') {
        alert('Browser ini tidak mendukung Web Notifications API.');
        return;
      }
      try {
        const perm = await Notification.requestPermission();
        pushPermission.value = perm;
        if (perm === 'granted') {
          sendDesktopPushNotification();
        }
      } catch (e) {
        console.error('Notification permission error:', e);
      }
    }

    function sendDesktopPushNotification() {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const d = traceResult.value;
      const bFull = d?.input?.noBatchFull || traceForm.noBatch || 'Batch';
      const summary = missingDataSummary.value;

      if (summary.hasMissing) {
        const notif = new Notification(`⚠️ Data Belum Lengkap: Batch ${bFull}`, {
          body: `Terdapat ${summary.missingCount} tahapan alur proses yang belum terisi (PIC: ${summary.pendingPics.join(', ')}). Buka sistem untuk melihat detail field yang belum diisi.`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b45309"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
          tag: `trace-missing-${bFull}`,
        });
        notif.onclick = () => {
          window.focus();
          showMissingDataModal.value = true;
        };
        pushNotifSent.value = true;
      } else {
        new Notification(`✓ Data Lengkap: Batch ${bFull}`, {
          body: 'Seluruh tahapan proses dan data verifikasi mutu telah terisi lengkap.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23059669"><path d="M5 13l4 4L19 7"/></svg>',
        });
        pushNotifSent.value = true;
      }
    }

    function triggerPushNotification() {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        sendDesktopPushNotification();
      } else {
        requestBrowserPushNotification();
      }
    }

    function selectCluster(key) {
      selectedClusterKey.value = key;
      updateFlowStagePill();
      setTimeout(updateFlowStagePill, 40);
      setTimeout(updateFlowStagePill, 120);
    }

    async function openTablePreview(tableName, label) {
      previewTableData.tableName = tableName;
      previewTableData.label = label || tableName;
      previewTableData.columns = [];
      previewTableData.rows = [];
      previewTableData.loading = true;
      previewTableData.totalRows = 0;
      previewDrawerOpen.value = true;

      try {
        const res = await fetch(`/api/import/${tableName}/rows?page=1&limit=5`);
        if (!res.ok) throw new Error('Gagal mengambil data preview');
        const d = await res.json();
        previewTableData.columns = d.columns || [];
        previewTableData.rows = d.rows || [];
        previewTableData.totalRows = d.totalRows || 0;
      } catch (err) {
        console.error('Failed to load table preview:', err);
      } finally {
        previewTableData.loading = false;
      }
    }

    function closeTablePreview() {
      previewDrawerOpen.value = false;
    }

    const openProdTables = reactive({});
    const openQcTables = reactive({});
    const openPaTables = reactive({});
    const openCipChecklists = reactive({});
    const showReportCipTable = ref(false);
    const cipChecklistFilter = ref('all');

    // ── Unified Inspector Pop-up Modal State & Methods ──
    const activeInspectModal = ref(null);
    const inspectSearchInput = ref('');
    const inspectSearchQuery = ref('');
    const inspectCipFilter = ref('all');
    let inspectDebounceTimer = null;
    watch(inspectSearchInput, (newVal) => {
      clearTimeout(inspectDebounceTimer);
      inspectDebounceTimer = setTimeout(() => {
        inspectSearchQuery.value = newVal;
      }, 150);
    });

    function openInspectCip(checklistData, customTitle, customSubtitle) {
      if (!checklistData) {
        checklistData = traceResult.value?.pa?.extraction_cip_checklist;
      }
      if (!checklistData) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      inspectCipFilter.value = 'all';
      const isCop = (customTitle && customTitle.toLowerCase().includes('cop')) || (checklistData.tableName && checklistData.items && checklistData.items.some(i => i.item && i.item.toLowerCase().includes('cop')));
      activeInspectModal.value = {
        type: isCop ? 'cop' : 'cip',
        title: customTitle ? `${customTitle} (${checklistData.plantName || 'Plant 1'})` : `Checklist CIP & Flushing Area Extraction (${checklistData.plantName || 'Plant 1'})`,
        subtitle: customSubtitle || (isCop ? 'Pengambilan data waktu COP terakhir untuk setiap titik instrument/area sebelum tanggal proses batch.' : 'Pengambilan data waktu CIP/COP terakhir untuk setiap titik instrument/area sebelum tanggal proses batch.'),
        tableName: checklistData.tableName || (String(checklistData.tower).includes('2') ? 'pa_cip_t2' : 'pa_cip_t1'),
        refForm: 'QF/PDQC/SS/010',
        plantName: checklistData.plantName || 'Plant 1',
        totalItems: checklistData.totalItems || (checklistData.items ? checklistData.items.length : 0),
        recordedItems: checklistData.recordedItems || (checklistData.items ? checklistData.items.filter(i => i.status === 'OK').length : 0),
        latestCipDate: checklistData.latestCipDate || '-',
        averages: checklistData.averages || null,
        items: checklistData.items || []
      };
    }

    function openInspectEmp(checklistData, customTitle, subtype) {
      if (!checklistData) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      const isExt = subtype === 'external';
      activeInspectModal.value = {
        type: isExt ? 'emp_external' : 'emp_internal',
        title: customTitle || (isExt ? 'Checklist Environmental Swab Eksternal (Pathogen)' : 'Checklist Environmental Swab Internal (Non Pathogen)'),
        subtitle: isExt ? 'Hasil monitoring area sampling eksternal dari database MySQL (Kolom spesifik Salmonella & S.Aureus belum tersedia di tabel DB).' : 'Hasil monitoring mikrobiologi internal (Non-Pathogen) dari database MySQL.',
        tableName: checklistData.tableName || 'pa_emp_t1',
        refForm: checklistData.refForm || (isExt ? 'Form Patogen Eksternal' : 'Form F/QC.2.35'),
        plantName: checklistData.plantName || 'Plant 1',
        totalItems: checklistData.items?.length || 0,
        sessionDate: checklistData.sessionDate || '-',
        items: checklistData.items || []
      };
    }

    function openInspectAbe(checklistData, customTitle) {
      if (!checklistData) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      activeInspectModal.value = {
        type: 'abe',
        title: customTitle || 'Checklist Air Bacteria Exposed',
        subtitle: `Hasil monitoring paparan mikrobiologi udara dari database MySQL ${checklistData.tableName || 'pa_abe_t1'}.`,
        tableName: checklistData.tableName || 'pa_abe_t1',
        refForm: checklistData.refForm || 'Form F/QC.2.5',
        plantName: checklistData.plantName || checklistData.tower || 'Tower 1',
        totalItems: checklistData.items?.length || 0,
        sessionDate: checklistData.sessionDate || '-',
        sessionTime: checklistData.sessionTime || '-',
        team: checklistData.team || '-',
        waktuTeam: checklistData.waktuTeam || '-',
        items: checklistData.items || []
      };
    }

    function openInspectScada(procKey) {
      if (!procKey) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      const title = getProcessTitleByKey(procKey);
      const columns = getProcessColumnsByKey(procKey);
      const rows = getProcessRowsByKey(procKey);
      const tw = traceResult.value?.input?.tower || traceForm.tower || '1';
      const tableNames = {
        dryer: `dryer_tower_${tw}`,
        evaporation: `evaporation_tower_${tw}`,
        extraction: `extraction_tower_${tw}`,
        roasting: 'roasting_probat'
      };
      activeInspectModal.value = {
        type: 'scada',
        procKey,
        title: `Tabel Parameter Kritis SCADA • ${title}`,
        subtitle: 'Rekaman telemetri parameter operasional mesin aktual dari PLC SCADA / IoT.',
        tableName: tableNames[procKey] || procKey,
        refForm: 'SCADA Telemetry',
        columns,
        rows
      };
    }

    function openInspectProd(flow) {
      if (!flow || !flow.prodTable) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      const isWater = String(flow.prodTable.tableName || '').includes('fwt');
      activeInspectModal.value = {
        type: isWater ? 'pa_water' : 'prod',
        title: flow.prodTable.title ? flow.prodTable.title : `Tabel Data Produksi • ${flow.flowTitle}`,
        subtitle: isWater
          ? `Data pengujian air proses (WTP) batch ${traceResult.value?.input?.noBatchFull || ''} dari database MySQL (Uji Mingguan Lab & Harian Ekstraksi).`
          : `Data transaksi proses produksi batch ${traceResult.value?.input?.noBatchFull || ''} tersimpan di database MySQL.`,
        tableName: flow.prodTable.tableName,
        refForm: isWater ? 'Form Water Process WTP' : 'PROD LOG',
        columns: flow.prodTable.columns || [],
        rows: flow.prodTable.rows || [],
        averages: flow.prodTable.averages || null
      };
    }

    function isExcludedAvgCol(col) {
      if (!col) return true;
      const lower = String(col).trim().toLowerCase();
      if (lower === 'id' || lower.endsWith('_id') || lower.endsWith(' id')) return true;
      const excludeKeywords = [
        'batch', 'pack', 'box', 'jam', 'tanggal', 'date', 'time', 'stamp', 'mode',
        'produk', 'product', 'bahan', 'percolator', 'silo', 'tank', 'shift',
        'transfer', 'masakan', 'verifikasi', 'status', 'screening', 'ttd',
        'pic', 'operator', 'analisa', 'formula', 'keterangan', 'lokasi', 'action',
        'aksi', 'disposisi', 'note', 'catatan', 'mesin', 'line', 'kategori'
      ];
      if (excludeKeywords.some(kw => lower.includes(kw))) return true;
      if (['fm', 'vis', 'visual', 'fluidity', 'floating', 'floating particles'].includes(lower)) return true;
      return false;
    }

    function parseNumericVal(val) {
      if (val === null || val === undefined) return null;
      if (typeof val === 'number') return isNaN(val) ? null : val;
      const s = String(val).trim().replace(',', '.');
      if (s === '' || s === '-' || s === 'null') return null;
      const m = s.match(/^-?\d+(\.\d+)?/);
      if (!m) return null;
      const num = parseFloat(m[0]);
      return isNaN(num) ? null : num;
    }

    function computeTableAverages(rows, cols, precomputed = null) {
      const avgs = {};
      if (!rows || rows.length === 0 || !cols) {
        return precomputed && typeof precomputed === 'object' ? { ...precomputed } : avgs;
      }
      for (const col of cols) {
        if (precomputed && precomputed[col] !== undefined && precomputed[col] !== null) {
          avgs[col] = String(precomputed[col]);
          continue;
        }
        if (isExcludedAvgCol(col)) continue;
        let sum = 0, count = 0;
        for (const r of rows) {
          const n = parseNumericVal(r[col]);
          if (n !== null && n > 0) {
            sum += n;
            count++;
          }
        }
        if (count > 0) {
          const avg = sum / count;
          const lower = col.toLowerCase();
          let formatted;
          if (lower.includes('ph')) {
            formatted = avg % 1 === 0 ? String(avg) : avg.toFixed(3);
          } else {
            formatted = avg % 1 === 0 ? String(avg) : avg.toFixed(2);
          }
          if (formatted.includes('.') && formatted.endsWith('00')) formatted = formatted.slice(0, -3);
          else if (formatted.includes('.') && formatted.endsWith('0')) formatted = formatted.slice(0, -1);
          avgs[col] = formatted;
        }
      }
      return avgs;
    }

    function openInspectQc(flowOrTable) {
      const table = flowOrTable?.qcTable || (flowOrTable?.rows ? flowOrTable : null);
      if (!table || !table.rows) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      const cols = table.columns || (table.rows[0] ? Object.keys(table.rows[0]) : []);
      const rows = table.rows || [];
      const avgs = computeTableAverages(rows, cols, table.averages);
      activeInspectModal.value = {
        type: 'qc',
        title: table.title || `Tabel Pengujian Mutu (QC) • ${flowOrTable?.flowTitle || table.tableName}`,
        subtitle: 'Hasil analisa laboratorium Quality Control untuk parameter mutu batch terkait.',
        tableName: table.tableName,
        refForm: table.refForm || 'QC LAB',
        columns: cols,
        rows: rows,
        averages: avgs
      };
    }

    const inspectQcMode = ref('checklist'); // 'checklist' | 'raw'

    function openInspectQcChecklist(param, customTitle) {
      const checklist = param?.qcChecklist || param;
      if (!checklist || !checklist.items) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      inspectQcMode.value = 'checklist';
      activeInspectModal.value = {
        type: 'qc_checklist',
        title: customTitle || checklist.title || 'Checklist Pengujian Mutu (QC)',
        subtitle: checklist.subtitle || 'Hasil evaluasi pengujian mutu laboratorium Quality Control dari tabel MySQL.',
        tableName: checklist.tableName || 'qc_table',
        refForm: checklist.refForm || 'Form QF/PDQC/QC/016',
        totalItems: checklist.totalItems || (checklist.items?.length || 0),
        sessionDate: checklist.sessionDate || '-',
        analisQc: checklist.analisQc || 'Data tidak ditemukan di database',
        items: checklist.items || [],
        rawRows: checklist.rawRows || [],
        rawColumns: checklist.rawColumns || (checklist.rawRows?.[0] ? Object.keys(checklist.rawRows[0]) : [])
      };
    }

    function openInspectPa(param) {
      const table = param?.paTable || param;
      if (!table || !table.rows) return;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
      activeInspectModal.value = {
        type: 'pa',
        title: table.title || `Tabel Sanitasi & Jaminan Mutu (PA) • ${param.flowTitle || 'PA'}`,
        subtitle: 'Pencatatan monitoring mikrobiologi dan sanitasi Product Assurance dari database MySQL.',
        tableName: table.tableName,
        refForm: 'PA LOG',
        columns: table.columns || [],
        rows: table.rows || [],
        averages: table.averages || null
      };
    }

    function closeInspectModal() {
      activeInspectModal.value = null;
      activeModalProcess.value = null;
      inspectSearchInput.value = ''; inspectSearchQuery.value = '';
    }

    const shouldShowInspectAverages = computed(() => {
      if (!activeInspectModal.value) return false;
      const type = activeInspectModal.value.type;
      const tbl = String(activeInspectModal.value.tableName || '').toLowerCase();
      // QC laboratory testing tables require averages per batch inspection
      if (type === 'qc') return true;
      // Water treatment (pa_fwt) tables require averages for daily shift water parameters
      if (tbl.includes('fwt')) return true;
      return false;
    });

    const inspectTableAverages = computed(() => {
      if (!activeInspectModal.value || !shouldShowInspectAverages.value) return {};
      const rows = filteredInspectTableRows.value || [];
      const cols = activeInspectModal.value.columns || [];
      const pre = activeInspectModal.value.averages;
      if (rows.length === 0) return pre || {};
      return computeTableAverages(rows, cols, pre);
    });

    const inspectCalcMode = ref('avg'); // 'avg' | 'sum' | 'min' | 'max' | 'count' | 'count_num' | 'none'

    const inspectCalculations = computed(() => {
      const mode = inspectCalcMode.value;
      if (mode === 'none' || !activeInspectModal.value) return {};
      const rows = filteredInspectTableRows.value || [];
      const cols = activeInspectModal.value.columns || [];
      if (rows.length === 0 || cols.length === 0) return {};

      const res = {};
      const pre = activeInspectModal.value.averages;
      for (const col of cols) {
        if (mode === 'count') {
          let count = 0;
          for (const r of rows) {
            const v = r[col];
            if (v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '-') count++;
          }
          res[col] = String(count);
          continue;
        }

        const nums = [];
        for (const r of rows) {
          const n = parseNumericVal(r[col]);
          if (n !== null) nums.push(n);
        }

        if (mode === 'count_num') {
          res[col] = String(nums.length);
          continue;
        }

        if (nums.length === 0 || isExcludedAvgCol(col)) {
          if (mode === 'avg' && pre && pre[col] !== undefined && pre[col] !== null && String(inspectSearchQuery.value || '').trim() === '') {
            res[col] = String(pre[col]);
          } else {
            res[col] = '-';
          }
          continue;
        }

        if (mode === 'sum') {
          const sum = nums.reduce((a, b) => a + b, 0);
          res[col] = sum % 1 === 0
            ? sum.toLocaleString('id-ID')
            : sum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (mode === 'avg') {
          if (pre && pre[col] !== undefined && pre[col] !== null && String(inspectSearchQuery.value || '').trim() === '') {
            res[col] = String(pre[col]);
          } else {
            const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            const isPh = col.toLowerCase().includes('ph');
            res[col] = avg % 1 === 0
              ? String(avg)
              : avg.toLocaleString('id-ID', { minimumFractionDigits: isPh ? 3 : 2, maximumFractionDigits: isPh ? 3 : 2 });
          }
        } else if (mode === 'min') {
          const min = Math.min(...nums);
          res[col] = min % 1 === 0
            ? min.toLocaleString('id-ID')
            : min.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (mode === 'max') {
          const max = Math.max(...nums);
          res[col] = max % 1 === 0
            ? max.toLocaleString('id-ID')
            : max.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
      return res;
    });

    const explorerCalcMode = ref('none'); // 'none' | 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count_num'

    function getCalcModeLabel(mode) {
      const map = {
        sum: 'Jumlah',
        avg: 'Rata-rata',
        min: 'Min',
        max: 'Maks',
        count: 'Cell Berisi',
        count_num: 'Cell Angka'
      };
      return map[mode] || mode;
    }

    const explorerCalculations = computed(() => {
      const mode = explorerCalcMode.value;
      if (mode === 'none') return {};
      const rows = picTableRows.value || [];
      const cols = picTableColumns.value || [];
      if (rows.length === 0 || cols.length === 0) return {};

      const res = {};
      for (const col of cols) {
        if (mode === 'count') {
          let count = 0;
          for (const r of rows) {
            const v = r[col];
            if (v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '-') count++;
          }
          res[col] = String(count);
          continue;
        }

        const nums = [];
        for (const r of rows) {
          const n = parseNumericVal(r[col]);
          if (n !== null) nums.push(n);
        }

        if (mode === 'count_num') {
          res[col] = String(nums.length);
          continue;
        }

        if (nums.length === 0 || isExcludedAvgCol(col)) {
          res[col] = '-';
          continue;
        }

        if (mode === 'sum') {
          const sum = nums.reduce((a, b) => a + b, 0);
          res[col] = sum % 1 === 0
            ? sum.toLocaleString('id-ID')
            : sum.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (mode === 'avg') {
          const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
          const isPh = col.toLowerCase().includes('ph');
          res[col] = avg % 1 === 0
            ? String(avg)
            : avg.toLocaleString('id-ID', { minimumFractionDigits: isPh ? 3 : 2, maximumFractionDigits: isPh ? 3 : 2 });
        } else if (mode === 'min') {
          const min = Math.min(...nums);
          res[col] = min % 1 === 0
            ? min.toLocaleString('id-ID')
            : min.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else if (mode === 'max') {
          const max = Math.max(...nums);
          res[col] = max % 1 === 0
            ? max.toLocaleString('id-ID')
            : max.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }
      return res;
    });

    const picTableAverages = computed(() => {
      const rows = picTableRows.value || [];
      const cols = picTableColumns.value || [];
      if (rows.length === 0 || cols.length === 0) return {};
      return computeTableAverages(rows, cols);
    });

    const filteredInspectCipItems = computed(() => {
      if (!activeInspectModal.value || (activeInspectModal.value.type !== 'cip' && activeInspectModal.value.type !== 'cop')) return [];
      const items = activeInspectModal.value.items || [];
      let res = items;
      const f = inspectCipFilter.value;
      if (f === 'swab') res = res.filter(i => (i.swabTarget && i.swabTarget !== '-') || (i.swabResult && i.swabResult !== '-') || i.stage === 'Swab ATP');
      else if (f === 'lt1') res = res.filter(i => i.floor && i.floor.includes('Lt. 1'));
      else if (f === 'lt2') res = res.filter(i => i.floor && i.floor.includes('Lt. 2'));
      else if (f === 'lt3') res = res.filter(i => i.floor && !i.floor.includes('Lt. 1') && !i.floor.includes('Lt. 2'));

      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (q) {
        res = res.filter(i =>
          String(i.item || '').toLowerCase().includes(q) ||
          String(i.peralatan || '').toLowerCase().includes(q) ||
          String(i.floor || '').toLowerCase().includes(q) ||
          String(i.waktu || '').toLowerCase().includes(q) ||
          String(i.waktuCip || '').toLowerCase().includes(q) ||
          String(i.phLab || '').toLowerCase().includes(q) ||
          String(i.swabResult || '').toLowerCase().includes(q)
        );
      }
      return res;
    });

    const filteredInspectEmpItems = computed(() => {
      if (!activeInspectModal.value || (activeInspectModal.value.type !== 'emp_internal' && activeInspectModal.value.type !== 'emp_external')) return [];
      const items = activeInspectModal.value.items || [];
      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (!q) return items;
      return items.filter(i =>
        String(i.titikUji || '').toLowerCase().includes(q) ||
        String(i.tanggal || '').toLowerCase().includes(q) ||
        String(i.team || '').toLowerCase().includes(q) ||
        String(i.jam || '').toLowerCase().includes(q) ||
        String(i.area || '').toLowerCase().includes(q) ||
        String(i.zona || '').toLowerCase().includes(q)
      );
    });

    const filteredInspectAbeItems = computed(() => {
      if (!activeInspectModal.value || activeInspectModal.value.type !== 'abe') return [];
      const items = activeInspectModal.value.items || [];
      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (!q) return items;
      return items.filter(i =>
        String(i.room || '').toLowerCase().includes(q) ||
        String(i.titikUji || '').toLowerCase().includes(q) ||
        String(i.code || '').toLowerCase().includes(q) ||
        String(i.team || '').toLowerCase().includes(q) ||
        String(i.waktu || '').toLowerCase().includes(q) ||
        String(i.tpc || '').toLowerCase().includes(q) ||
        String(i.ym || '').toLowerCase().includes(q)
      );
    });

    const filteredInspectTableRows = computed(() => {
      if (!activeInspectModal.value || !activeInspectModal.value.rows) return [];
      const rows = activeInspectModal.value.rows;
      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (!q) return rows;
      return rows.filter(r => {
        return Object.values(r).some(v => String(v || '').toLowerCase().includes(q));
      });
    });

    const filteredInspectQcItems = computed(() => {
      if (!activeInspectModal.value || activeInspectModal.value.type !== 'qc_checklist') return [];
      const items = activeInspectModal.value.items || [];
      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (!q) return items;
      return items.filter(it =>
        String(it.parameter || '').toLowerCase().includes(q) ||
        String(it.category || '').toLowerCase().includes(q) ||
        String(it.standar || '').toLowerCase().includes(q) ||
        String(it.hasil || '').toLowerCase().includes(q) ||
        String(it.status || '').toLowerCase().includes(q)
      );
    });

    const filteredInspectQcRawRows = computed(() => {
      if (!activeInspectModal.value || activeInspectModal.value.type !== 'qc_checklist') return [];
      const rows = activeInspectModal.value.rawRows || [];
      const q = String(inspectSearchQuery.value || '').trim().toLowerCase();
      if (!q) return rows;
      return rows.filter(r => Object.values(r).some(v => String(v || '').toLowerCase().includes(q)));
    });

    function toggleFlowCipChecklist(flow) {
      if (flow?.cipChecklist) openInspectCip(flow.cipChecklist);
    }

    function setCipChecklistFilter(f) {
      inspectCipFilter.value = f;
      cipChecklistFilter.value = f;
    }

    function filteredCipItems(items) {
      if (!items || !Array.isArray(items)) return [];
      const f = cipChecklistFilter.value;
      if (f === 'swab') return items.filter(i => i.swabTarget && i.swabTarget !== '-');
      if (f === 'lt1') return items.filter(i => i.floor && i.floor.includes('Lt. 1'));
      if (f === 'lt2') return items.filter(i => i.floor && i.floor.includes('Lt. 2'));
      if (f === 'lt3') return items.filter(i => i.floor && !i.floor.includes('Lt. 1') && !i.floor.includes('Lt. 2'));
      return items;
    }

    function toggleFlowProdTable(flow) {
      if (flow?.prodTable) openInspectProd(flow);
    }

    function toggleFlowQcTable(flow) {
      if (flow?.qcTable) openInspectQc(flow);
    }

    function toggleFlowPaTable(flow) {
      if (flow?.paTable) openInspectPa(flow);
    }

    function cleanSectionTitle(title) {
      if (!title) return '';
      return String(title)
        .replace(/\s*\((?:PIC\s+)?(?:Produksi|QC|PA|RMW|UPBM|FGW|Laboratorium QC|QC Kedatangan|PIC RMW|PIC UPBM|PIC FGW|PIC PA)\)\s*$/i, '')
        .trim();
    }

    function getProdRole(flow) {
      if (flow?.prodRole) return flow.prodRole;
      if (flow?.pic?.pa && !flow?.pic?.operasional) return 'PA';
      return 'Produksi';
    }

    function getQcRole(flow) {
      if (flow?.qcRole) return flow.qcRole;
      if (flow?.pic?.pa && !flow?.pic?.qc) return 'PA';
      return 'QC';
    }

    function formatMetricVal(val) {
      if (val === null || val === undefined || val === '') return '';
      const s = String(val).trim();
      const lower = s.toLowerCase();
      if (
        s === '-' ||
        s === '(-)' ||
        lower.includes('tidak ditemukan') ||
        lower.includes('belum ada di database') ||
        lower === 'null' ||
        lower === 'undefined'
      ) {
        return '';
      }
      return s;
    }

    function isMissingVal(val) {
      return formatMetricVal(val) === '';
    }

    const openRawTables = reactive({});
    const flowRawDataCache = ref({});
    const flowRawLoading = reactive({});

    function getFlowProcessKey(flow) {
      if (flow?.processKey) return flow.processKey;
      const num = String(flow?.flowNumber || '');
      if (num.includes('8') || num.includes('9') || num.includes('10') || num.includes('11')) return 'roasting';
      if (num.includes('6') || num.includes('7')) return 'extraction';
      if (num.includes('5') || num.includes('3')) return 'evaporation';
      if (num.includes('4')) return 'dryer';
      if (num.includes('2') || num.includes('12') || num.includes('1')) return 'packing';
      return '';
    }

    function getFlowColumns(flow) {
      if (!flow) return [];
      const p = getFlowProcessKey(flow);
      if (p && traceResult.value?.[p]?.columns?.length > 0) {
        return traceResult.value[p].columns;
      }
      if (flow.tableKey && flowRawDataCache.value[flow.tableKey]?.columns?.length > 0) {
        return flowRawDataCache.value[flow.tableKey].columns;
      }
      return [];
    }

    function getFlowRows(flow) {
      if (!flow) return [];
      const p = getFlowProcessKey(flow);
      if (p && traceResult.value?.[p]?.raw_rows?.length > 0) {
        return traceResult.value[p].raw_rows;
      }
      if (flow.tableKey && flowRawDataCache.value[flow.tableKey]?.rows?.length > 0) {
        return flowRawDataCache.value[flow.tableKey].rows;
      }
      return [];
    }

    async function toggleFlowRawTable(flow) {
      if (!flow || !flow.flowNumber) return;
      const key = flow.flowNumber;
      openRawTables[key] = !openRawTables[key];

      if (openRawTables[key]) {
        const rows = getFlowRows(flow);
        if (rows.length === 0 && flow.tableKey) {
          flowRawLoading[key] = true;
          try {
            const res = await fetch(`/api/import/${flow.tableKey}/rows?page=1&limit=50`);
            if (res.ok) {
              const data = await res.json();
              flowRawDataCache.value[flow.tableKey] = {
                columns: data.columns || [],
                rows: data.rows || [],
              };
            }
          } catch (err) {
            console.error('Error fetching raw rows for flow:', flow.title, err);
          } finally {
            flowRawLoading[key] = false;
          }
        }
      }
    }

    const flowSections = ref(window.FLOW_SECTIONS || []);

    const today = computed(() => {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    });

    // ── AUDIT TIMER (GLOBAL / ACTIVE SYNC) ──

    const auditTimer = reactive({
      status: 'idle', // 'idle' | 'running' | 'completed'
      startTime: null,
      endTime: null,
      elapsedSeconds: 0,
      intervalId: null,
    });

    const showAuditDetails = ref(false);

    // ══════════════════════════════════════════════════════════════
    // SISTEM WORK ORDER TRACEABILITY MULTI-SESI (FORM F/QC/01.030)
    // ══════════════════════════════════════════════════════════════
    const traceabilitySessions = reactive([]);
    const activeSessionId = ref(null); // null = tampilkan Hub Daftar Work Order
    const showNewSessionModal = ref(false);
    const newSessionStep = ref(1); // 1 = Info Pelaksanaan (Gambar 2), 2 = Konfigurasi Penelusuran (Gambar 3)
    const newSessionMode = ref('create'); // 'create' | 'edit'
    const reportViewMode = ref('log'); // 'log' = Tabel Riwayat Log Operasional (Default Awal), 'document' = Dokumen Form F/QC/01.030

    const draftSession = reactive({
      id: '',
      code: '',
      area: 'SJA Sukodono',
      tanggalPelaksanaan: '',
      picPelaksana: 'Frengky Wahyudi',
      fstl: 'Suhendar Adikusuma',
      auditor: 'Pak Armando\nIbu Asih',
      auditee: 'Meisy, Dini, Udin, Yolanda',
      scenario: 'Simulasi traceability untuk audit eksternal FSSC',
      gambarProduk: 'Terlampir pada berkas sistem',
      catatan: 'Data penarikan traceability divalidasi dan diambil langsung dari database sistem operasional SCADA PIC Produksi PT. Santos Jaya Abadi.',
      jenis: 'Backward', // 'Backward' | 'Forward'
      noBatch: '',
      tower: '1',
      forward: {
        kategoriProduk: 'Instant Coffee',
        namaBahan: '',
        supplierBahan: 'PT. Santos Jaya Abadi Rekanan',
        tglKedatangan: '',
        lokasiBahan: 'Gudang GBJ / Silo UPBM',
      },
    });

    const activeSession = computed(() => {
      if (!activeSessionId.value) return null;
      return traceabilitySessions.find(s => s.id === activeSessionId.value) || null;
    });

    const sessionStats = computed(() => {
      const total = traceabilitySessions.length;
      const completed = traceabilitySessions.filter(s => s.status === 'completed').length;
      const running = traceabilitySessions.filter(s => s.status === 'running').length;
      const draft = traceabilitySessions.filter(s => s.status === 'draft' || !s.status).length;
      return { total, completed, running, draft };
    });

    function saveSessionsToStorage() {
      try {
        const serializable = traceabilitySessions.map(s => {
          const item = JSON.parse(JSON.stringify(s));
          if (item.timer) {
            item.timer.intervalId = null;
          }
          return item;
        });
        localStorage.setItem('traceability_work_orders', JSON.stringify(serializable));
      } catch (err) {
        console.error('Gagal menyimpan sesi work order:', err);
      }
    }

    function createDefaultFSSCSession() {
      const def = {
        id: 'WO-20261013-001',
        code: 'WO-001',
        createdAt: '2026-10-13T08:06:00.000Z',
        area: 'SJA Sukodono',
        tanggalPelaksanaan: '13 Oktober 2026',
        picPelaksana: 'Frengky Wahyudi',
        fstl: 'Suhendar Adikusuma',
        auditor: 'Pak Armando\nIbu Asih',
        auditee: 'Meisy, Dini, Udin, Yolanda',
        scenario: 'Simulasi traceability untuk audit eksternal FSSC',
        gambarProduk: 'Terlampir pada berkas sistem',
        catatan: 'Data penarikan traceability divalidasi dan diambil langsung dari database sistem operasional SCADA PIC Produksi PT. Santos Jaya Abadi.',
        jenis: 'Backward',
        noBatch: 'A370/26',
        tower: '1',
        status: 'completed',
        manualWaktuStart: '08:06',
        manualWaktuEnd: '11:36',
        manualTotalWaktu: '3 jam 30 menit',
        timer: {
          status: 'completed',
          startTime: '2026-10-13T08:06:00.000Z',
          endTime: '2026-10-13T11:36:00.000Z',
          elapsedSeconds: 12600,
          intervalId: null
        },
        forward: {
          kategoriProduk: 'Instant Coffee',
          namaBahan: 'Biji Kopi Robusta Mentah',
          supplierBahan: 'PT. Santos Jaya Abadi Rekanan',
          tglKedatangan: '25 Agustus 2026',
          lokasiBahan: 'Gudang GBJ / Silo UPBM',
        },
        traceResult: null,
      };
      traceabilitySessions.push(def);
      saveSessionsToStorage();
    }

    function syncSessionToGlobal(s) {
      if (!s) return;
      auditSession.area = s.area || 'SJA Sukodono';
      auditSession.tanggalPelaksanaan = s.tanggalPelaksanaan || today.value;
      auditSession.jenis = s.jenis || 'Backward';
      auditSession.picPelaksana = s.picPelaksana || 'Frengky Wahyudi';
      auditSession.scenario = s.scenario || '';
      auditSession.auditor = s.auditor || '';
      auditSession.auditee = s.auditee || '';
      auditSession.fstl = s.fstl || '';
      auditSession.gambarProduk = s.gambarProduk || 'Terlampir pada berkas sistem';
      auditSession.catatan = s.catatan || '';
      auditSession.manualWaktuStart = s.manualWaktuStart || '';
      auditSession.manualWaktuEnd = s.manualWaktuEnd || '';
      auditSession.manualTotalWaktu = s.manualTotalWaktu || '';

      if (s.forward) {
        auditSession.forward = { ...s.forward };
      }

      traceForm.noBatch = s.noBatch || '';
      traceForm.tower = s.tower || '1';

      if (s.timer) {
        auditTimer.status = s.timer.status || 'idle';
        auditTimer.startTime = s.timer.startTime ? new Date(s.timer.startTime) : null;
        auditTimer.endTime = s.timer.endTime ? new Date(s.timer.endTime) : null;
        auditTimer.elapsedSeconds = s.timer.elapsedSeconds || 0;
      }
    }

    function loadSessionsFromStorage() {
      try {
        const raw = localStorage.getItem('traceability_work_orders');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            traceabilitySessions.splice(0, traceabilitySessions.length, ...parsed);
            if (!activeSessionId.value) {
              openSession(traceabilitySessions[0]);
            }
            return;
          }
        }
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
      createDefaultFSSCSession();
      if (!activeSessionId.value && traceabilitySessions.length > 0) {
        openSession(traceabilitySessions[0]);
      }
    }

    function openSession(sessionOrId) {
      if (!sessionOrId) {
        activeSessionId.value = null;
        return;
      }
      const s = typeof sessionOrId === 'string'
        ? traceabilitySessions.find(x => x.id === sessionOrId)
        : sessionOrId;
      if (!s) {
        activeSessionId.value = null;
        return;
      }
      activeSessionId.value = s.id;
      syncSessionToGlobal(s);

      if (s.traceResult) {
        traceResult.value = s.traceResult;
      } else if (s.jenis === 'Backward' && s.noBatch) {
        doTrace();
      }
    }

    function openSessionReport(sessionOrId) {
      openSession(sessionOrId);
      reportViewMode.value = 'document';
      activeTab.value = 'report';
    }

    function openSessionPipeline(sessionOrId) {
      openSession(sessionOrId);
      activeTab.value = 'pipeline';
    }

    function navigateToPipeline(resetToDirectory = false) {
      activeTab.value = 'pipeline';
      if (resetToDirectory) {
        activeSessionId.value = null;
      }
    }

    function navigateToReport(forcedMode = null) {
      activeTab.value = 'report';
      if (forcedMode) {
        reportViewMode.value = forcedMode;
      }
    }

    function backToWorkOrderList() {
      activeSessionId.value = null;
    }

    function openCreateSessionModal() {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
      const woNum = traceabilitySessions.length + 1;

      draftSession.id = `WO-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(woNum).padStart(3, '0')}`;
      draftSession.code = `WO-${String(woNum).padStart(3, '0')}`;
      draftSession.area = 'SJA Sukodono';
      draftSession.tanggalPelaksanaan = todayFormatted;
      draftSession.picPelaksana = 'Frengky Wahyudi';
      draftSession.fstl = 'Suhendar Adikusuma';
      draftSession.auditor = 'Pak Armando\nIbu Asih';
      draftSession.auditee = 'Meisy, Dini, Udin, Yolanda';
      draftSession.scenario = 'Simulasi traceability untuk audit eksternal FSSC';
      draftSession.gambarProduk = 'Terlampir pada berkas sistem';
      draftSession.catatan = 'Data penarikan traceability divalidasi dan diambil langsung dari database sistem operasional SCADA PIC Produksi PT. Santos Jaya Abadi.';
      draftSession.jenis = 'Backward';
      draftSession.noBatch = '';
      draftSession.tower = '1';
      draftSession.forward = {
        kategoriProduk: 'Instant Coffee',
        namaBahan: '',
        supplierBahan: 'PT. Santos Jaya Abadi Rekanan',
        tglKedatangan: todayFormatted,
        lokasiBahan: 'Gudang GBJ / Silo UPBM',
      };
      newSessionMode.value = 'create';
      newSessionStep.value = 1;
      showNewSessionModal.value = true;
    }

    function openEditSessionModal(s) {
      if (!s) return;
      draftSession.id = s.id;
      draftSession.code = s.code || s.id;
      draftSession.area = s.area || 'SJA Sukodono';
      draftSession.tanggalPelaksanaan = s.tanggalPelaksanaan || '';
      draftSession.picPelaksana = s.picPelaksana || '';
      draftSession.fstl = s.fstl || '';
      draftSession.auditor = s.auditor || '';
      draftSession.auditee = s.auditee || '';
      draftSession.scenario = s.scenario || '';
      draftSession.gambarProduk = s.gambarProduk || 'Terlampir pada berkas sistem';
      draftSession.catatan = s.catatan || '';
      draftSession.jenis = s.jenis || 'Backward';
      draftSession.noBatch = s.noBatch || '';
      draftSession.tower = s.tower || '1';
      draftSession.forward = { ...(s.forward || {}) };
      newSessionMode.value = 'edit';
      newSessionStep.value = 1;
      showNewSessionModal.value = true;
    }

    function loadPresetIntoDraft() {
      draftSession.area = 'SJA Sukodono';
      draftSession.tanggalPelaksanaan = '13 Oktober 2026';
      draftSession.picPelaksana = 'Frengky Wahyudi';
      draftSession.fstl = 'Suhendar Adikusuma';
      draftSession.auditor = 'Pak Armando\nIbu Asih';
      draftSession.auditee = 'Meisy, Dini, Udin, Yolanda';
      draftSession.scenario = 'Simulasi traceability untuk audit eksternal FSSC';
      draftSession.jenis = 'Backward';
      draftSession.noBatch = 'A370/26';
      draftSession.tower = '1';
    }

    function saveDraftSession(startImmediately = false) {
      if (!draftSession.area || !draftSession.tanggalPelaksanaan || !draftSession.picPelaksana) {
        alert('Mohon lengkapi field wajib pada Informasi Pelaksanaan (Area, Tanggal, PIC Pelaksana).');
        newSessionStep.value = 1;
        return;
      }
      if (draftSession.jenis === 'Backward' && !draftSession.noBatch.trim()) {
        alert('Mohon masukkan Nomor Batch Finished Good untuk penelusuran Backward.');
        newSessionStep.value = 2;
        return;
      }
      if (draftSession.jenis === 'Forward' && !draftSession.forward.namaBahan.trim()) {
        alert('Mohon masukkan Nama Bahan / Kode Lot untuk penelusuran Forward.');
        newSessionStep.value = 2;
        return;
      }

      if (newSessionMode.value === 'create') {
        const newSession = {
          id: draftSession.id,
          code: draftSession.code,
          createdAt: new Date().toISOString(),
          area: draftSession.area,
          tanggalPelaksanaan: draftSession.tanggalPelaksanaan,
          picPelaksana: draftSession.picPelaksana,
          fstl: draftSession.fstl,
          auditor: draftSession.auditor,
          auditee: draftSession.auditee,
          scenario: draftSession.scenario,
          gambarProduk: draftSession.gambarProduk,
          catatan: draftSession.catatan,
          jenis: draftSession.jenis,
          noBatch: draftSession.jenis === 'Backward' ? draftSession.noBatch.trim().toUpperCase() : '',
          tower: draftSession.tower,
          status: startImmediately ? 'running' : 'draft',
          manualWaktuStart: '',
          manualWaktuEnd: '',
          manualTotalWaktu: '',
          timer: {
            status: startImmediately ? 'running' : 'idle',
            startTime: startImmediately ? new Date().toISOString() : null,
            endTime: null,
            elapsedSeconds: 0,
            intervalId: null,
          },
          forward: { ...draftSession.forward },
          traceResult: null,
        };

        traceabilitySessions.unshift(newSession);
        saveSessionsToStorage();
        showNewSessionModal.value = false;

        if (startImmediately) {
          openSession(newSession);
          startTraceabilityAudit();
        } else {
          openSession(newSession);
        }
      } else {
        const existing = traceabilitySessions.find(s => s.id === draftSession.id);
        if (existing) {
          existing.area = draftSession.area;
          existing.tanggalPelaksanaan = draftSession.tanggalPelaksanaan;
          existing.picPelaksana = draftSession.picPelaksana;
          existing.fstl = draftSession.fstl;
          existing.auditor = draftSession.auditor;
          existing.auditee = draftSession.auditee;
          existing.scenario = draftSession.scenario;
          existing.gambarProduk = draftSession.gambarProduk;
          existing.catatan = draftSession.catatan;
          existing.jenis = draftSession.jenis;
          existing.noBatch = draftSession.jenis === 'Backward' ? draftSession.noBatch.trim().toUpperCase() : '';
          existing.tower = draftSession.tower;
          existing.forward = { ...draftSession.forward };
          saveSessionsToStorage();
          if (activeSessionId.value === existing.id) {
            syncSessionToGlobal(existing);
          }
        }
        showNewSessionModal.value = false;
      }
    }

    function deleteSession(sessionId) {
      if (authRole.value !== 'admin') {
        alert('Akses Ditolak: Hanya Super Admin yang berwenang menghapus sesi work order.');
        return;
      }
      const idx = traceabilitySessions.findIndex(s => s.id === sessionId);
      if (idx === -1) return;
      const target = traceabilitySessions[idx];
      const name = target.code || target.id;
      if (!confirm(`Hapus Work Order ${name} (${target.jenis} - ${target.noBatch || target.forward?.namaBahan})?`)) {
        return;
      }
      if (target.timer && target.timer.intervalId) {
        clearInterval(target.timer.intervalId);
      }
      traceabilitySessions.splice(idx, 1);
      saveSessionsToStorage();
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null;
      }
    }

    function loadPresetWorkOrder() {
      let exist = traceabilitySessions.find(s => s.noBatch === 'A370/26' && s.jenis === 'Backward');
      if (!exist) {
        createDefaultFSSCSession();
        exist = traceabilitySessions.find(s => s.noBatch === 'A370/26' && s.jenis === 'Backward');
      }
      if (exist) {
        openSession(exist);
      }
    }

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function formatTimeHHMM(d) {
      if (!d) return '-';
      const dt = (d instanceof Date) ? d : new Date(d);
      if (isNaN(dt.getTime())) return String(d);
      return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
    }

    function formatElapsedDuration(sec) {
      const s = Math.max(0, parseInt(sec, 10) || 0);
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      if (hrs > 0) return `${hrs} jam ${mins} menit ${secs} detik`;
      if (mins > 0) return `${mins} menit ${secs} detik`;
      return `${secs} detik`;
    }

    function formatStopwatch(sec) {
      const s = Math.max(0, parseInt(sec, 10) || 0);
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;
      if (hrs > 0) return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`;
      return `${pad2(mins)}:${pad2(secs)}`;
    }

    const auditSessionWaktuStart = computed(() => {
      if (auditSession.manualWaktuStart) return auditSession.manualWaktuStart;
      if (auditTimer.startTime) return formatTimeHHMM(auditTimer.startTime);
      return '08:06';
    });

    const auditSessionWaktuEnd = computed(() => {
      if (auditSession.manualWaktuEnd) return auditSession.manualWaktuEnd;
      if (auditTimer.status === 'running') return 'Sedang berjalan...';
      if (auditTimer.endTime) return formatTimeHHMM(auditTimer.endTime);
      return '11:36';
    });

    const auditSessionTotalWaktu = computed(() => {
      if (auditSession.manualTotalWaktu) return auditSession.manualTotalWaktu;
      if (auditTimer.status === 'running') {
        return `${formatElapsedDuration(auditTimer.elapsedSeconds)} (Sedang Dihitung)`;
      }
      if (auditTimer.status === 'completed' && auditTimer.elapsedSeconds > 0) {
        const hrs = Math.floor(auditTimer.elapsedSeconds / 3600);
        const mins = Math.floor((auditTimer.elapsedSeconds % 3600) / 60);
        if (hrs > 0) return `${hrs} jam ${mins} menit`;
        return `${mins} menit`;
      }
      return '3 jam 30 menit';
    });

    async function syncActiveAuditSession() {
      try {
        const res = await fetch('/api/trace/session/active');
        const data = await res.json();
        if (data.success && data.session) {
          applyServerSession(data.session);
        }
      } catch (_) {}
    }

    function applyServerSession(s) {
      if (!s) return;
      auditTimer.status = s.status || 'idle';

      if (s.status === 'running') {
        auditTimer.elapsedSeconds = s.elapsed_seconds || 0;
        if (s.start_time) auditTimer.startTime = new Date(s.start_time);
        auditSession.manualWaktuStart = formatTimeHHMM(auditTimer.startTime || new Date());

        // Otomatis arahkan semua tab PIC ke alur penelusuran jika batch belum dimuat
        const targetBatch = s.no_batch || 'A370/26';
        if (!traceResult.value || traceResult.value?.input?.noBatchFull !== targetBatch) {
          traceForm.noBatch = targetBatch;
          traceForm.tahun = s.tahun || 2026;
          traceForm.tower = s.tower || '1';
          if (activeTab.value !== 'pipeline') {
            activeTab.value = 'pipeline';
          }
          doTrace();
        }
      } else if (s.status === 'completed') {
        auditTimer.elapsedSeconds = s.duration_seconds || s.elapsed_seconds || 0;
        if (s.end_time) auditTimer.endTime = new Date(s.end_time);
        auditSession.manualWaktuEnd = formatTimeHHMM(auditTimer.endTime || new Date());

        const hrs = Math.floor(auditTimer.elapsedSeconds / 3600);
        const mins = Math.floor((auditTimer.elapsedSeconds % 3600) / 60);
        const secs = auditTimer.elapsedSeconds % 60;
        let durText = '';
        if (hrs > 0) durText = `${hrs} jam ${mins} menit`;
        else if (mins > 0) durText = `${mins} menit ${secs} detik`;
        else if (secs > 0) durText = `${secs} detik`;
        else durText = '< 1 detik';
        auditSession.manualTotalWaktu = durText;
      } else if (s.status === 'idle') {
        auditTimer.elapsedSeconds = 0;
        auditTimer.startTime = null;
        auditTimer.endTime = null;
      }

      // Sync verification from server session
      if (s.verification) {
        auditVerification.value = s.verification;
        if (traceResult.value?.packing && s.verification.helper_packing) {
          traceResult.value.packing.helper_packing = s.verification.helper_packing;
        }
        if (traceResult.value?.pa?.cip && s.verification.konsentrasi_lye) {
          ['evaporation', 'final_tank', 'extraction', 'dryer', 'rework'].forEach(k => {
            if (traceResult.value.pa.cip[k]) traceResult.value.pa.cip[k].konsentrasi_lye = s.verification.konsentrasi_lye;
          });
        }
      } else if (s.status === 'idle') {
        auditVerification.value = null;
      }
    }

    async function startTraceabilityAudit() {
      if (!isAdmin.value) {
        copiedToast.value = 'Hanya Super Admin yang berwenang memulai simulasi audit.';
        setTimeout(() => { copiedToast.value = ''; }, 3000);
        return;
      }

      if (auditSession.jenis === 'Backward' && !traceForm.noBatch) {
        traceForm.noBatch = 'A370/26';
      }
      applyBatchFormatting();

      try {
        const res = await fetch('/api/trace/session/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.sjaAuth ? window.sjaAuth.getAuthHeaders() : {})
          },
          body: JSON.stringify({
            no_batch: traceForm.noBatch || 'A370/26',
            tahun: traceForm.tahun || 2026,
            tower: traceForm.tower || '1'
          })
        });
        const data = await res.json();
        if (data.success && data.session) {
          applyServerSession(data.session);
          doTrace();
        } else {
          copiedToast.value = data.error || data.message || 'Gagal memulai sesi audit.';
          setTimeout(() => { copiedToast.value = ''; }, 3000);
        }
      } catch (err) {
        console.error('startTraceabilityAudit error:', err);
      }
    }

    async function stopTraceabilityAudit() {
      if (!isAdmin.value) {
        copiedToast.value = 'Waktu hanya dapat dihentikan oleh Admin atau saat verifikasi lengkap.';
        setTimeout(() => { copiedToast.value = ''; }, 3000);
        return;
      }
      try {
        const res = await fetch('/api/trace/session/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.sjaAuth ? window.sjaAuth.getAuthHeaders() : {})
          }
        });
        const data = await res.json();
        if (data.success && data.session) {
          applyServerSession(data.session);
        }
      } catch (err) {
        console.error('stopTraceabilityAudit error:', err);
      }
    }

    async function resetTraceabilityAudit() {
      if (!isAdmin.value) {
        copiedToast.value = 'Hanya Super Admin yang dapat me-reset simulasi audit.';
        setTimeout(() => { copiedToast.value = ''; }, 3000);
        return;
      }
      try {
        await fetch('/api/trace/session/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.sjaAuth ? window.sjaAuth.getAuthHeaders() : {})
          }
        });
        await resetAuditVerification();
        syncActiveAuditSession();
      } catch (err) {
        console.error('resetTraceabilityAudit error:', err);
      }
    }

    // ── Human-in-the-Loop Verifikasi Lapangan (Konsentrasi Lye & Helper Packing) ──
    const auditVerification = ref(null);
    const isVerificationModalOpen = ref(false);
    const verifSubmitting = ref(false);
    const verifForm = reactive({
      konsentrasi_lye: '3%',
      helper_packing: '',
      pic_pa: '',
      pic_produksi: ''
    });

    function openVerificationModal() {
      verifForm.konsentrasi_lye = auditVerification.value?.konsentrasi_lye || '3%';
      verifForm.helper_packing = auditVerification.value?.helper_packing || '';
      const userFullName = authUser.value?.full_name || '';
      if (authRole.value === 'pa') {
        verifForm.pic_pa = auditVerification.value?.pic_pa || userFullName || 'Analis PA';
        verifForm.pic_produksi = auditVerification.value?.pic_produksi || 'Frengky Wahyudi';
      } else if (authRole.value === 'produksi') {
        verifForm.pic_pa = auditVerification.value?.pic_pa || 'Huda';
        verifForm.pic_produksi = auditVerification.value?.pic_produksi || userFullName || 'Operator Produksi';
      } else {
        verifForm.pic_pa = auditVerification.value?.pic_pa || 'Huda';
        verifForm.pic_produksi = auditVerification.value?.pic_produksi || (userFullName || 'Frengky Wahyudi');
      }
      isVerificationModalOpen.value = true;
    }

    function closeVerificationModal() {
      isVerificationModalOpen.value = false;
    }

    let verificationPollInterval = null;

    function startVerificationSync() {
      if (verificationPollInterval) clearInterval(verificationPollInterval);
      verificationPollInterval = setInterval(async () => {
        if (auditTimer.status !== 'running') {
          clearInterval(verificationPollInterval);
          verificationPollInterval = null;
          return;
        }
        const batch = traceResult.value?.input?.noBatchFull || traceForm.noBatch;
        if (!batch) return;
        const tahun = traceResult.value?.input?.tahun || traceForm.tahun || 2026;
        const tower = traceResult.value?.input?.tower || traceForm.tower || '1';
        try {
          const res = await fetch(`/api/trace/verify/${encodeURIComponent(batch)}?tahun=${tahun}&tower=${tower}`);
          const data = await res.json();
          if (data.success && data.verification) {
            auditVerification.value = data.verification;
            if (data.verification.helper_packing && traceResult.value?.packing) {
              traceResult.value.packing.helper_packing = data.verification.helper_packing;
            }
            if (data.verification.konsentrasi_lye && traceResult.value?.pa?.cip) {
              ['evaporation', 'final_tank', 'extraction', 'dryer', 'rework'].forEach(k => {
                if (traceResult.value.pa.cip[k]) traceResult.value.pa.cip[k].konsentrasi_lye = data.verification.konsentrasi_lye;
              });
            }
            if (data.verification.konsentrasi_lye && data.verification.helper_packing) {
              if (data.verification.duration_seconds > 0) {
                auditTimer.elapsedSeconds = data.verification.duration_seconds;
              }
              stopTraceabilityAudit();
              if (isVerificationModalOpen.value) {
                isVerificationModalOpen.value = false;
              }
              copiedToast.value = `Seluruh verifikasi manual telah terpenuhi! Simulasi audit selesai dalam ${formatElapsedDuration(auditTimer.elapsedSeconds)}.`;
              setTimeout(() => { copiedToast.value = ''; }, 4000);
            }
          }
        } catch (_) {}
      }, 3000);
    }

    function stopVerificationSync() {
      if (verificationPollInterval) {
        clearInterval(verificationPollInterval);
        verificationPollInterval = null;
      }
    }

    async function submitVerification() {
      verifSubmitting.value = true;
      try {
        const batch = traceResult.value?.input?.noBatchFull || traceForm.noBatch || 'A370/26';
        const tahun = traceResult.value?.input?.tahun || traceForm.tahun || 2026;
        const tower = traceResult.value?.input?.tower || traceForm.tower || '1';

        const payload = {
          no_batch: batch,
          tahun,
          tower,
          duration_seconds: auditTimer.elapsedSeconds
        };

        if (isAdmin.value) {
          payload.konsentrasi_lye = verifForm.konsentrasi_lye || undefined;
          payload.helper_packing = verifForm.helper_packing || undefined;
          payload.pic_pa = verifForm.pic_pa || authUser.value?.full_name || 'Admin';
          payload.pic_produksi = verifForm.pic_produksi || authUser.value?.full_name || 'Admin';
        } else if (isPa.value) {
          payload.konsentrasi_lye = verifForm.konsentrasi_lye;
          payload.pic_pa = verifForm.pic_pa || authUser.value?.full_name || 'Analis PA';
        } else if (isProduksi.value) {
          payload.helper_packing = verifForm.helper_packing;
          payload.pic_produksi = verifForm.pic_produksi || authUser.value?.full_name || 'Operator Produksi';
        }

        const res = await fetch('/api/trace/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
          copiedToast.value = data.error || 'Gagal menyimpan verifikasi.';
          setTimeout(() => { copiedToast.value = ''; }, 3000);
          return;
        }

        auditVerification.value = data.verification;
        if (traceResult.value) {
          traceResult.value.verification = data.verification;
          if (traceResult.value.packing && data.verification.helper_packing) {
            traceResult.value.packing.helper_packing = data.verification.helper_packing;
          }
          if (traceResult.value.pa?.cip && data.verification.konsentrasi_lye) {
            ['evaporation', 'final_tank', 'extraction', 'dryer', 'rework'].forEach(k => {
              if (traceResult.value.pa.cip[k]) traceResult.value.pa.cip[k].konsentrasi_lye = data.verification.konsentrasi_lye;
            });
          }
        }

        const isComplete = Boolean(
          data.verification.konsentrasi_lye &&
          data.verification.helper_packing
        );

        isVerificationModalOpen.value = false;

        if (isComplete) {
          stopTraceabilityAudit();
          copiedToast.value = `Seluruh verifikasi manual terpenuhi! Audit selesai dalam ${formatElapsedDuration(auditTimer.elapsedSeconds)}.`;
          setTimeout(() => { copiedToast.value = ''; }, 3500);
        } else {
          if (isPa.value) {
            copiedToast.value = `Verifikasi PA berhasil disimpan (${data.verification.konsentrasi_lye}). Menunggu verifikasi Helper Packing dari PIC Produksi.`;
          } else if (isProduksi.value) {
            copiedToast.value = `Verifikasi Helper Packing berhasil disimpan. Menunggu verifikasi Konsentrasi Lye dari PIC PA.`;
          } else {
            copiedToast.value = `Data verifikasi tersimpan. Menunggu kelengkapan seluruh parameter agar audit selesai.`;
          }
          setTimeout(() => { copiedToast.value = ''; }, 4000);
        }
      } catch (err) {
        console.error('submitVerification error:', err);
        copiedToast.value = 'Terjadi kesalahan saat menyimpan verifikasi.';
        setTimeout(() => { copiedToast.value = ''; }, 3000);
      } finally {
        verifSubmitting.value = false;
      }
    }

    async function resetAuditVerification() {
      const batch = traceResult.value?.input?.noBatchFull || traceForm.noBatch || 'A370/26';
      const tahun = traceResult.value?.input?.tahun || traceForm.tahun || 2026;
      const tower = traceResult.value?.input?.tower || traceForm.tower || '1';
      try {
        await fetch('/api/trace/verify/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ no_batch: batch, tahun, tower })
        });
        auditVerification.value = null;
        if (traceResult.value) {
          traceResult.value.verification = null;
          if (traceResult.value.packing) traceResult.value.packing.helper_packing = '';
          if (traceResult.value.pa?.cip) {
            ['evaporation', 'final_tank', 'extraction', 'dryer', 'rework'].forEach(k => {
              if (traceResult.value.pa.cip[k]) traceResult.value.pa.cip[k].konsentrasi_lye = '-';
            });
          }
        }
        startTraceabilityAudit();
        copiedToast.value = 'Verifikasi di-reset. Simulasi audit dimulai kembali dari 0 detik.';
        setTimeout(() => { copiedToast.value = ''; }, 3500);
      } catch (err) {
        console.error('resetAuditVerification error:', err);
      }
    }

    const traceForm = reactive({
      noBatch: 'A370/26',
      tower: '1',
      tahun: 2026,
    });

    const availableYears = ref([2026, 2025]);

    async function loadAvailableYears() {
      try {
        const res = await fetch('/api/trace/years');
        const data = await res.json();
        if (data.years && Array.isArray(data.years) && data.years.length > 0) {
          availableYears.value = data.years;
          if (!availableYears.value.includes(traceForm.tahun)) {
            traceForm.tahun = availableYears.value[0];
          }
        }
      } catch (err) {
        console.error('loadAvailableYears error:', err);
      }
    }

    const expectedFormattedBatch = computed(() => {
      const pfx = String(traceForm.tower) === '2' ? 'B' : 'A';
      const yr2 = String(traceForm.tahun || 2026).slice(-2);
      return `${pfx}370/${yr2}`;
    });

    function applyBatchFormatting() {
      if (!traceForm.noBatch) return;
      const str = String(traceForm.noBatch).trim();
      if (!str) return;

      const pfx = String(traceForm.tower) === '2' ? 'B' : 'A';
      const yr2 = String(traceForm.tahun || 2026).slice(-2);

      const match = str.match(/([a-zA-Z]?)\s*(\d+)(?:\/(\d{2,4}))?/);
      if (match) {
        let num = match[2];
        if (num.length < 3) {
          num = num.padStart(3, '0');
        }
        let yr = yr2;
        if (match[3]) {
          const rawYr = match[3];
          yr = rawYr.length === 4 ? rawYr.slice(-2) : rawYr;
          const fullYr = parseInt(rawYr.length === 2 ? ('20' + rawYr) : rawYr, 10);
          if (!isNaN(fullYr) && traceForm.tahun !== fullYr) {
            traceForm.tahun = fullYr;
          }
        }
        let targetPfx = pfx;
        if (match[1]) {
          const l = match[1].toUpperCase();
          if (l === 'A') {
            targetPfx = 'A';
            traceForm.tower = '1';
          } else if (l === 'B') {
            targetPfx = 'B';
            traceForm.tower = '2';
          }
        }
        traceForm.noBatch = `${targetPfx}${num}/${yr}`;
      }
    }

    function onTowerDropdownChange() {
      const pfx = String(traceForm.tower) === '2' ? 'B' : 'A';
      if (traceForm.noBatch) {
        const m = String(traceForm.noBatch).trim().match(/^[a-zA-Z]?(\d+.*)$/);
        if (m) {
          traceForm.noBatch = `${pfx}${m[1]}`;
        }
      }
    }

    function onTahunDropdownChange() {
      const yr2 = String(traceForm.tahun || 2026).slice(-2);
      if (traceForm.noBatch && traceForm.noBatch.includes('/')) {
        traceForm.noBatch = traceForm.noBatch.split('/')[0] + '/' + yr2;
      }
    }

    function setTower(tw) {
      traceForm.tower = String(tw);
      onTowerDropdownChange();
    }

    function formatIndoDate(val, addYears = 0) {
      if (!val) return '-';
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const dt = new Date(val);
      if (isNaN(dt.getTime())) return String(val);
      const day = dt.getDate();
      const month = months[dt.getMonth()];
      const year = dt.getFullYear() + addYears;
      return `${day} ${month} ${year}`;
    }

    const headerNamaProduk = computed(() => {
      const d = traceResult.value;
      if (!d) return '-';
      return d.packing?.nama_produk || d.dryer?.nama_produk || '-';
    });

    const headerTanggalProduksi = computed(() => {
      const d = traceResult.value;
      if (!d) return '-';
      const raw = d.packing?.tanggal || d.dryer?.tanggal;
      return raw ? formatIndoDate(raw) : '-';
    });

    const headerBestBefore = computed(() => {
      const d = traceResult.value;
      if (!d) return '-';
      const raw = d.packing?.tanggal || d.dryer?.tanggal;
      return raw ? formatIndoDate(raw, 2) : '-';
    });

    const headerPin = computed(() => {
      const d = traceResult.value;
      if (!d) return '-';
      return d.packing?.pin || d.dryer?.pin || '-';
    });

    const headerNomorBox = computed(() => {
      const d = traceResult.value;
      if (!d) return '-';
      if (d.packing?.ok_box && Number(d.packing.ok_box) > 0) {
        const totalBox = Math.round(Number(d.packing.ok_box));
        return `p.001 - ${String(totalBox).padStart(3, '0')}`;
      }
      return '-';
    });

    const headerOutputKg = computed(() => {
      if (counterOutputKg.value > 0) return counterOutputKg.value;
      const d = traceResult.value;
      return Number(d?.packing?.total_output_kg) || 0;
    });

    const headerOutputBox = computed(() => {
      if (counterBox.value > 0) return counterBox.value;
      const d = traceResult.value;
      return d?.packing?.ok_box ? Math.round(Number(d.packing.ok_box)) : 0;
    });

    const headerYieldVal = computed(() => {
      if (counterYield.value !== null && counterYield.value > 0) return counterYield.value;
      const d = traceResult.value;
      const raw = d?.roasting?.yield_roasting_num ?? d?.mass_balance?.yield;
      if (raw !== undefined && raw !== null && !isNaN(Number(raw))) return Number(raw);
      if (d?.roasting?.yield_roasting) {
        const p = parseFloat(String(d.roasting.yield_roasting).replace(',', '.').replace('%', ''));
        if (!isNaN(p)) return p;
      }
      return null;
    });

    const headerRasioVal = computed(() => {
      const d = traceResult.value;
      return d?.calculations?.icRatio || d?.mass_balance?.icRatio || d?.mass_balance?.rasio_ic || null;
    });

    function getItemValue(key) {
      if (!key) return '-';
      const d = traceResult.value;
      if (!d) return '-';

      // Single Source of Truth: Shared Resolver (Pure MySQL from clusterTraceStore)
      if (typeof window.getTraceItemValue === 'function') {
        const sharedVal = window.getTraceItemValue(key, d);
        if (sharedVal !== undefined && sharedVal !== null && sharedVal !== '') {
          return sharedVal;
        }
      }

      // QC Auto-Mapped Keys
      if (d.qc && d.qc[key] !== undefined && d.qc[key] !== null) return String(d.qc[key]);
      return '-';
    }

    const picList = ['Produksi', 'PA', 'QC', 'FGW', 'RMW'];
    const miniPicList = [
      { code: 'PRD', key: 'Produksi', label: 'Divisi Produksi', desc: '11 Tabel Proses' },
      { code: 'PA',  key: 'PA',       label: 'Process Assurance', desc: '8 Tabel Verifikasi' },
      { code: 'QC',  key: 'QC',       label: 'Quality Control', desc: '22 Tabel Uji Mutu' },
      { code: 'FGW', key: 'FGW',      label: 'Gudang FG (FGW)', desc: 'Belum Ada Rekaman' },
      { code: 'RMW', key: 'RMW',      label: 'Bahan Baku (RMW)', desc: '2 Tabel GBB' },
      { code: 'ALL', key: 'Semua',    label: 'Semua Divisi', desc: '43 Tabel Database' },
    ];
    const towerOptions = ['Tower 1', 'Tower 2', 'Non-Tower / Semua'];
    const savedPic = (() => { try { return localStorage.getItem('traceability_selected_pic'); } catch { return null; } })();
    const savedTower = (() => { try { return localStorage.getItem('traceability_selected_tower'); } catch { return null; } })();
    const selectedPic = ref(savedPic && picList.includes(savedPic) ? savedPic : 'Produksi');
    const selectedTower = ref(savedTower && towerOptions.includes(savedTower) ? savedTower : 'Tower 1');
    const dataExplorerMenuOpen = ref(true);

    // ── Mini-Rail & Submenu 120 FPS Sliding Pill Indicators ──
    function updateMiniRailPill() {
      nextTick(() => {
        const container = document.getElementById('mini-rail-chips-container');
        const pill = document.getElementById('mini-rail-active-pill');
        if (!container || !pill) return;
        if (activeTab.value !== 'pic') {
          pill.style.opacity = '0';
          return;
        }
        const targetBtn = container.querySelector(`[data-mini-pic="${selectedPic.value}"]`);
        if (!targetBtn) {
          pill.style.opacity = '0';
          return;
        }
        pill.style.transform = `translate3d(0, ${targetBtn.offsetTop}px, 0)`;
        pill.style.opacity = '1';
      });
    }

    function updateSubmenuPill() {
      nextTick(() => {
        const container = document.getElementById('sidebar-submenu-container');
        const pill = document.getElementById('submenu-active-pill');
        if (!container || !pill) return;
        if (activeTab.value !== 'pic') {
          pill.style.opacity = '0';
          return;
        }
        const targetBtn = container.querySelector(`[data-sub-pic="${selectedPic.value}"]`);
        if (!targetBtn) {
          pill.style.opacity = '0';
          return;
        }
        pill.style.height = `${targetBtn.offsetHeight || 32}px`;
        pill.style.transform = `translate3d(0, ${targetBtn.offsetTop}px, 0)`;
        pill.style.opacity = '1';
      });
    }

    // ── Simpul Alur Proses (8 Flow Nodes) Sliding Pill Indicator ──
    function updateFlowStagePill() {
      nextTick(() => {
        const container = document.getElementById('flow-stage-chips-container');
        const pill = document.getElementById('flow-stage-active-pill');
        if (!container || !pill) return;
        const targetBtn = container.querySelector(`[data-flow-cluster="${selectedClusterKey.value}"]`);
        if (!targetBtn) {
          pill.style.opacity = '0';
          return;
        }
        const cRect = container.getBoundingClientRect();
        const bRect = targetBtn.getBoundingClientRect();
        if (bRect.width === 0 || bRect.height === 0) {
          pill.style.opacity = '0';
          return;
        }
        const offsetX = Math.round(bRect.left - cRect.left + (container.scrollLeft || 0));
        const offsetY = Math.round(bRect.top - cRect.top + (container.scrollTop || 0));
        pill.style.width = `${bRect.width}px`;
        pill.style.height = `${bRect.height}px`;
        pill.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        pill.style.opacity = '1';
      });
    }

    function updateAllPills() {
      updateSlidingPill();
      updateMiniRailPill();
      updateSubmenuPill();
      updateFlowStagePill();
    }

    watch([activeTab, sidebarOpen, selectedPic, dataExplorerMenuOpen, selectedClusterKey, activeSessionId, authIsLoggedIn], () => {
      updateAllPills();
      setTimeout(updateAllPills, 60);
      setTimeout(updateAllPills, 160);
      setTimeout(updateAllPills, 320);
      setTimeout(updateAllPills, 550);
    });

    function selectPicFromSidebar(pic) {
      activeTab.value = 'pic';
      changePic(pic);
      autoSelectFirstPicTable();
      nextTick(() => {
        updateAllPills();
      });
      setTimeout(updateAllPills, 60);
      setTimeout(updateAllPills, 160);
    }

    function toggleDataExplorerMenu() {
      if (activeTab.value !== 'pic') {
        activeTab.value = 'pic';
        dataExplorerMenuOpen.value = true;
        if (!picTableRows.value.length) loadPicTable(picSelectedTable.value, 1);
      } else {
        dataExplorerMenuOpen.value = !dataExplorerMenuOpen.value;
      }
      nextTick(() => {
        updateAllPills();
      });
      setTimeout(updateAllPills, 60);
      setTimeout(updateAllPills, 160);
    }

    const tables = reactive([
      // Produksi
      { key: 'dryer_tower_1',      label: 'Dryer Tower 1',      flow: 'DRYER',       pic: 'Produksi', tower: 'Tower 1', count: null },
      { key: 'dryer_tower_2',      label: 'Dryer Tower 2',      flow: 'DRYER',       pic: 'Produksi', tower: 'Tower 2', count: null },
      { key: 'extraction_tower_1', label: 'Extraction Tower 1', flow: 'EXTRACTION',  pic: 'Produksi', tower: 'Tower 1', count: null },
      { key: 'extraction_tower_2', label: 'Extraction Tower 2', flow: 'EXTRACTION',  pic: 'Produksi', tower: 'Tower 2', count: null },
      { key: 'evaporation_tower_1',label: 'Evaporation Tower 1',flow: 'EVAPORATION', pic: 'Produksi', tower: 'Tower 1', count: null },
      { key: 'evaporation_tower_2',label: 'Evaporation Tower 2',flow: 'EVAPORATION', pic: 'Produksi', tower: 'Tower 2', count: null },
      { key: 'roasting_probat',    label: 'Roasting Probat',    flow: 'ROASTING',    pic: 'Produksi', tower: 'Non-Tower', count: null },
      { key: 'roasting_scolari_1', label: 'Roasting Scolari 1', flow: 'ROASTING',    pic: 'Produksi', tower: 'Non-Tower', count: null },
      { key: 'roasting_scolari_2', label: 'Roasting Scolari 2', flow: 'ROASTING',    pic: 'Produksi', tower: 'Non-Tower', count: null },
      { key: 'packing_tower_1',    label: 'Packing Tower 1',    flow: 'PACKING',     pic: 'Produksi', tower: 'Tower 1', count: null },
      { key: 'packing_tower_2',    label: 'Packing Tower 2',    flow: 'PACKING',     pic: 'Produksi', tower: 'Tower 2', count: null },
      // QC Tower 1 (11 Tabel)
      { key: 'qc_rework_t1',       label: 'QC Rework T1',            flow: 'REWORK',      pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_dryer_t1',        label: 'QC Dryer T1',             flow: 'DRYER',       pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_feed_tank_t1',    label: 'QC Feed Tank T1',         flow: 'DRYER',       pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_final_tank_t1',   label: 'QC Final Tank T1',        flow: 'EVAPORATION', pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_evaporasi_t1',    label: 'QC Evaporasi T1',         flow: 'EVAPORATION', pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_tank_system_t1',  label: 'QC Tank System T1',       flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_pure_aroma_t1',   label: 'QC Pure Aroma T1',        flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_hydro_t1',        label: 'QC Hydro Extraction T1',  flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_aroma_t1',        label: 'QC Aroma Extraction T1',  flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_grinding_t1',     label: 'QC Grinding T1',          flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 1', count: null },
      { key: 'qc_mesh_t1',         label: 'QC Mesh Test T1',         flow: 'PACKING',     pic: 'QC', tower: 'Tower 1', count: null },
      // QC Tower 2 (11 Tabel Lengkap)
      { key: 'qc_rework_t2',       label: 'QC Rework T2',            flow: 'REWORK',      pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_dryer_t2',        label: 'QC Dryer T2',             flow: 'DRYER',       pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_feed_tank_t2',    label: 'QC Feed Tank T2',         flow: 'DRYER',       pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_final_tank_t2',   label: 'QC Final Tank T2',        flow: 'EVAPORATION', pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_evaporasi_t2',    label: 'QC Evaporasi T2',         flow: 'EVAPORATION', pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_tank_system_t2',  label: 'QC Tank System T2',       flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_pure_aroma_t2',   label: 'QC Pure Aroma T2',        flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_hydro_t2',        label: 'QC Hydro Extraction T2',  flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_aroma_t2',        label: 'QC Aroma Extraction T2',  flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_grinding_t2',     label: 'QC Grinding T2',          flow: 'EXTRACTION',  pic: 'QC', tower: 'Tower 2', count: null },
      { key: 'qc_mesh_t2',         label: 'QC Mesh Test T2',         flow: 'PACKING',     pic: 'QC', tower: 'Tower 2', count: null },
      // PA (Product Assurance) Tower 1 & Tower 2 (8 Tabel)
      { key: 'pa_fwt_t1',          label: 'FWT Tower 1',             flow: 'WATER PROCESS', pic: 'PA', tower: 'Tower 1', count: null },
      { key: 'pa_fwt_t2',          label: 'FWT Tower 2',             flow: 'WATER PROCESS', pic: 'PA', tower: 'Tower 2', count: null },
      { key: 'pa_cip_t1',          label: 'CIP Tower 1',             flow: 'CIP & SANITASI', pic: 'PA', tower: 'Tower 1', count: null },
      { key: 'pa_cip_t2',          label: 'CIP Tower 2',             flow: 'CIP & SANITASI', pic: 'PA', tower: 'Tower 2', count: null },
      { key: 'pa_emp_t1',          label: 'EMP Swab T1',             flow: 'PACKING',     pic: 'PA', tower: 'Tower 1', count: null },
      { key: 'pa_emp_t2',          label: 'EMP Swab T2',             flow: 'PACKING',     pic: 'PA', tower: 'Tower 2', count: null },
      { key: 'pa_abe_t1',          label: 'ABE Air Bacteria T1',     flow: 'PACKING',     pic: 'PA', tower: 'Tower 1', count: null },
      { key: 'pa_abe_t2',          label: 'ABE Air Bacteria T2',     flow: 'PACKING',     pic: 'PA', tower: 'Tower 2', count: null },
      // RMW (Raw Material Warehouse / GBB) (2 Tabel)
      { key: 'gbb_penerimaan',      label: 'Penerimaan Kopi Mentah',  flow: 'INCOMING BAHAN', pic: 'RMW', tower: 'Non-Tower', count: null },
      { key: 'gbb_transaksi_keluar',label: 'Pengeluaran ke UPBM',     flow: 'INCOMING BAHAN', pic: 'RMW', tower: 'Non-Tower', count: null },
    ]);

    const filteredTables = computed(() => {
      return tables.filter(t => {
        if (t.pic !== selectedPic.value) return false;
        if (selectedPic.value === 'RMW') return true;
        if (selectedTower.value === 'Non-Tower / Semua') return true;
        return t.tower === selectedTower.value || t.tower === 'Non-Tower';
      });
    });

    // ── Penampil Data PIC State & Methods ──
    const tableFilterQuery = ref('');

    const picFilteredTablesSearched = computed(() => {
      let list = picFilteredTables.value;
      if (tableFilterQuery.value) {
        const q = tableFilterQuery.value.toLowerCase().trim();
        list = list.filter(t => t.label.toLowerCase().includes(q) || t.key.toLowerCase().includes(q) || t.flow.toLowerCase().includes(q));
      }
      return list;
    });

    function getColumnInputType(colName, dataType = '') {
      const lower = colName.toLowerCase();
      const dt = String(dataType || '').toLowerCase();
      if (lower.includes('tanggal') || lower.includes('date') || dt.includes('date')) return 'date';
      if (lower.includes('waktu') || lower.includes('jam') || dt.includes('time')) return 'time';
      if (dt.includes('int') || dt.includes('decimal') || dt.includes('float') || dt.includes('double') ||
          ['suhu', 'temp', 'tekanan', 'press', 'brix', 'yield', 'speed', 'rpm', 'berat', 'kg', 'moisture', 'kadar', 'flow'].some(k => lower.includes(k))) {
        return 'number';
      }
      return 'text';
    }

    function formatFieldLabel(colName) {
      if (!colName) return '';
      return colName
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const savedTable = (() => { try { return localStorage.getItem('traceability_selected_table'); } catch { return null; } })();
    const picSelectedTable = ref(savedTable || 'dryer_tower_1');
    const picTableColumns = ref([]);
    const picTableRows = ref([]);
    const picTableLoading = ref(false);
    const picTableError = ref('');
    const picSearchQuery = ref('');
    const picFilterYear = ref('2026');
    const picFilterMonth = ref('');
    const picFilterDate = ref('');
    const picFilterStartDate = ref('');
    const picFilterEndDate = ref('');
    const picFilterBean = ref('');
    const dateRangeDropdownOpen = ref(false);
    const rangeCalendarYear = ref(2026);
    const rangeCalendarMonth = ref(new Date().getMonth());
    const tableEquipments = ref([]);
    const tableEquipmentCol = ref('');
    const searchDropdownOpen = ref(false);

    const rangeMonthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const rangeMonthYearLabel = computed(() => {
      return `${rangeMonthNames[rangeCalendarMonth.value]} ${rangeCalendarYear.value}`;
    });

    function prevRangeMonth() {
      if (rangeCalendarMonth.value === 0) {
        rangeCalendarMonth.value = 11;
        rangeCalendarYear.value--;
      } else {
        rangeCalendarMonth.value--;
      }
    }

    function nextRangeMonth() {
      if (rangeCalendarMonth.value === 11) {
        rangeCalendarMonth.value = 0;
        rangeCalendarYear.value++;
      } else {
        rangeCalendarMonth.value++;
      }
    }

    const picDateRangeDisplay = computed(() => {
      const s = picFilterStartDate.value;
      const e = picFilterEndDate.value;
      const fmt = (dStr) => {
        if (!dStr) return '';
        const parts = dStr.split('-');
        if (parts.length === 3) return `${parts[0]}.${parseInt(parts[1], 10)}.${parseInt(parts[2], 10)}`;
        return dStr;
      };
      if (s && e) {
        if (s === e) return fmt(s);
        return `${fmt(s)} ~ ${fmt(e)}`;
      }
      if (s) return `${fmt(s)} ~ ...`;
      if (picFilterDate.value) return fmt(picFilterDate.value);
      return '';
    });

    const rangeCalendarDays = computed(() => {
      const year = rangeCalendarYear.value;
      const month = rangeCalendarMonth.value;
      const firstDayIndex = new Date(year, month, 1).getDay();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
      const s = picFilterStartDate.value;
      const e = picFilterEndDate.value;
      const pad = n => String(n).padStart(2, '0');
      const todayStr = new Date().toISOString().slice(0, 10);
      const days = [];

      for (let i = 0; i < firstDayIndex; i++) {
        days.push({ day: null, dateStr: '', isCurrentMonth: false });
      }

      for (let d = 1; d <= totalDaysInMonth; d++) {
        const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
        const isStart = Boolean(s && s === dateStr);
        const isEnd = Boolean(e && e === dateStr);
        const inRange = Boolean(s && e && dateStr > s && dateStr < e);
        const isToday = dateStr === todayStr;

        days.push({
          day: d,
          dateStr,
          isCurrentMonth: true,
          isStart,
          isEnd,
          inRange,
          isToday
        });
      }
      return days;
    });

    function selectRangeDay(dayObj) {
      if (!dayObj || !dayObj.dateStr) return;
      const clicked = dayObj.dateStr;

      if (!picFilterStartDate.value || (picFilterStartDate.value && picFilterEndDate.value)) {
        picFilterStartDate.value = clicked;
        picFilterEndDate.value = '';
        picFilterDate.value = '';
      } else {
        if (clicked < picFilterStartDate.value) {
          picFilterEndDate.value = picFilterStartDate.value;
          picFilterStartDate.value = clicked;
        } else {
          picFilterEndDate.value = clicked;
        }
        picFilterDate.value = '';
        dateRangeDropdownOpen.value = false;
        searchPicTable();
      }
    }

    function applyRangePreset(preset) {
      const pad = n => String(n).padStart(2, '0');
      const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const now = new Date();

      if (preset === 'today') {
        const tStr = fmt(now);
        picFilterStartDate.value = tStr;
        picFilterEndDate.value = tStr;
      } else if (preset === '7days') {
        const past = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
        picFilterStartDate.value = fmt(past);
        picFilterEndDate.value = fmt(now);
      } else if (preset === '30days') {
        const past = new Date(now.getTime() - 29 * 24 * 3600 * 1000);
        picFilterStartDate.value = fmt(past);
        picFilterEndDate.value = fmt(now);
      } else if (preset === 'thisMonth') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        picFilterStartDate.value = fmt(first);
        picFilterEndDate.value = fmt(last);
      } else if (preset === 'clear') {
        picFilterStartDate.value = '';
        picFilterEndDate.value = '';
        picFilterDate.value = '';
      }

      if (picFilterStartDate.value) {
        const [y, m] = picFilterStartDate.value.split('-');
        rangeCalendarYear.value = parseInt(y, 10);
        rangeCalendarMonth.value = parseInt(m, 10) - 1;
      }

      dateRangeDropdownOpen.value = false;
      searchPicTable();
    }

    function clearDateRange() {
      picFilterStartDate.value = '';
      picFilterEndDate.value = '';
      picFilterDate.value = '';
      searchPicTable();
    }

    const filteredTableEquipments = computed(() => {
      if (!tableEquipments.value || !tableEquipments.value.length) return [];
      const q = (picSearchQuery.value || '').trim().toLowerCase();
      if (!q) return tableEquipments.value.slice(0, 40);
      return tableEquipments.value.filter(eq => String(eq).toLowerCase().includes(q)).slice(0, 40);
    });

    function selectSearchSuggestion(val) {
      picSearchQuery.value = val;
      searchDropdownOpen.value = false;
      searchPicTable();
    }

    function toggleSearchDropdown() {
      searchDropdownOpen.value = !searchDropdownOpen.value;
    }

    function onSearchInput() {
      searchDropdownOpen.value = true;
    }

    function onSearchFocus() {
      if (tableEquipments.value && tableEquipments.value.length > 0) {
        searchDropdownOpen.value = true;
      }
    }

    function onSearchBlur() {
      setTimeout(() => {
        searchDropdownOpen.value = false;
      }, 200);
    }

    async function loadTableEquipments(tblKey) {
      tableEquipments.value = [];
      tableEquipmentCol.value = '';
      if (!tblKey) return;
      try {
        const res = await fetch(`/api/import/${tblKey}/equipments`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.hasEquipment && Array.isArray(data.equipments)) {
          tableEquipments.value = data.equipments;
          tableEquipmentCol.value = data.equipmentCol;
        }
      } catch (e) {
        tableEquipments.value = [];
      }
    }

    const isRoastingTable = computed(() => {
      return String(picSelectedTable.value || '').toLowerCase().startsWith('roasting');
    });

    const isCipTable = computed(() => {
      return String(picSelectedTable.value || '').toLowerCase().includes('_cip_');
    });

    const picSearchPlaceholder = computed(() => {
      const tbl = String(picSelectedTable.value || '').toLowerCase();
      if (tbl.includes('_cip_')) return 'Cari Peralatan...';
      if (tbl.includes('_emp_')) return 'Cari Titik Uji / Area...';
      if (tbl.includes('_abe_')) return 'Cari Titik Uji / Area...';
      if (tbl.includes('_fwt_')) return 'Cari Parameter / Catatan...';
      if (tbl.startsWith('roasting')) return 'Cari Biji Kopi / Batch / Petugas...';
      return 'Cari Batch / Nama...';
    });

    const activeDateCol = computed(() => {
      const cols = picTableColumns.value || [];
      return cols.find(c => ['tanggal', 'date'].some(k => c.toLowerCase().includes(k))) || cols.find(c => c.toLowerCase().includes('stamp')) || 'Tanggal';
    });

    const beanOptions = [
      { value: '018 SB', label: '018 SB (Robusta Standar B)' },
      { value: '018 LT', label: '018 LT (Robusta Lampung/Lokal T)' },
      { value: '018 BY', label: '018 BY (Robusta Banyuwangi)' },
      { value: '019 VP', label: '019 VP (Robusta Varian P)' },
      { value: '019 LT', label: '019 LT (Robusta Varian LT)' },
      { value: '019 VO', label: '019 VO (Robusta Varian O)' },
      { value: '018 SK', label: '018 SK (Robusta Sukodono)' },
      { value: '018 ST', label: '018 ST (Robusta Standar T)' },
      { value: '018 SM', label: '018 SM (Robusta Standar M)' },
      { value: '018 IN', label: '018 IN (Robusta IN)' },
      { value: '06 BY', label: '06 BY' },
      { value: '06 AM', label: '06 AM' },
    ];

    function resetPicFilters() {
      picSearchQuery.value = '';
      searchDropdownOpen.value = false;
      picFilterDate.value = '';
      picFilterStartDate.value = '';
      picFilterEndDate.value = '';
      dateRangeDropdownOpen.value = false;
      picFilterBean.value = '';
      picFilterYear.value = '2026';
      picFilterMonth.value = '';
      searchPicTable();
    }

    const picPage = ref(1);
    const picLimit = ref(25);
    const picTotalRows = ref(0);
    const picTotalPages = ref(1);
    const pageJumpInput = ref(1);

    function goToPicPage(p) {
      let pageNum = parseInt(p, 10);
      if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
      if (pageNum > picTotalPages.value) pageNum = picTotalPages.value || 1;
      pageJumpInput.value = pageNum;
      loadPicTable(picSelectedTable.value, pageNum);
    }

    function jumpToPicPage() {
      goToPicPage(pageJumpInput.value);
    }

    const picFilteredTables = computed(() => {
      return tables.filter(t => {
        if (selectedPic.value !== 'Semua' && t.pic !== selectedPic.value) return false;
        if (selectedTower.value === 'Non-Tower / Semua') return true;
        return t.tower === selectedTower.value || t.tower === 'Non-Tower';
      });
    });

    const totalDatabaseRecords = computed(() => {
      const sum = tables.reduce((acc, t) => acc + (typeof t.count === 'number' ? t.count : 0), 0);
      return sum > 0 ? sum.toLocaleString('id-ID') : '...';
    });

    function getPicTablesCount(picName) {
      return tables.filter(t => t.pic === picName).length;
    }

    function getTableLabelByKey(tblKey) {
      const t = tables.find(x => x.key === tblKey);
      return t ? t.label : tblKey;
    }

    async function loadPicTable(tableName, page = 1) {
      if (tableName) picSelectedTable.value = tableName;
      picPage.value = page;
      pageJumpInput.value = page;
      picTableLoading.value = true;
      picTableError.value = '';
      try {
        const q = encodeURIComponent(picSearchQuery.value || '');
        const yr = encodeURIComponent(picFilterYear.value || '');
        const mo = isRoastingTable.value ? encodeURIComponent(picFilterMonth.value || '') : '';
        const dt = encodeURIComponent(picFilterDate.value || '');
        const sDate = encodeURIComponent(picFilterStartDate.value || '');
        const eDate = encodeURIComponent(picFilterEndDate.value || '');
        const bn = isRoastingTable.value ? encodeURIComponent(picFilterBean.value || '') : '';
        const res = await fetch(`/api/import/${picSelectedTable.value}/rows?page=${picPage.value}&limit=${picLimit.value}&search=${q}&year=${yr}&month=${mo}&date=${dt}&startDate=${sDate}&endDate=${eDate}&bean=${bn}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memuat baris data dari database.');
        picTableColumns.value = data.columns || [];
        picTableRows.value = data.rows || [];
        picTotalRows.value = data.totalRows || 0;
        picTotalPages.value = data.totalPages || 1;
        pageJumpInput.value = picPage.value;
      } catch (err) {
        picTableError.value = err.message;
        picTableRows.value = [];
      } finally {
        picTableLoading.value = false;
      }
    }

    function searchPicTable() {
      loadPicTable(picSelectedTable.value, 1);
    }

    function changePicTable(tblKey) {
      if (!tblKey) return;
      if (picSelectedTable.value === tblKey && picTableRows.value.length > 0) return;
      picSelectedTable.value = tblKey;
      picSearchQuery.value = '';
      searchDropdownOpen.value = false;
      picFilterDate.value = '';
      picFilterStartDate.value = '';
      picFilterEndDate.value = '';
      dateRangeDropdownOpen.value = false;
      picFilterBean.value = '';
      picFilterMonth.value = '';
      pageJumpInput.value = 1;
      loadTableEquipments(tblKey);
      loadPicTable(tblKey, 1);
      nextTick(() => {
        const el = document.getElementById('live-data-viewer');
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top < 60 || rect.bottom > window.innerHeight + 120) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    }

    function autoSelectFirstPicTable() {
      const avail = picFilteredTables.value;
      if (avail.length > 0 && !avail.some(t => t.key === picSelectedTable.value)) {
        changePicTable(avail[0].key);
      }
    }

    function selectFirstSearchedProcess() {
      const avail = picFilteredTablesSearched.value;
      if (avail && avail.length > 0) {
        changePicTable(avail[0].key);
      }
    }

    const inspectState = reactive({
      loading: false,
      detected: false,
      data: null,
      error: '',
      file: null,
      fileName: '',
      dragover: false,
    });

    const importState = reactive({
      importing: false,
      success: false,
      message: '',
    });

    const getTable = (key) => tables.find((t) => t.key === key);

    async function fetchCount(key) {
      try {
        const r = await fetch(`/api/import/${key}/count`);
        const d = await r.json();
        const t = getTable(key);
        if (t) t.count = d.count;
      } catch {}
    }

    async function refreshAllCounts() {
      await Promise.all(tables.map((t) => fetchCount(t.key)));
    }

    // ── Auto-Sync (10 Detik) & Refresh Data Explorer ──
    const isSyncingActiveTable = ref(false);
    const autoSyncEnabled = ref(false);
    const autoSyncCountdown = ref(10);
    const syncStatusMessage = ref('');
    let autoSyncInterval = null;

    async function refreshAndSyncActiveTable(silent = false) {
      if (isSyncingActiveTable.value) return;
      isSyncingActiveTable.value = true;

      // Jika bukan admin, hanya segarkan tampilan data lokal tanpa sinkronisasi Google Sheets
      if (authRole.value !== 'admin') {
        try {
          await Promise.all([
            refreshAllCounts(),
            loadPicTable(picSelectedTable.value, picPage.value),
          ]);
          if (!silent) syncStatusMessage.value = '✓ Tampilan data berhasil disegarkan dari database lokal.';
        } catch (e) {
          if (!silent) syncStatusMessage.value = 'Gagal memuat data: ' + e.message;
        } finally {
          isSyncingActiveTable.value = false;
        }
        return;
      }

      if (!silent) {
        syncStatusMessage.value = 'Menghubungi Google Sheets API & menarik seluruh data terbaru (Semua PIC & Semua Tabel secara real-time)...';
      }

      try {
        if (!silent) {
          // Tarik SEMUA data PIC (Produksi, QC, RMW) dan SEMUA Tabel secara lengkap & real-time
          const res = await fetch('/api/gsheet/sync-unified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ division: 'all', tower: 'all', force: true }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            const timeStr = new Date().toLocaleTimeString('id-ID');
            if (data.totalImported > 0) {
              syncStatusMessage.value = `✓ Berhasil menarik ${data.totalImported.toLocaleString()} baris data lengkap dari semua PIC & semua tabel (${timeStr}, durasi: ${data.durationSeconds})`;
            } else {
              syncStatusMessage.value = `✓ Seluruh data PIC & tabel Google Sheets sudah sinkron dan mutakhir secara real-time (${timeStr}, durasi: ${data.durationSeconds})`;
            }
          } else {
            const errMsg = data.error || data.message || 'Error tidak diketahui';
            if (errMsg.includes('sedang berjalan') || errMsg.includes('sedang berlangsung')) {
              syncStatusMessage.value = 'ℹ Proses sinkronisasi sedang berlangsung di latar belakang...';
            } else {
              syncStatusMessage.value = `Gagal: ${errMsg}`;
            }
          }
        } else {
          // Auto-sync 10s: Tarik tabel aktif secara berkala agar cepat & ringan
          const target = picSelectedTable.value;
          if (target) {
            const res = await fetch(`/api/gsheet/sync/${target}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ force: true }),
            });
            const data = await res.json();
            if (res.ok && data.success && data.imported > 0) {
              syncStatusMessage.value = `✓ Auto-Sync: Berhasil menarik ${data.imported.toLocaleString()} baris baru (${new Date().toLocaleTimeString('id-ID')})`;
            }
          }
        }
      } catch (err) {
        if (!silent) syncStatusMessage.value = 'Koneksi gagal: ' + err.message;
      } finally {
        isSyncingActiveTable.value = false;
        await Promise.all([
          refreshAllCounts(),
          loadPicTable(picSelectedTable.value, picPage.value),
        ]);
      }
    }

    function startAutoSync() {
      stopAutoSync();
      autoSyncEnabled.value = true;
      autoSyncCountdown.value = 10;
      autoSyncInterval = setInterval(async () => {
        if (activeTab.value !== 'pic') return;
        if (autoSyncCountdown.value > 1) {
          autoSyncCountdown.value -= 1;
        } else {
          autoSyncCountdown.value = 10;
          await refreshAndSyncActiveTable(true);
        }
      }, 1000);
    }

    function stopAutoSync() {
      autoSyncEnabled.value = false;
      if (autoSyncInterval) {
        clearInterval(autoSyncInterval);
        autoSyncInterval = null;
      }
      autoSyncCountdown.value = 10;
    }

    function toggleAutoSync() {
      if (autoSyncEnabled.value) {
        stopAutoSync();
      } else {
        startAutoSync();
      }
    }

    function changePic(p) {
      selectedPic.value = p;
      if (p === 'RMW') {
        selectedTower.value = 'Non-Tower / Semua';
      }
      if (inspectState.file) {
        inspectFile(inspectState.file);
      }
      nextTick(() => {
        updateAllPills();
      });
      setTimeout(updateAllPills, 60);
      setTimeout(updateAllPills, 160);
    }

    function changeTower(tow) {
      selectedTower.value = tow;
      if (inspectState.file) {
        inspectFile(inspectState.file);
      }
    }

    function triggerFileInput() {
      (document.getElementById('clean-excel-file') || document.getElementById('excel-auto-file'))?.click();
    }

    function onFileSelected(e) {
      const f = e.target.files[0];
      if (f) inspectFile(f);
    }

    function onDropFile(e) {
      inspectState.dragover = false;
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
        inspectFile(f);
      }
    }

    async function inspectFile(file) {
      inspectState.file = file;
      inspectState.fileName = file.name;
      inspectState.loading = true;
      inspectState.detected = false;
      inspectState.data = null;
      inspectState.error = '';
      importState.message = '';

      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('pic', selectedPic.value);
        fd.append('tower', selectedTower.value === 'Non-Tower / Semua' ? 'Semua' : selectedTower.value);

        const res = await fetch('/api/import/inspect', {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (data.detected) {
          if (data.valid === false) {
            inspectState.detected = false;
            inspectState.error = data.warning || data.message || 'Struktur kolom file tidak cocok.';
          } else {
            inspectState.detected = true;
            inspectState.data = data;
          }
        } else {
          inspectState.detected = false;
          inspectState.error = data.message || 'File tidak cocok dengan struktur tabel manapun.';
        }
      } catch (err) {
        inspectState.error = 'Gagal menganalisis file: ' + err.message;
      } finally {
        inspectState.loading = false;
      }
    }

    function resetAutoInspect() {
      inspectState.file = null;
      inspectState.fileName = '';
      inspectState.detected = false;
      inspectState.data = null;
      inspectState.error = '';
      const inp = document.getElementById('clean-excel-file') || document.getElementById('excel-auto-file');
      if (inp) inp.value = '';
    }

    async function executeAutoImport() {
      if (!inspectState.file || !inspectState.data) return;
      const targetTable = inspectState.data.table;
      importState.importing = true;
      importState.message = '';

      try {
        const fd = new FormData();
        fd.append('file', inspectState.file);

        const res = await fetch(`/api/import/${targetTable}`, {
          method: 'POST',
          body: fd,
        });
        const data = await res.json();
        if (res.ok) {
          importState.success = true;
          const impCount = Number(data.imported || 0).toLocaleString();
          const dupCount = Number(data.duplicates || data.skipped || 0).toLocaleString();
          let msg = '';
          if (data.imported === 0 && (data.duplicates > 0 || data.skipped > 0)) {
            msg = `Semua ${dupCount} baris data sudah ada di database (duplikat ditolak). Tidak ada data baru yang dimasukkan.`;
          } else {
            msg = `Berhasil! ${impCount} baris berhasil diimpor ke tabel ${targetTable}.`;
            if (data.duplicates > 0 || data.skipped > 0) {
              msg += ` (${dupCount} baris duplikat ditolak dan tidak dimasukkan ke database).`;
            }
          }
          importState.message = data.message || msg;
          await fetchCount(targetTable);
          resetAutoInspect();
        } else {
          importState.success = false;
          importState.message = `Gagal mengimpor: ${data.error || data.message}`;
        }
      } catch (err) {
        importState.success = false;
        importState.message = `Network error: ${err.message}`;
      } finally {
        importState.importing = false;
      }
    }

    const isClearingAll = ref(false);

    async function clearTable(key) {
      if (authRole.value !== 'admin') {
        alert('Akses Ditolak: Tindakan pengosongan data tabel hanya diizinkan untuk Super Admin.');
        return;
      }
      const target = key || picSelectedTable.value;
      if (!target) return;
      const label = getTableLabelByKey(target) || target;
      if (!confirm(`⚠️ PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA pada tabel "${label}" (${target})?\n\nTindakan ini akan mengosongkan seluruh baris data dan mereset urutan ID ke 1.\n\nLanjutkan?`)) return;
      try {
        const res = await fetch(`/api/import/${target}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          const t = getTable(target);
          if (t) t.count = 0;
          await fetchCount(target);
          if (picSelectedTable.value === target) {
            await loadPicTable(target, 1);
          }
          alert(data.message || `Tabel ${label} berhasil dikosongkan.`);
        } else {
          alert('Gagal menghapus data tabel: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Gagal menghapus data tabel: ' + err.message);
      }
    }

    async function clearAllTables() {
      if (authRole.value !== 'admin') {
        alert('Akses Ditolak: Tindakan pengosongan seluruh database hanya diizinkan untuk Super Admin.');
        return;
      }
      if (isClearingAll.value) return;
      if (!confirm('⚠️ PERINGATAN KRITIS: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA di SELURUH TABEL (33 tabel database)?\n\nTindakan ini akan mengosongkan seluruh rekaman data produksi dan QC serta mereset urutan ID ke 1.\n\nApakah Anda benar-benar yakin ingin melanjutkan?')) return;
      isClearingAll.value = true;
      try {
        const res = await fetch('/api/import/all/clear-all', { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          tables.forEach(t => { t.count = 0; });
          await refreshAllCounts();
          if (picSelectedTable.value) {
            await loadPicTable(picSelectedTable.value, 1);
          }
          alert(data.message || 'Seluruh data pada 33 tabel database berhasil dikosongkan.');
        } else {
          alert('Gagal menghapus seluruh tabel: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Gagal menghapus seluruh tabel: ' + err.message);
      } finally {
        isClearingAll.value = false;
      }
    }

    async function deleteTableRow(key, row) {
      if (authRole.value !== 'admin') {
        alert('Akses Ditolak: Tindakan penghapusan baris data hanya diizinkan untuk Super Admin.');
        return;
      }
      const target = key || picSelectedTable.value;
      if (!row || !row.id) {
        alert('Baris ini tidak memiliki kolom ID unik.');
        return;
      }
      const label = row.Batch || row['Batch Finished Good'] || row.Tanggal || `ID #${row.id}`;
      if (!confirm(`Hapus rekaman baris [${label}] dari tabel "${getTableLabelByKey(target)}"?`)) return;
      try {
        const res = await fetch(`/api/import/${target}/row/${row.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          await fetchCount(target);
          await loadPicTable(target, picPage.value);
        } else {
          alert('Gagal menghapus baris: ' + (data.error || 'Terjadi kesalahan'));
        }
      } catch (err) {
        alert('Gagal menghapus baris: ' + err.message);
      }
    }

    async function doTrace() {
      applyBatchFormatting();
      if (!traceForm.noBatch) return;
      tracing.value = true;
      traceError.value = '';
      try {
        const p = new URLSearchParams({
          noBatchFull: traceForm.noBatch,
          tower: traceForm.tower,
          tahun: String(traceForm.tahun || 2026),
        });
        const res = await fetch(`/api/trace?${p.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          traceError.value = data.error || 'Terjadi kesalahan pada server.';
        } else {
          traceResult.value = data;
          if (data.input?.tower) {
            traceForm.tower = data.input.tower;
          }
          if (data.input?.tahun) {
            traceForm.tahun = data.input.tahun;
          }
          if (activeSession.value) {
            activeSession.value.traceResult = data;
            saveSessionsToStorage();
          }
          if (activeTab.value === 'dashboard') {
            activeTab.value = 'pipeline';
          }
          triggerCounters();

          // Human-in-the-Loop Verifikasi Audit (Konsentrasi Lye & Helper Packing)
          const isComplete = Boolean(
            data.verification &&
            data.verification.konsentrasi_lye &&
            data.verification.helper_packing
          );

          if (isComplete) {
            auditVerification.value = data.verification;
            if (data.verification.duration_seconds > 0) {
              auditTimer.elapsedSeconds = data.verification.duration_seconds;
            }
            if (auditTimer.status === 'running') {
              stopTraceabilityAudit();
            }
          } else {
            auditVerification.value = data.verification || null;
            if (auditTimer.status === 'running') {
              startVerificationSync();
            }
          }

          pushNotifSent.value = false;
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            setTimeout(() => {
              sendDesktopPushNotification();
            }, 600);
          }
        }
      } catch (err) {
        traceError.value = `Gagal terhubung ke API trace: ${err.message}`;
      } finally {
        tracing.value = false;
      }
    }

    function loadPresetAudit() {
      traceForm.noBatch = 'A370/26';
      traceForm.tower = '1';
      traceForm.tahun = 2026;
      auditSession.jenis = 'Backward';
      selectedClusterKey.value = 'distribusi';
      auditSession.area = 'SJA Sukodono';
      auditSession.tanggalPelaksanaan = '13 Oktober 2026';
      auditSession.picPelaksana = 'Frengky Wahyudi';
      auditSession.scenario = 'Simulasi traceability untuk audit eksternal FSSC';
      auditSession.auditor = 'Pak Armando\nIbu Asih';
      auditSession.auditee = 'Meisy, Dini, Udin, Yolanda';
      auditSession.fstl = 'Suhendar Adikusuma';
      auditSession.manualWaktuStart = '08:06';
      auditSession.manualWaktuEnd = '11:36';
      auditSession.manualTotalWaktu = '3 jam 30 menit';
      auditTimer.status = 'completed';
      if (auditTimer.intervalId) {
        clearInterval(auditTimer.intervalId);
        auditTimer.intervalId = null;
      }
      if (activeSession.value) {
        activeSession.value.noBatch = 'A370/26';
        activeSession.value.tower = '1';
        activeSession.value.jenis = 'Backward';
        activeSession.value.area = 'SJA Sukodono';
        activeSession.value.tanggalPelaksanaan = '13 Oktober 2026';
        activeSession.value.picPelaksana = 'Frengky Wahyudi';
        activeSession.value.scenario = 'Simulasi traceability untuk audit eksternal FSSC';
        activeSession.value.auditor = 'Pak Armando\nIbu Asih';
        activeSession.value.auditee = 'Meisy, Dini, Udin, Yolanda';
        activeSession.value.fstl = 'Suhendar Adikusuma';
        activeSession.value.manualWaktuStart = '08:06';
        activeSession.value.manualWaktuEnd = '11:36';
        activeSession.value.manualTotalWaktu = '3 jam 30 menit';
        activeSession.value.status = 'completed';
        saveSessionsToStorage();
      }
      doTrace();
    }

    function printForm() {
      activeTab.value = 'report';
      reportViewMode.value = 'document';
      nextTick(() => {
        setTimeout(() => {
          window.print();
        }, 150);
      });
    }

    window.addEventListener('beforeprint', () => {
      if (activeTab.value === 'report' && reportViewMode.value !== 'document') {
        reportViewMode.value = 'document';
      }
    });



    // ── Parameter Kritis SCADA Inspection ──
    function isParamKritis(key) {
      return [
        'dryer_parameter_kritis',
        'evap_parameter_kritis',
        'ext_parameter_kritis',
        'roast_parameter_kritis',
      ].includes(key);
    }

    function getProcessKey(key) {
      if (key === 'dryer_parameter_kritis') return 'dryer';
      if (key === 'evap_parameter_kritis') return 'evaporation';
      if (key === 'ext_parameter_kritis') return 'extraction';
      if (key === 'roast_parameter_kritis') return 'roasting';
      return '';
    }

    function getProcessTitle(key) {
      const tw = traceResult.value?.input?.tower || traceForm.tower || '1';
      if (key === 'dryer_parameter_kritis') return 'Dryer Tower ' + tw;
      if (key === 'evap_parameter_kritis') return 'Evaporation Tower ' + tw;
      if (key === 'ext_parameter_kritis') return 'Extraction Tower ' + tw;
      if (key === 'roast_parameter_kritis') return 'Roasting Probat';
      return '';
    }

    function getProcessColumns(key) {
      const p = getProcessKey(key);
      return traceResult.value?.[p]?.columns || [];
    }

    function getProcessRows(key) {
      const p = getProcessKey(key);
      return traceResult.value?.[p]?.raw_rows || [];
    }

    const activeModalProcess = ref(null);

    function formatColHeader(col) {
      if (!col) return '';
      return String(col).replace(/\s+/g, ' ').trim();
    }

    function formatParamCell(val, colName = '') {
      if (val === null || val === undefined || val === '') return '-';
      const sVal = String(val).trim();
      const lowerCol = String(colName || '').toLowerCase();

      // Excel date serial number check (e.g. 45881 -> 12/08/2025)
      if (!isNaN(Number(sVal)) && Number(sVal) > 30000 && Number(sVal) < 60000 && (lowerCol.includes('tanggal') || lowerCol.includes('stamp'))) {
        const d = new Date(Math.round((Number(sVal) - 25569) * 86400 * 1000));
        const pad = (n) => String(n).padStart(2, '0');
        if (lowerCol.includes('stamp')) {
          return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
        }
        return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
      }

      // Excel time fraction check (e.g. 0.784027 -> 18:49)
      if (lowerCol.includes('waktu') && !isNaN(Number(sVal)) && Number(sVal) > 0 && Number(sVal) < 1) {
        const totalSec = Math.round(Number(sVal) * 86400);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        return `${h}:${m}`;
      }

      // Tanggal & Waktu combined column: format to DD/MM/YYYY HH:mm
      if (lowerCol.includes('tanggal') && lowerCol.includes('waktu')) {
        const d = new Date(new Date(sVal).getTime() + 30000);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }

      // E. Coli & Coliform micro indicators
      if ((lowerCol.includes('coli') || lowerCol.includes('coliform')) && (sVal === '0' || sVal.toLowerCase() === 'negatif')) {
        return 'Negatif';
      }

      // Tanggal column: format to DD/MM/YYYY with +30s drift compensation
      if (lowerCol.includes('tanggal')) {
        const d = new Date(new Date(sVal).getTime() + 30000);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
        }
      }

      // Waktu column or time values with 1899-12-30
      if (lowerCol.includes('waktu') || sVal.includes('1899-12-30')) {
        const timeMatch = sVal.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch) {
          return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
        }
      }

      // Stamp column
      if (lowerCol === 'stamp' || lowerCol === 'stamp:' || lowerCol === 'stamp:+1') {
        const d = new Date(new Date(sVal).getTime() + 30000);
        if (!isNaN(d.getTime())) {
          const pad = (n) => String(n).padStart(2, '0');
          return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }

      // Susut Goreng: format as percentage (e.g. -0.1240788688 -> -12.41%)
      if (lowerCol.includes('susut')) {
        const num = parseFloat(sVal.replace(',', '.'));
        if (!isNaN(num)) {
          return (num * 100).toFixed(2) + '%';
        }
      }

      // Long float numbers: limit to 2 decimal places (or 3 decimals for pH & Conductivity)
      const num = parseFloat(sVal.replace(',', '.'));
      if (!isNaN(num) && sVal.includes('.') && sVal.split('.')[1].length > 2 && !sVal.includes('/')) {
        if (lowerCol.includes('ph') || lowerCol.includes('cond') || lowerCol.includes('conduct')) {
          return num.toFixed(3);
        }
        return num.toFixed(2);
      }

      return sVal;
    }

    function getProcessTitleByKey(procKey) {
      const tw = traceResult.value?.input?.tower || traceForm.tower || '1';
      if (procKey === 'packing') return 'Packing Tower ' + tw;
      if (procKey === 'dryer') return 'Dryer Tower ' + tw;
      if (procKey === 'evaporation') return 'Evaporation Tower ' + tw;
      if (procKey === 'extraction') return 'Extraction Tower ' + tw;
      if (procKey === 'roasting') return 'Roasting Probat';
      return '';
    }

    function getProcessColumnsByKey(procKey) {
      return traceResult.value?.[procKey]?.columns || [];
    }

    function getProcessRowsByKey(procKey) {
      return traceResult.value?.[procKey]?.raw_rows || [];
    }

    // Auto-init on mount and scroll reveal
    onMounted(async () => {
      loadAvailableYears();
      window.addEventListener('click', (e) => {
        const el = document.getElementById('pic-date-range-container');
        if (el && !el.contains(e.target)) {
          dateRangeDropdownOpen.value = false;
        }
      });
      // Scroll-adaptive listener for floating sidebar logo & header
      window.addEventListener('scroll', handleScrollHeader, { passive: true });
      document.addEventListener('scroll', handleScrollHeader, { passive: true });
      // Also listen on main content scroll
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.addEventListener('scroll', handleScrollHeader, { passive: true });
      handleScrollHeader();
      if ('IntersectionObserver' in window) {
        const topbar = document.querySelector('header');
        if (topbar) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || entry.boundingClientRect.bottom <= 20) {
                isScrolledPastHeader.value = true;
              } else {
                isScrolledPastHeader.value = false;
              }
            });
          }, { threshold: [0, 0.1, 0.5, 1.0] });
          obs.observe(topbar);
        }
      }

      // Start Real-Time Operational Clock
      updateClock();
      setInterval(updateClock, 1000);

      // Zero-lag smooth portal animation trigger after DOM paint settles
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          portalRevealed.value = true;
        });
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeInspectModal.value) {
          closeInspectModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          const searchInput = document.getElementById('batch-search-input');
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
        }
      });
      if (window.sjaAuth) {
        try { await window.sjaAuth.initAuth(); } catch (e) { console.warn(e); }
      }
      try {
        const savedUser = localStorage.getItem('sja_saved_username');
        if (savedUser) {
          loginForm.username = savedUser;
          rememberMe.value = true;
        }
      } catch {}
      nextTick(() => {
        if (!authIsLoggedIn.value && usernameInputRef.value) {
          usernameInputRef.value.focus();
        }
      });
      try {
        const r = await fetch('/api/health');
        dbConnected.value = r.ok;
      } catch {
        dbConnected.value = false;
      }
      refreshAllCounts();
      loadSessionsFromStorage();
      loadTableEquipments(picSelectedTable.value || 'dryer_tower_1');
      loadPicTable(picSelectedTable.value || 'dryer_tower_1', 1);

      // Real-Time Global Audit Session Synchronization (Lintas Tab & Multi-Device)
      await syncActiveAuditSession();
      setInterval(syncActiveAuditSession, 1500);
      setInterval(() => {
        if (auditTimer.status === 'running') {
          auditTimer.elapsedSeconds++;
        }
      }, 1000);

      // Auto-fetch fresh trace from database on mount if batch is specified
      if (traceForm.noBatch) {
        doTrace(true);
      }

      const initialHash = activeTab.value === 'pic' ? 'data-explorer' : activeTab.value;
      try {
        history.replaceState({ tab: activeTab.value }, '', '#' + initialHash);
      } catch {}
      nextTick(() => {
        updateAllPills();
      });
      let resizeTimer = null;
      const onWindowResize = () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          requestAnimationFrame(updateAllPills);
        }, 100);
      };
      window.addEventListener('resize', onWindowResize, { passive: true });
      const asideEl = document.querySelector('.app-sidebar');
      if (asideEl) {
        // Saat transisi mulai — kunci overflow agar konten ter-clip rapi
        asideEl.addEventListener('transitionstart', (e) => {
          if (e.propertyName === 'width') {
            asideEl.style.overflow = 'hidden';
          }
        });
        // Setelah transisi selesai — buka overflow agar tooltip bisa muncul keluar
        asideEl.addEventListener('transitionend', (e) => {
          if (e.propertyName === 'width') {
            asideEl.style.overflow = '';
            updateAllPills();
          }
        });
      }
    });

    watch(traceResult, (newVal) => {
      if (newVal) {
        triggerCounters();
      }
    }, { immediate: true });

    watch(authIsLoggedIn, (val) => {
      if (val) {
        document.documentElement.classList.add('logged-in');
        if (document.body) document.body.classList.add('logged-in');
        nextTick(() => {
          updateAllPills();
          setTimeout(updateAllPills, 120);
        });
      } else {
        document.documentElement.classList.remove('logged-in');
        if (document.body) document.body.classList.remove('logged-in');
      }
    }, { immediate: true });

    watch(selectedPic, (v) => { try { localStorage.setItem('traceability_selected_pic', v); } catch {} });
    watch(selectedTower, (v) => { try { localStorage.setItem('traceability_selected_tower', v); } catch {} });
    watch(picSelectedTable, (v) => { try { localStorage.setItem('traceability_selected_table', v); } catch {} });

    let isNavigatingFromHistory = false;

    watch(activeTab, (newTab) => {
      if (newTab === 'pic' && !picTableRows.value.length) {
        loadTableEquipments(picSelectedTable.value || 'dryer_tower_1');
        loadPicTable(picSelectedTable.value || 'dryer_tower_1', 1);
      }
      try {
        localStorage.setItem('traceability_active_tab', newTab);
        const hashTag = newTab === 'pic' ? 'data-explorer' : newTab;
        if (window.location.hash !== '#' + hashTag) {
          if (!isNavigatingFromHistory) {
            history.pushState({ tab: newTab }, '', '#' + hashTag);
          } else {
            history.replaceState({ tab: newTab }, '', '#' + hashTag);
          }
        }
      } catch {}
      isNavigatingFromHistory = false;
    });

    // ── Browser History Navigation (Back / Forward Button Support) ──
    window.addEventListener('popstate', (e) => {
      // 1. Jika ada inspect modal yang sedang terbuka, tutup modal terlebih dahulu saat user menekan Back
      if (activeInspectModal.value) {
        closeInspectModal();
        return;
      }
      // 2. Baca target tab dari state history atau dari hash URL
      const hash = window.location.hash.replace('#', '').toLowerCase();
      let targetTab = e.state?.tab;
      if (!targetTab) {
        targetTab = (hash === 'data-explorer' || hash === 'explorer') ? 'pic' : (validTabs.includes(hash) ? hash : 'dashboard');
      }
      if (validTabs.includes(targetTab) && activeTab.value !== targetTab) {
        isNavigatingFromHistory = true;
        activeTab.value = targetTab;
      }
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const tab = hash === 'data-explorer' || hash === 'explorer' ? 'pic' : hash;
      if (validTabs.includes(tab) && activeTab.value !== tab) {
        isNavigatingFromHistory = true;
        activeTab.value = tab;
      }
    });

    return {
      ingestionTab,
      ingestionStep,
      ingestionConfirmed,
      ingestionSubmitting,
      sheetSyncMode,
      sheetTower,
      sheetDivision,
      sheetSinglePic,
      sheetSingleTower,
      sheetSingleTable,
      sheetSingleAvailableTables,
      manualPic,
      manualTableKey,
      manualTower,
      manualColumns,
      manualColumnsLoading,
      manualFormValues,
      manualAvailablePics,
      manualFilteredTables,
      onSheetSingleTowerChange,
      onSheetSinglePicChange,
      previewSummary,
      previewColumns,
      previewRows,
      previewTargetInfo,
      lastIngestionSuccess,
      setIngestionTab,
      goToInspectPreview,
      goToSheetPreview,
      goToManualPreview,
      executeConfirmedIngestion,
      resetIngestion,
      onManualPicChange,
      onManualTableChange,
      onManualTowerChange,
      counterOutputKg,
      counterBox,
      counterYield,
      triggerCounters,
      tableFilterQuery,
      picFilteredTablesSearched,
      getColumnInputType,
      formatFieldLabel,
      selectedClusterKey,
      clusterConfigList,
      clusterDataStore,
      activeCluster,
      selectCluster,
      previewDrawerOpen,
      previewTableData,
      openTablePreview,
      closeTablePreview,
      openProdTables,
      openQcTables,
      openPaTables,
      openCipChecklists,
      showReportCipTable,
      cipChecklistFilter,
      toggleFlowCipChecklist,
      setCipChecklistFilter,
      filteredCipItems,
      toggleFlowProdTable,
      toggleFlowQcTable,
      toggleFlowPaTable,
      activeInspectModal,
      inspectSearchInput,
      inspectSearchQuery,
      inspectCipFilter,
      openInspectCip,
      openInspectEmp,
      openInspectAbe,
      openInspectScada,
      openInspectProd,
      openInspectQc,
      openInspectQcChecklist,
      inspectQcMode,
      filteredInspectQcItems,
      filteredInspectQcRawRows,
      openInspectPa,
      closeInspectModal,
      filteredInspectCipItems,
      filteredInspectEmpItems,
      filteredInspectAbeItems,
      filteredInspectTableRows,
      inspectTableAverages,
      shouldShowInspectAverages,
      inspectCalcMode,
      inspectCalculations,
      explorerCalcMode,
      explorerCalculations,
      getCalcModeLabel,
      picTableAverages,
      cleanSectionTitle,
      getProdRole,
      getQcRole,
      formatMetricVal,
      isMissingVal,
      openRawTables,
      flowRawDataCache,
      flowRawLoading,
      toggleFlowRawTable,
      getFlowColumns,
      getFlowRows,
      sidebarOpen,
      isScrolledPastHeader,
      updateSlidingPill,
      updateMiniRailPill,
      updateSubmenuPill,
      updateFlowStagePill,
      updateAllPills,
      picSelectedTable,
      picTableColumns,
      picTableRows,
      picTableLoading,
      picTableError,
      picSearchQuery,
      searchDropdownOpen,
      filteredTableEquipments,
      selectSearchSuggestion,
      toggleSearchDropdown,
      onSearchInput,
      onSearchFocus,
      onSearchBlur,
      picFilterYear,
      picFilterMonth,
      picFilterDate,
      picFilterStartDate,
      picFilterEndDate,
      dateRangeDropdownOpen,
      rangeCalendarYear,
      rangeCalendarMonth,
      rangeMonthYearLabel,
      prevRangeMonth,
      nextRangeMonth,
      picDateRangeDisplay,
      rangeCalendarDays,
      selectRangeDay,
      applyRangePreset,
      clearDateRange,
      picFilterBean,
      tableEquipments,
      tableEquipmentCol,
      loadTableEquipments,
      beanOptions,
      isRoastingTable,
      isCipTable,
      picSearchPlaceholder,
      activeDateCol,
      resetPicFilters,
      picPage,
      picLimit,
      picTotalRows,
      picTotalPages,
      pageJumpInput,
      goToPicPage,
      jumpToPicPage,
      picFilteredTables,
      getPicTablesCount,
      getTableLabelByKey,
      loadPicTable,
      searchPicTable,
      changePicTable,
      autoSelectFirstPicTable,
      selectFirstSearchedProcess,
      activeTab,
      tracing,
      traceError,
      traceResult,
      dbConnected,
      today,
      traceForm,
      availableYears,
      expectedFormattedBatch,
      applyBatchFormatting,
      onTowerDropdownChange,
      onTahunDropdownChange,
      setTower,
      headerNamaProduk,
      headerTanggalProduksi,
      headerBestBefore,
      headerPin,
      headerNomorBox,
      headerOutputKg,
      headerOutputBox,
      headerYieldVal,
      headerRasioVal,
      flowSections,
      tables,
      totalDatabaseRecords,
      getItemValue,
      clearTable,
      clearAllTables,
      isClearingAll,
      deleteTableRow,
      doTrace,
      loadPresetAudit,
      printForm,
      refreshAllCounts,
      isSyncingActiveTable,
      autoSyncEnabled,
      autoSyncCountdown,
      syncStatusMessage,
      refreshAndSyncActiveTable,
      toggleAutoSync,
      isParamKritis,
      getProcessKey,
      getProcessTitle,
      getProcessColumns,
      getProcessRows,
      getProcessTitleByKey,
      getProcessColumnsByKey,
      getProcessRowsByKey,
      formatParamCell,
      formatColHeader,
      picList,
      miniPicList,
      towerOptions,
      selectedPic,
      selectedTower,
      dataExplorerMenuOpen,
      selectPicFromSidebar,
      toggleDataExplorerMenu,
      changePic,
      changeTower,
      inspectState,
      importState,
      filteredTables,
      triggerFileInput,
      onFileSelected,
      onDropFile,
      inspectFile,
      resetAutoInspect,
      executeAutoImport,
      missingDataSummary,
      showMissingDataModal,
      pushPermission,
      pushNotifSent,
      triggerPushNotification,
      requestBrowserPushNotification,
      auditSession,
      auditTimer,
      showAuditDetails,
      formatStopwatch,
      formatElapsedDuration,
      auditSessionWaktuStart,
      auditSessionWaktuEnd,
      auditSessionTotalWaktu,
      startTraceabilityAudit,
      stopTraceabilityAudit,
      resetTraceabilityAudit,
      auditVerification,
      isVerificationModalOpen,
      verifSubmitting,
      verifForm,
      openVerificationModal,
      closeVerificationModal,
      submitVerification,
      resetAuditVerification,
      // Work Order Multi-Session Exports
      traceabilitySessions,
      activeSessionId,
      activeSession,
      sessionStats,
      showNewSessionModal,
      newSessionStep,
      newSessionMode,
      draftSession,
      openCreateSessionModal,
      openEditSessionModal,
      loadPresetIntoDraft,
      saveDraftSession,
      openSession,
      backToWorkOrderList,
      deleteSession,
      loadPresetWorkOrder,
      reportViewMode,
      openSessionReport,
      openSessionPipeline,
      navigateToPipeline,
      navigateToReport,

      // Authentication & Role-Based Access Control
      authRole,
      authUser,
      authIsLoggedIn,
      isAdmin,
      isProduksi,
      isPa,
      isQc,
      isViewer,
      portalRevealed,
      loginModalOpen,
      loginForm,
      loginLoading,
      loginError,
      loginState,
      showPassword,
      showModalPassword,
      usernameInputRef,
      modalUsernameRef,
      rememberMe,
      showDemoTraceModal,
      toggleDemoTraceModal,
      handleForgotPassword,
      openLoginModal,
      fillQuickAccount,
      submitLogin,
      enterAsGuest,
      logoutAuth,
      copiedToast,
      copyToClipboard,
      currentTimeStr,
      currentDateStr,
      currentShift,
    };
  },
}).mount('#app');