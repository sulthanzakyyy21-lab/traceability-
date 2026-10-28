/**
 * Security Headers Middleware (OWASP ASVS 5.0.0 & NIST SSDF v1.1)
 * Enforces strict browser-level security headers, CSP, and HSTS.
 */

function securityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking / Framing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Modern XSS Protection disabling legacy buggy audits
  res.setHeader('X-XSS-Protection', '0');

  // Strict Transport Security (HSTS) - 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser features / hardware access
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy (CSP) for SCADA Dashboard & API
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://cdn.tailwindcss.com; worker-src 'self' blob:;"
  );

  // Remove Express fingerprinting header
  res.removeHeader('X-Powered-By');

  next();
}

module.exports = { securityHeaders };
