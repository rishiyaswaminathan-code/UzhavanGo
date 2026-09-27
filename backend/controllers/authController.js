const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { getPool, isMySQL, memoryStore } = require('../config/db');
const { secret } = require('../middleware/authMiddleware');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

exports.register = async (req, res) => {
  try {
    const { name, phone, role, email, location } = req.body;
    if (!name || !phone || !role) {
      return res.status(400).json({ error: 'Name, phone and role are required' });
    }
    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({ error: 'Role must be farmer or buyer' });
    }
    if (role === 'buyer' && (!email || !location)) {
      return res.status(400).json({ error: 'Buyer registration requires email and location' });
    }

    if (isMySQL()) {
      const pool = getPool();
      const [existing] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Phone number already registered' });
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, phone, role, email, location) VALUES (?, ?, ?, ?, ?)',
        [name, phone, role, email || null, location || null]
      );
      const user = { id: result.insertId, name, phone, role, email: email || null, location: location || null, active: 1 };
      const token = jwt.sign({ id: user.id, role, name: user.name }, secret, { expiresIn: '7d' });
      return res.status(201).json({ user, token });
    } else {
      const existing = memoryStore.users.find(u => u.phone === phone);
      if (existing) return res.status(400).json({ error: 'Phone number already registered' });
      
      const user = { id: Date.now(), name, phone, role, email: email || null, location: location || null, active: 1, created_at: new Date() };
      memoryStore.users.push(user);
      const token = jwt.sign({ id: user.id, role, name: user.name }, secret, { expiresIn: '7d' });
      return res.status(201).json({ user, token });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, role, name } = req.body;
    if (!phone || !role) return res.status(400).json({ error: 'Phone and role are required' });

    if (isMySQL()) {
      const pool = getPool();
      let [rows] = await pool.query('SELECT * FROM users WHERE phone = ? AND role = ?', [phone, role]);
      let user = rows[0];

      if (!user) {
        // Auto-create for seamless experience
        const defaultName = (name && name.trim()) || (role === 'farmer' ? 'Farmer' : 'Buyer');
        const [result] = await pool.query(
          'INSERT INTO users (name, phone, role) VALUES (?, ?, ?)',
          [defaultName, phone, role]
        );
        user = { id: result.insertId, name: defaultName, phone, role, active: 1 };
      } else if (name && name.trim() && user.name !== name.trim()) {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), user.id]);
        user.name = name.trim();
      }

      if (!user.active) {
        return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
      }

      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, secret, { expiresIn: '7d' });
      return res.json({ user, token });
    } else {
      let user = memoryStore.users.find(u => u.phone === phone && u.role === role);
      if (!user) {
        const defaultName = (name && name.trim()) || (role === 'farmer' ? 'Farmer' : 'Buyer');
        user = { id: Date.now(), name: defaultName, phone, role, active: 1, created_at: new Date() };
        memoryStore.users.push(user);
      } else if (name && name.trim()) {
        user.name = name.trim();
      }

      if (!user.active) {
        return res.status(403).json({ error: 'Account is deactivated. Contact administrator.' });
      }

      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, secret, { expiresIn: '7d' });
      return res.json({ user, token });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM admins WHERE LOWER(email) = ?', [email.trim().toLowerCase()]);
      const admin = rows[0];

      if (!admin || !verifyPassword(password, admin.salt, admin.password_hash)) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      const token = jwt.sign({ id: admin.id, role: 'admin', email: admin.email, name: admin.name }, secret, { expiresIn: '8h' });
      return res.json({
        admin: { id: admin.id, name: admin.name, role: 'admin', email: admin.email },
        token
      });
    } else {
      const admin = memoryStore.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
      if (!admin || !verifyPassword(password, admin.salt, admin.password_hash)) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      const token = jwt.sign({ id: admin.id, role: 'admin', email: admin.email, name: admin.name }, secret, { expiresIn: '8h' });
      return res.json({
        admin: { id: admin.id, name: admin.name, role: 'admin', email: admin.email },
        token
      });
    }
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
