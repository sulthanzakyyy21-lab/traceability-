// Authentication & Role-Based Access Control Store for PT. Santos Jaya Abadi
(function (window) {
  const Vue = window.Vue || {
    reactive: (obj) => obj,
    computed: (fn) => ({ get value() { return fn(); } }),
  };
  const { reactive, computed } = Vue;

  let _initTok = null, _initUsr = null;
  try {
    const t = typeof localStorage !== 'undefined' && localStorage.getItem('sja_auth_token');
    const u = typeof localStorage !== 'undefined' && localStorage.getItem('sja_auth_user');
    if (t && u) { _initTok = t; _initUsr = JSON.parse(u); }
  } catch (_) {}

  const authState = reactive({
    user: _initUsr,
    token: _initTok,
    loginModalOpen: false,
    loading: false,
    error: '',
    usersModalOpen: false,
    usersList: [],
    usersLoading: false,
  });

  const isAuthenticated = computed(() => !!authState.user && !!authState.token);
  const currentRole = computed(() => authState.user?.role || 'viewer');
  const isAdmin = computed(() => currentRole.value === 'admin');
  const isProduksi = computed(() => currentRole.value === 'produksi');
  const isQc = computed(() => currentRole.value === 'qc');
  const isViewer = computed(() => currentRole.value === 'viewer');

  const canSyncGsheet = computed(() => isAdmin.value);
  const canUploadExcel = computed(() => isAdmin.value);
  const canAddRow = computed(() => isAdmin.value);
  const canDeleteRow = computed(() => isAdmin.value);
  const canClearData = computed(() => isAdmin.value);
  const canManageUsers = computed(() => isAdmin.value);
  const canDeleteSession = computed(() => isAdmin.value);

  function getAuthHeaders() {
    const token = authState.token || localStorage.getItem('sja_auth_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  // Interceptor otomatis menyertakan JWT Bearer Token pada setiap fetch ke /api/
  if (typeof window !== 'undefined' && window.fetch) {
    const _originalFetch = window.fetch;
    window.fetch = function (url, options = {}) {
      if (typeof url === 'string' && url.startsWith('/api/') && !url.includes('/api/auth/login')) {
        const token = authState.token || localStorage.getItem('sja_auth_token');
        if (token) {
          options = options || {};
          if (options.headers instanceof Headers) {
            if (!options.headers.has('Authorization')) {
              options.headers.set('Authorization', `Bearer ${token}`);
            }
          } else {
            options.headers = {
              ...(options.headers || {}),
              Authorization: `Bearer ${token}`,
            };
          }
        }
      }
      return _originalFetch.call(this, url, options);
    };
  }

  async function initAuth() {
    try {
      const savedToken = localStorage.getItem('sja_auth_token');
      const savedUser = localStorage.getItem('sja_auth_user');

      if (savedToken && savedUser) {
        authState.token = savedToken;
        authState.user = JSON.parse(savedUser);

        // Validasi ke backend
        fetch('/api/auth/me', { headers: getAuthHeaders() })
          .then((res) => {
            if (!res.ok) throw new Error('Expired');
            return res.json();
          })
          .then((data) => {
            if (data.user) {
              authState.user = data.user;
              localStorage.setItem('sja_auth_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Sesi kedaluwarsa, bersihkan
            logout();
          });
      } else {
        // Belum login, arahkan ke Halaman Login
        authState.token = null;
        authState.user = null;
      }
    } catch (e) {
      console.warn('[Auth] Gagal inisialisasi sesi:', e);
    }
  }

  async function login(username, password, delayCommit = false) {
    authState.loading = true;
    authState.error = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Username atau password salah.');
      }

      const commit = () => {
        authState.token = data.token;
        authState.user = data.user;
        localStorage.setItem('sja_auth_token', data.token);
        localStorage.setItem('sja_auth_user', JSON.stringify(data.user));
        authState.loginModalOpen = false;
      };

      if (delayCommit) {
        return { success: true, user: data.user, commit };
      }
      commit();
      return { success: true, user: data.user };
    } catch (err) {
      authState.error = err.message;
      return { success: false, error: err.message };
    } finally {
      authState.loading = false;
    }
  }

  async function loginAsGuest() {
    return await login('viewer', 'view123');
  }

  function logout() {
    authState.token = null;
    authState.user = null;
    localStorage.removeItem('sja_auth_token');
    localStorage.removeItem('sja_auth_user');
  }

  async function fetchUsersList() {
    if (!isAdmin.value) return;
    authState.usersLoading = true;
    try {
      const res = await fetch('/api/auth/users', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        authState.usersList = data.users || [];
      }
    } catch (err) {
      console.error('[Auth] Gagal memuat daftar user:', err);
    } finally {
      authState.usersLoading = false;
    }
  }

  window.sjaAuth = {
    state: authState,
    isAuthenticated,
    currentRole,
    isAdmin,
    isProduksi,
    isQc,
    isViewer,
    canSyncGsheet,
    canUploadExcel,
    canAddRow,
    canDeleteRow,
    canClearData,
    canManageUsers,
    canDeleteSession,
    getAuthHeaders,
    initAuth,
    login,
    loginAsGuest,
    logout,
    fetchUsersList,
  };
})(window);
