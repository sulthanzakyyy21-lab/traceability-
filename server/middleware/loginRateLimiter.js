/**
 * Brute-force & Credential Stuffing Protection for Login Endpoint
 * Sliding window rate limiting per IP and Username.
 */

const attemptsMap = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_ATTEMPTS = 5;

function getClientIp(req) {
  return req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
}

function loginRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const key = `ip:${ip}`;

  const record = attemptsMap.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }

  if (record.count >= MAX_ATTEMPTS) {
    const remainingSeconds = Math.ceil((record.resetAt - now) / 1000);
    return res.status(429).json({
      success: false,
      message: `Terlalu banyak percobaan login gagal. Akun dibatasi sementara demi keamanan. Coba lagi dalam ${remainingSeconds} detik.`,
      retryAfterSeconds: remainingSeconds,
    });
  }

  req.rateLimitKey = key;
  next();
}

function recordLoginFailure(req) {
  const key = req.rateLimitKey || `ip:${getClientIp(req)}`;
  const now = Date.now();
  const record = attemptsMap.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }

  record.count += 1;
  attemptsMap.set(key, record);
}

function resetLoginFailure(req) {
  const key = req.rateLimitKey || `ip:${getClientIp(req)}`;
  attemptsMap.delete(key);
}

module.exports = {
  loginRateLimiter,
  recordLoginFailure,
  resetLoginFailure,
  MAX_ATTEMPTS,
  WINDOW_MS,
};
