// UzhavanGo API – server.js
// One complete role-based backend for Admin, Farmer, and Buyer
// Admin credentials: admin@uzhavan.com / uzhavan@2026 (hashed via PBKDF2-SHA512)

const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');

const app    = express();
const secret = process.env.JWT_SECRET || 'uzhavango-secret-key-2026-prod';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// ─── PASSWORD SECURITY & HASHING (PBKDF2-SHA512) ────────────
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// Pre-compute secure hash for default common admin account
const adminSalt = 'a8f5b3c2e1d0498765f4e3d2c1b0a987';
const adminCredentials = hashPassword('uzhavan@2026', adminSalt);

// ─── IN-MEMORY DATABASE ──────────────────────────────────────
const db = {
  admins: [{
    id: 1,
    email: 'admin@uzhavan.com',
    salt: adminSalt,
    passwordHash: adminCredentials.hash,
    name: 'UzhavanGo Administrator'
  }],
  users:  [],   // { id, name, phone, role:'farmer'|'buyer', email?, location? }
  posts:  [],   // { id, farmerId, productName, qty, unit, location, description, image, grade, status }
  offers: [],   // { id, postId, buyerId, offeredPrice, quantity, message, status }
  orders: [],   // { id, offerId, status, paymentStatus, txnId }
  payments: [], // { id, txnId, orderId, amount, method, buyerName, farmerName, status, createdAt }
  reports:[],   // { id, reporterId, reportedUserId, reason, description, status }
  activityLogs: [] // { id, adminId, action, targetType, targetId, createdAt }
};

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────
const auth = (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), secret);
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
};

const adminAuth = (req, res, next) => {
  try {
    const payload = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), secret);
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication required' });
  }
};

const farmerOnly = (req, res, next) => {
  if (req.user.role !== 'farmer') return res.status(403).json({ error: 'Only farmers can perform this action' });
  next();
};

const buyerOnly = (req, res, next) => {
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Only buyers can perform this action' });
  next();
};

function logAdminAction(adminId, action, targetType, targetId) {
  db.activityLogs.push({ id: Date.now(), adminId, action, targetType, targetId, createdAt: new Date().toISOString() });
}

// ════════════════════════════════════════════════════════════
//  1. PUBLIC AUTH ROUTES (FARMER, BUYER, ADMIN)
// ════════════════════════════════════════════════════════════

// Farmer / Buyer register
app.post('/api/auth/register', (req, res) => {
  const { name, phone, role, email, location } = req.body;
  if (!name || !phone || !role) return res.status(400).json({ error: 'Name, phone and role are required' });
  if (!['farmer', 'buyer'].includes(role)) return res.status(400).json({ error: 'Role must be farmer or buyer' });
  if (role === 'buyer' && (!email || !location)) return res.status(400).json({ error: 'Buyer registration requires email and location' });
  const user = { id: Date.now(), name, phone, role, email: email || null, location: location || null, createdAt: new Date().toISOString() };
  db.users.push(user);
  res.status(201).json({ user, token: jwt.sign({ id: user.id, role, name: user.name }, secret) });
});

// Farmer / Buyer login
app.post('/api/auth/login', (req, res) => {
  const { phone, role, name } = req.body;
  let user = db.users.find(u => u.phone === phone && u.role === role);
  if (!user) {
    // Auto-create/login for prototype simplicity if phone provided
    user = { id: Date.now(), name: name || (role === 'farmer' ? 'Arun Kumar' : 'Ananya Retail'), phone, role, createdAt: new Date().toISOString() };
    db.users.push(user);
  }
  res.json({ user, token: jwt.sign({ id: user.id, role: user.role, name: user.name }, secret) });
});

// Admin login - verifies hashed password against PBKDF2 hash
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  
  const admin = db.admins.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin || !verifyPassword(password, admin.salt, admin.passwordHash)) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = jwt.sign({ id: admin.id, role: 'admin', email: admin.email }, secret, { expiresIn: '8h' });
  
  // Safe response: Never return passwordHash, salt, or sensitive email
  res.json({
    admin: { id: admin.id, name: admin.name, role: 'admin' },
    token
  });
});

