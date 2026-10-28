/**
 * NIST SP 800-63B-4 Password Policy Validator
 * Minimum 15 characters for single-factor authentication.
 * Prohibits common, compromised, and predictable dictionary passwords.
 */

const COMMON_BLOCKLIST = [
  'password12345678',
  'password123456789',
  'admin12345678901',
  'administrator12',
  'santosjayaabadi1',
  'traceabilitysja',
  '123456789012345',
  'qwertyuiopasdfg',
  'kopikapalsapi123',
  'produksi1234567',
];

function validatePasswordPolicy(password, username = '') {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password wajib diisi.' };
  }

  // NIST SP 800-63B-4: Minimum 15 characters for single-factor
  if (password.length < 15) {
    return {
      valid: false,
      error: 'Password minimal 15 karakter sesuai standar keamanan NIST SP 800-63B-4.',
    };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password maksimal 128 karakter.' };
  }

  const normalized = password.toLowerCase();

  // Check username containment
  if (username && username.length >= 3 && normalized.includes(username.toLowerCase())) {
    return {
      valid: false,
      error: 'Password tidak boleh mengandung nama pengguna (username).',
    };
  }

  // Check blocklist
  for (const blocked of COMMON_BLOCKLIST) {
    if (normalized.includes(blocked)) {
      return {
        valid: false,
        error: 'Password terlalu umum atau mudah ditebak. Gunakan kombinasi kalimat sandi unik.',
      };
    }
  }

  // Check repetitive single characters (e.g. 'aaaaaaaaaaaaaaaa')
  if (/^(.)\1+$/.test(password)) {
    return {
      valid: false,
      error: 'Password tidak boleh terdiri dari satu karakter yang berulang.',
    };
  }

  return { valid: true, error: null };
}

module.exports = {
  validatePasswordPolicy,
  COMMON_BLOCKLIST,
};
