const { getPool, isMySQL, memoryStore } = require('../config/db');

function logAdminActionSync(adminId, action, targetType, targetId) {
  if (isMySQL()) {
    getPool().query(
      'INSERT INTO activity_logs (admin_id, action, target_type, target_id) VALUES (?, ?, ?, ?)',
      [adminId, action, targetType, targetId]
    ).catch(err => console.error('Error logging admin action:', err));
  } else {
    memoryStore.activity_logs.unshift({
      id: Date.now(),
      adminId,
      action,
      targetType,
      targetId,
      createdAt: new Date().toISOString()
    });
  }
}

exports.getStats = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [[{ farmers }]] = await pool.query("SELECT COUNT(*) as farmers FROM users WHERE role = 'farmer'");
      const [[{ buyers }]] = await pool.query("SELECT COUNT(*) as buyers FROM users WHERE role = 'buyer'");
      const [[{ products }]] = await pool.query("SELECT COUNT(*) as products FROM posts");
      const [[{ offers }]] = await pool.query("SELECT COUNT(*) as offers FROM offers");
      const [[{ orders }]] = await pool.query("SELECT COUNT(*) as orders FROM orders");
      const [[{ payments }]] = await pool.query("SELECT COUNT(*) as payments FROM payments");
      const [[{ completed }]] = await pool.query("SELECT COUNT(*) as completed FROM orders WHERE status = 'Completed'");
      const [[{ active }]] = await pool.query("SELECT COUNT(*) as active FROM orders WHERE status IN ('Accepted', 'Order Confirmed', 'Pickup', 'In Transit', 'Delivered')");
      const [[{ reported }]] = await pool.query("SELECT COUNT(*) as reported FROM reports WHERE status = 'pending'");

      return res.json({ farmers, buyers, products, offers, orders, payments, completed, active, reported });
    } else {
      const farmers = memoryStore.users.filter(u => u.role === 'farmer').length;
      const buyers = memoryStore.users.filter(u => u.role === 'buyer').length;
      const products = memoryStore.posts.length;
      const offers = memoryStore.offers.length;
      const orders = memoryStore.orders.length;
      const payments = memoryStore.payments.length;
      const completed = memoryStore.orders.filter(o => o.status === 'Completed').length;
      const active = memoryStore.orders.filter(o => ['Accepted', 'Order Confirmed', 'Pickup', 'In Transit', 'Delivered'].includes(o.status)).length;
      const reported = memoryStore.reports.filter(r => r.status === 'pending').length;

      return res.json({ farmers, buyers, products, offers, orders, payments, completed, active, reported });
    }
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

exports.getFarmers = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query("SELECT * FROM users WHERE role = 'farmer' ORDER BY created_at DESC");
      return res.json(rows);
    } else {
      return res.json(memoryStore.users.filter(u => u.role === 'farmer'));
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
};

exports.getBuyers = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query("SELECT * FROM users WHERE role = 'buyer' ORDER BY created_at DESC");
      return res.json(rows);
    } else {
      return res.json(memoryStore.users.filter(u => u.role === 'buyer'));
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const userId = +req.params.id;
    const active = req.body.active !== false;

    if (isMySQL()) {
      const pool = getPool();
      await pool.query('UPDATE users SET active = ? WHERE id = ?', [active ? 1 : 0, userId]);
      const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      logAdminActionSync(req.user.id, active ? 'User Activated' : 'User Deactivated', 'user', userId);
      return res.json(users[0]);
    } else {
      const user = memoryStore.users.find(u => u.id === userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.active = active;
      logAdminActionSync(req.user.id, active ? 'User Activated' : 'User Deactivated', 'user', userId);
      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      return res.json(memoryStore.posts);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const postId = +req.params.id;
    const { status } = req.body;
    const allowed = ['approved', 'removed', 'unavailable', 'Posted'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid product status' });

    if (isMySQL()) {
      const pool = getPool();
      await pool.query('UPDATE posts SET status = ? WHERE id = ?', [status, postId]);
      const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
      if (posts.length === 0) return res.status(404).json({ error: 'Product not found' });
      logAdminActionSync(req.user.id, `Product ${status}`, 'product', postId);
      return res.json(posts[0]);
    } else {
      const post = memoryStore.posts.find(p => p.id === postId);
      if (!post) return res.status(404).json({ error: 'Product not found' });
      post.status = status;
      logAdminActionSync(req.user.id, `Product ${status}`, 'product', postId);
      return res.json(post);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product status' });
  }
};

exports.getOffers = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      return res.json(memoryStore.offers);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      return res.json(memoryStore.orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      return res.json(memoryStore.payments);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

exports.getReports = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      return res.json(memoryStore.reports);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status } = req.body;
    const allowed = ['pending', 'investigating', 'resolved', 'rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    if (isMySQL()) {
      const pool = getPool();
      const resolvedAt = status === 'resolved' ? new Date() : null;
      await pool.query('UPDATE reports SET status = ?, resolved_at = ? WHERE id = ?', [status, resolvedAt, reportId]);
      logAdminActionSync(req.user.id, `Report ${status}`, 'report', reportId);
      return res.json({ id: reportId, status, resolvedAt });
    } else {
      const report = memoryStore.reports.find(r => r.id === reportId);
      if (!report) return res.status(404).json({ error: 'Report not found' });
      report.status = status;
      if (status === 'resolved') report.resolvedAt = new Date().toISOString();
      logAdminActionSync(req.user.id, `Report ${status}`, 'report', reportId);
      return res.json(report);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report status' });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100');
      return res.json(rows);
    } else {
      return res.json(memoryStore.activity_logs);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, body, to } = req.body;
    if (!title || !body || !to) return res.status(400).json({ error: 'title, body and to are required' });

    if (isMySQL()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO notifications (title, body, target_role, sent_by) VALUES (?, ?, ?, ?)',
        [title, body, to, 'Administrator']
      );
      logAdminActionSync(req.user.id, `Notification Sent: ${title}`, 'notification', result.insertId);
      return res.status(201).json({ id: result.insertId, title, body, to, sentBy: 'Administrator', createdAt: new Date() });
    } else {
      const notif = { id: Date.now(), title, body, to, sentBy: 'Administrator', createdAt: new Date().toISOString() };
      memoryStore.notifications.unshift(notif);
      logAdminActionSync(req.user.id, `Notification Sent: ${title}`, 'notification', notif.id);
      return res.status(201).json(notif);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};
