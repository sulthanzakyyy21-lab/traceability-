// Authentication & Role-Based Access Control Store for PT. Santos Jaya Abadi
(function (window) {
  const Vue = window.Vue || {
    reactive: (obj) => obj,
    computed: (fn) => ({ get value() { return fn(); } }),
  };
  const { reactive, computed } = Vue;

  function isTokenExpired(token) {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp ? payload.exp * 1000 <= Date.now() : false;
    } catch {
      return true;
    }
  }

  let _initTok = null, _initUsr = null;
  try {
    const t = typeof localStorage !== 'undefined' && localStorage.getItem('sja_auth_token');
    const u = typeof localStorage !== 'undefined' && localStorage.getItem('sja_auth_user');
    if (t && u && !isTokenExpired(t)) {
      _initTok = t; _initUsr = JSON.parse(u);
    } else if (t) {
      localStorage.removeItem('sja_auth_token');
      localStorage.removeItem('sja_auth_user');
    }
  } catch (_) {}

  const authState = reactive({
    user: _initUsr,
    token: _initTok,
    loginModalOpen: false,
    loading: false,
    error: '',
  });

  const isAuthenticated = computed(() => !!authState.user && !!authState.token);
  const currentRole = computed(() => authState.user?.role || 'viewer');
  const isAdmin = computed(() => currentRole.value === 'admin');
  const isProduksi = computed(() => currentRole.value === 'produksi');
  const isPa = computed(() => currentRole.value === 'pa');
  const isQc = computed(() => currentRole.value === 'qc');
  const isViewer = computed(() => currentRole.value === 'viewer');

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

      if (savedToken && savedUser && !isTokenExpired(savedToken)) {
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
        // Belum login atau sesi telah kedaluwarsa (> 5 menit), arahkan ke Halaman Login
        logout();
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

  window.sjaAuth = {
    state: authState,
    isAuthenticated,
    currentRole,
    isAdmin,
    isProduksi,
    isPa,
    isQc,
    isViewer,
    getAuthHeaders,
    initAuth,
    login,
    loginAsGuest,
    logout,
  };
})(window);
