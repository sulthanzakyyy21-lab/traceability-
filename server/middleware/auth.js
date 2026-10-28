const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sja-traceability-secret-salt-2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Sesi login telah berakhir atau token tidak valid. Silakan login kembali.',
    });
  }
}

function optionalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak: Autentikasi diperlukan.',
      });
    }

    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Akses ditolak: Peran '${req.user.role}' tidak memiliki izin untuk tindakan ini. Diperlukan salah satu dari: [${allowedRoles.join(', ')}].`,
    });
  };
}

module.exports = {
  JWT_SECRET,
  verifyToken,
  optionalToken,
  requireRole,
};