// ════════════════════════════════════════════════════════════
//  2. FARMER MODULE (POSTS WITH PHOTOS & QUALITY INFO)
// ════════════════════════════════════════════════════════════

app.get('/api/posts', (req, res) => {
  res.json(db.posts.map(p => {
    const postOffers = db.offers.filter(o => o.postId === p.id && o.status === 'Accepted');
    const buyersList = postOffers.map(o => ({
      buyerId: o.buyerId,
      buyerName: o.buyerName,
      quantity: parseFloat(o.quantity),
      unit: p.unit,
      pricePerKg: parseFloat(o.offeredPrice)
    }));

    const totalQty = parseFloat(p.totalQuantity !== undefined ? p.totalQuantity : p.quantity);
    const soldQty = buyersList.reduce((sum, b) => sum + b.quantity, 0);
    const availableQty = Math.max(0, totalQty - soldQty);
    let status = availableQty <= 0.001 ? 'Sold Out' : (p.status === 'Closed' ? 'Closed' : 'Active');

    return {
      ...p,
      quantity: availableQty,
      totalQuantity: totalQty,
      originalQuantity: totalQty,
      availableQuantity: availableQty,
      remainingQuantity: availableQty,
      soldQuantity: soldQty,
      buyers: buyersList,
      status
    };
  }));
});

app.post('/api/posts', auth, farmerOnly, (req, res) => {
  const { productName, quantity, unit, location, description, image, grade } = req.body;
  if (!productName || !quantity || !unit || !location) return res.status(400).json({ error: 'Product, quantity, unit and location are required' });
  if ('price' in req.body) return res.status(400).json({ error: 'Farmers cannot set a price — buyers submit bids' });
  const numQty = parseFloat(quantity);
  if (isNaN(numQty) || numQty <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });

  const post = {
    id: Date.now(),
    farmerId: req.user.id,
    farmerName: req.user.name || 'Arun Kumar',
    productName,
    quantity: numQty,
    totalQuantity: numQty,
    originalQuantity: numQty,
    availableQuantity: numQty,
    remainingQuantity: numQty,
    soldQuantity: 0,
    buyers: [],
    unit,
    location,
    description: description || '',
    image: image || null,
    grade: grade || 'Grade A',
    status: 'Active',
    createdAt: new Date().toISOString()
  };
  db.posts.push(post);
  res.status(201).json(post);
});

