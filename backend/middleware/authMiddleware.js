const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_SECRET || 'uzhavango-super-secret-key-2026-production-ready';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(401).json({ error: 'Authentication token missing' });
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    if (!token) return res.status(401).json({ error: 'Authentication token missing' });
    const payload = jwt.verify(token, secret);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const farmerOnly = (req, res, next) => {
  if (req.user?.role !== 'farmer') {
    return res.status(403).json({ error: 'Only farmers can perform this action' });
  }
  next();
};

const buyerOnly = (req, res, next) => {
  if (req.user?.role !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can perform this action' });
  }
  next();
};

module.exports = {
  auth,
  adminAuth,
  farmerOnly,
  buyerOnly,
  secret
};