app.delete('/api/posts/:id', auth, farmerOnly, (req, res) => {
  const idx = db.posts.findIndex(p => p.id === +req.params.id && p.farmerId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found or unauthorized' });
  db.posts.splice(idx, 1);
  res.json({ message: 'Post deleted' });
});

// ════════════════════════════════════════════════════════════
//  3. BUYER MODULE (BIDS & OFFER PRIVACY)
// ════════════════════════════════════════════════════════════

// Buyer submits an offer
app.post('/api/posts/:id/offers', auth, buyerOnly, (req, res) => {
  const { offeredPrice, quantity, message } = req.body;
  if (!offeredPrice || !quantity) return res.status(400).json({ error: 'Price and quantity are required' });
  const reqQty = parseFloat(quantity);
  if (isNaN(reqQty) || reqQty <= 0) return res.status(400).json({ error: 'Quantity must be a positive number' });

  const post = db.posts.find(p => p.id === +req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.status === 'Sold Out' || post.status === 'Closed') return res.status(400).json({ error: 'This listing is sold out and no longer accepting bids.' });

  const postOffers = db.offers.filter(o => o.postId === post.id && o.status === 'Accepted');
  const soldQty = postOffers.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const totalQty = parseFloat(post.totalQuantity !== undefined ? post.totalQuantity : post.quantity);
  const availableQty = Math.max(0, totalQty - soldQty);

  if (availableQty <= 0) return res.status(400).json({ error: 'This produce is currently sold out.' });
  if (reqQty > availableQty) {
    return res.status(400).json({ error: `Only ${availableQty} ${post.unit} remaining.` });
  }

  const offer = {
    id: Date.now(),
    postId: +req.params.id,
    buyerId: req.user.id,
    buyerName: req.user.name || 'Buyer',
    offeredPrice: +offeredPrice,
    quantity: reqQty,
    message: message || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.offers.push(offer);
  res.status(201).json(offer);
});

// Farmer views all offers for their post; Buyer sees ONLY their own offer (privacy enforced)
app.get('/api/posts/:id/offers', auth, (req, res) => {
  const post = db.posts.find(p => String(p.id) === String(req.params.id));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (req.user.role === 'farmer') {
    const isOwner = String(post.farmerId || post.farmer_id) === String(req.user.id) ||
                    ((post.farmerName || post.farmer_name) && req.user.name && (post.farmerName || post.farmer_name).trim().toLowerCase() === req.user.name.trim().toLowerCase());
    if (!isOwner) return res.status(403).json({ error: 'Not your post' });
    return res.json(db.offers.filter(o => String(o.postId) === String(req.params.id)));
  }
  if (req.user.role === 'buyer') {
    return res.json(db.offers.filter(o => String(o.postId) === String(req.params.id) && (String(o.buyerId) === String(req.user.id) || (o.buyerName && req.user.name && o.buyerName.trim().toLowerCase() === req.user.name.trim().toLowerCase()))));
  }
  if (req.user.role === 'admin') {
    return res.json(db.offers.filter(o => String(o.postId) === String(req.params.id)));
  }
  res.status(403).json({ error: 'Unauthorized' });
});

// Farmer selects an offer -> Order created in 'Accepted' state
app.post('/api/offers/:id/select', auth, farmerOnly, (req, res) => {
  const offer = db.offers.find(o => String(o.id) === String(req.params.id));
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  if (offer.status === 'Accepted') return res.status(400).json({ error: 'This bid has already been accepted.' });

  const post = db.posts.find(p => String(p.id) === String(offer.postId) && 
    (String(p.farmerId || p.farmer_id) === String(req.user.id) || 
     (p.farmerName && req.user.name && p.farmerName.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
     (p.farmer_name && req.user.name && p.farmer_name.trim().toLowerCase() === req.user.name.trim().toLowerCase())));
  if (!post) return res.status(403).json({ error: 'Not your post' });

  const offerQty = parseFloat(offer.quantity);
  const totalQty = parseFloat(post.totalQuantity !== undefined ? post.totalQuantity : post.quantity);
  const currentSold = db.offers.filter(o => o.postId === post.id && o.status === 'Accepted').reduce((sum, o) => sum + parseFloat(o.quantity), 0);
  const currentAvailable = Math.max(0, totalQty - currentSold);

  if (currentAvailable < offerQty) {
    return res.status(400).json({ error: `Only ${currentAvailable} ${post.unit} remaining.` });
  }

  offer.status = 'Accepted';

  const allAccepted = db.offers.filter(o => o.postId === post.id && o.status === 'Accepted');
  const buyersList = allAccepted.map(o => ({
    buyerId: o.buyerId,
    buyerName: o.buyerName,
    quantity: parseFloat(o.quantity),
    unit: post.unit,
    pricePerKg: parseFloat(o.offeredPrice)
  }));

  const newSold = buyersList.reduce((sum, b) => sum + b.quantity, 0);
  const newAvailable = Math.max(0, totalQty - newSold);

  post.availableQuantity = newAvailable;
  post.remainingQuantity = newAvailable;
  post.soldQuantity = newSold;
  post.quantity = newAvailable;
  post.buyers = buyersList;

  if (newAvailable <= 0.001) {
    post.status = 'Sold Out';
    db.offers.filter(o => o.postId === offer.postId && o.id !== offer.id && o.status === 'Pending').forEach(o => o.status = 'Closed');
  } else {
    post.status = 'Active';
    db.offers.filter(o => o.postId === offer.postId && o.id !== offer.id && o.status === 'Pending' && parseFloat(o.quantity) > newAvailable).forEach(o => o.status = 'Closed');
  }
  
  const order = {
    id: 'UZ-' + Math.floor(2000 + Math.random() * 7000),
    offerId: offer.id,
    postId: post.id,
    product: post.productName,
    farmer: post.farmerName,
    buyer: offer.buyerName,
    buyerId: offer.buyerId,
    quantity: `${offerQty} ${post.unit}`,
    quantityValue: offerQty,
    unit: post.unit,
    price: `₹${offer.offeredPrice * offerQty}`,
    pricePerKg: parseFloat(offer.offeredPrice),
    rawPrice: offer.offeredPrice * offerQty,
    status: 'Accepted',
    paymentStatus: 'Pending',
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(order);
  res.json({
    offer,
    order,
    totalQuantity: totalQty,
    originalQuantity: totalQty,
    soldQuantity: newSold,
    availableQuantity: newAvailable,
    remainingQuantity: newAvailable,
    buyers: buyersList,
    listingStatus: post.status
  });
});

// ════════════════════════════════════════════════════════════
//  4. ONLINE PAYMENTS (UPI / CARD / NET BANKING)
// ════════════════════════════════════════════════════════════

app.post('/api/payments', auth, (req, res) => {
  const { orderId, amount, method, buyerName, farmerName } = req.body;
  if (!orderId || !amount || !method) return res.status(400).json({ error: 'orderId, amount, and method are required' });
  
  const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  const payment = {
    id: Date.now(),
    txnId,
    orderId,
    amount,
    method, // 'UPI' | 'Card' | 'NetBanking'
    buyerName: buyerName || req.user.name || 'Ananya Retail',
    farmerName: farmerName || 'Arun Kumar',
    status: 'Success',
    createdAt: new Date().toISOString()
  };
  db.payments.unshift(payment);

  // Update order status
  const order = db.orders.find(o => o.id === orderId);
  if (order) {
    order.paymentStatus = 'Paid';
    order.txnId = txnId;
    order.status = 'Order Confirmed';
  }

  res.status(201).json({ success: true, payment, order });
});

// ════════════════════════════════════════════════════════════
//  5. ORDER MANAGEMENT & STATUS PROGRESSION
// ════════════════════════════════════════════════════════════

const ORDER_STATES = ['Accepted', 'Order Confirmed', 'Pickup', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

app.get('/api/orders', auth, (req, res) => {
  if (req.user.role === 'admin') return res.json(db.orders);
  if (req.user.role === 'farmer') {
    return res.json(db.orders.filter(o => 
      (o.farmer && req.user.name && o.farmer.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
      (o.farmerId && String(o.farmerId) === String(req.user.id))
    ));
  }
  return res.json(db.orders.filter(o => 
    (o.buyer && req.user.name && o.buyer.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
    (o.buyerId && String(o.buyerId) === String(req.user.id))
  ));
});

app.patch('/api/orders/:id/status', auth, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const { status } = req.body;
  if (!ORDER_STATES.includes(status)) return res.status(400).json({ error: 'Invalid order status' });
  order.status = status;

  if (status === 'Cancelled' || status === 'CANCELLED') {
    const offer = db.offers.find(o => o.id === order.offerId);
    if (offer) offer.status = 'Cancelled';
    const post = db.posts.find(p => p.id === order.postId);
    if (post) {
      const acceptedOffers = db.offers.filter(o => o.postId === post.id && o.status === 'Accepted');
      const newSold = acceptedOffers.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
      const totalQty = parseFloat(post.totalQuantity !== undefined ? post.totalQuantity : post.quantity);
      const newAvail = Math.max(0, totalQty - newSold);
      post.soldQuantity = newSold;
      post.availableQuantity = newAvail;
      post.remainingQuantity = newAvail;
      post.quantity = newAvail;
      post.status = newAvail <= 0.001 ? 'Sold Out' : 'Active';
    }
  }

  res.json(order);
});

// ════════════════════════════════════════════════════════════
//  6. ADMIN MODULE ROUTES (STRICT adminAuth GUARD)
// ════════════════════════════════════════════════════════════

// Admin Dashboard Stats
app.get('/api/admin/stats', adminAuth, (req, res) => {
  const farmers   = db.users.filter(u => u.role === 'farmer').length;
  const buyers    = db.users.filter(u => u.role === 'buyer').length;
  const products  = db.posts.length;
  const offers    = db.offers.length;
  const orders    = db.orders.length;
  const payments  = db.payments.length;
  const completed = db.orders.filter(o => o.status === 'Completed').length;
  const active    = db.orders.filter(o => ['Accepted','Order Confirmed','Pickup','In Transit','Delivered'].includes(o.status)).length;
  const reported  = db.reports.filter(r => r.status === 'pending').length;
  res.json({ farmers, buyers, products, offers, orders, payments, completed, active, reported });
});

// Admin Users
app.get('/api/admin/farmers', adminAuth, (req, res) => res.json(db.users.filter(u => u.role === 'farmer')));
app.get('/api/admin/buyers',  adminAuth, (req, res) => res.json(db.users.filter(u => u.role === 'buyer')));

app.patch('/api/admin/users/:id/status', adminAuth, (req, res) => {
  const user = db.users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.active = req.body.active !== false;
  logAdminAction(req.user.id, user.active ? 'User Activated' : 'User Deactivated', 'user', user.id);
  res.json(user);
});

// Admin Products
app.get('/api/admin/products', adminAuth, (req, res) => res.json(db.posts));

app.patch('/api/admin/products/:id', adminAuth, (req, res) => {
  const post = db.posts.find(p => p.id === +req.params.id);
  if (!post) return res.status(404).json({ error: 'Product not found' });
  const allowed = ['approved', 'removed', 'unavailable'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  post.status = req.body.status;
  logAdminAction(req.user.id, `Product ${post.status}`, 'product', post.id);
  res.json(post);
});

// Admin Offers (Privileged View)
app.get('/api/admin/offers', adminAuth, (req, res) => res.json(db.offers));

// Admin Orders
app.get('/api/admin/orders', adminAuth, (req, res) => res.json(db.orders));

// Admin Payments
app.get('/api/admin/payments', adminAuth, (req, res) => res.json(db.payments));

// Admin Reports
app.get('/api/admin/reports', adminAuth, (req, res) => res.json(db.reports));

app.patch('/api/admin/reports/:id/status', adminAuth, (req, res) => {
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const allowed = ['pending', 'investigating', 'resolved', 'rejected'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  report.status = req.body.status;
  if (req.body.status === 'resolved') report.resolvedAt = new Date().toISOString();
  logAdminAction(req.user.id, `Report ${report.status}`, 'report', report.id);
  res.json(report);
});

// Admin Activity Log
app.get('/api/admin/activity-log', adminAuth, (req, res) => res.json(db.activityLogs));

// Admin Notifications
app.post('/api/admin/notifications', adminAuth, (req, res) => {
  const { title, body, to } = req.body;
  if (!title || !body || !to) return res.status(400).json({ error: 'title, body and to required' });
  const notif = { id: Date.now(), title, body, to, sentBy: 'Administrator', sentAt: new Date().toISOString() };
  logAdminAction(req.user.id, `Notification Sent: ${title}`, 'notification', notif.id);
  res.status(201).json(notif);
});

// ─── START SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`UZHAVANGO API running on http://localhost:${PORT}`);
  console.log(`Admin login endpoint: POST /api/admin/login`);
});
