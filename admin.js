/* ============================================================
   UZHAVANGO – Admin Dashboard
   admin.js  |  Role: admin only
   Backend Authentication: POST /api/admin/login
   ============================================================ */

'use strict';

// ─── AUTH CONFIGURATION ──────────────────────────────────────
const ADMIN_TOKEN_KEY = 'uzAdminToken';
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

// ─── MOCK DATABASE ───────────────────────────────────────────
const db = {
  farmers: [
    { id: 1, name: 'Arun Kumar',    initials: 'AK', phone: '+91 98765 43210', location: 'Melur, Madurai',         regDate: '12 Jan 2025', products: 4, orders: 18, rating: 4.8, status: 'active' },
    { id: 2, name: 'M. Selvam',     initials: 'MS', phone: '+91 94432 10987', location: 'Thirumangalam',           regDate: '05 Feb 2025', products: 2, orders: 11, rating: 4.5, status: 'active' },
    { id: 3, name: 'Kavitha Farms', initials: 'KF', phone: '+91 87654 32109', location: 'Usilampatti',             regDate: '22 Mar 2025', products: 3, orders: 27, rating: 4.9, status: 'active' },
    { id: 4, name: 'R. Muthu',      initials: 'RM', phone: '+91 99887 76543', location: 'Alanganallur',            regDate: '08 Apr 2025', products: 2, orders: 9,  rating: 4.3, status: 'active' },
    { id: 5, name: 'Lakshmi',       initials: 'LK', phone: '+91 93344 55678', location: 'Vadipatti',               regDate: '15 May 2025', products: 1, orders: 6,  rating: 4.6, status: 'inactive' },
    { id: 6, name: 'Raja',          initials: 'RJ', phone: '+91 91234 56789', location: 'Othakadai, Madurai',      regDate: '03 Jun 2025', products: 2, orders: 14, rating: 4.7, status: 'active' }
  ],
  buyers: [
    { id: 101, name: 'Green Basket',    initials: 'GB', phone: '+91 98001 11234', email: 'hello@greenbasket.in',      location: 'Madurai',      regDate: '20 Jan 2025', offers: 12, orders: 9,  rating: 4.7, status: 'active' },
    { id: 102, name: 'Madura Mart',     initials: 'MM', phone: '+91 97002 22345', email: 'buy@maduramart.com',        location: 'Madurai',      regDate: '10 Feb 2025', offers: 8,  orders: 6,  rating: 4.4, status: 'active' },
    { id: 103, name: 'South Fresh',     initials: 'SF', phone: '+91 96003 33456', email: 'info@southfresh.co',        location: 'Madurai',      regDate: '18 Mar 2025', offers: 15, orders: 12, rating: 4.8, status: 'active' },
    { id: 104, name: 'Ananya Retail',   initials: 'AR', phone: '+91 95004 44567', email: 'ananya@example.com',        location: 'Madurai',      regDate: '02 Apr 2025', offers: 5,  orders: 4,  rating: 4.6, status: 'active' },
    { id: 105, name: 'Farm Direct Co',  initials: 'FD', phone: '+91 94005 55678', email: 'orders@farmdirect.in',      location: 'Coimbatore',   regDate: '25 May 2025', offers: 20, orders: 17, rating: 4.5, status: 'active' },
    { id: 106, name: 'Salem Traders',   initials: 'ST', phone: '+91 93006 66789', email: 'salem@traders.net',         location: 'Salem',        regDate: '11 Jun 2025', offers: 3,  orders: 2,  rating: 4.2, status: 'inactive' }
  ],
  products: [
    { id: 1001, emoji: '🍅', name: 'Fresh Tomatoes',   farmer: 'Arun Kumar',    qty: '240 kg',      location: 'Melur, Madurai',    category: 'Vegetables', price: '—',         status: 'approved',     date: 'Today, 9:00 AM' },
    { id: 1002, emoji: '🌾', name: 'Ponni Rice',        farmer: 'M. Selvam',     qty: '18 quintal',  location: 'Thirumangalam',     category: 'Grains',     price: '—',         status: 'pending',      date: 'Yesterday' },
    { id: 1003, emoji: '🥥', name: 'Coconut',           farmer: 'Kavitha Farms', qty: '350 pieces',  location: 'Usilampatti',       category: 'Fruits',     price: '—',         status: 'approved',     date: '2 days ago' },
    { id: 1004, emoji: '🌶️', name: 'Red Chillies',     farmer: 'R. Muthu',      qty: '75 kg',       location: 'Alanganallur',      category: 'Vegetables', price: '—',         status: 'approved',     date: '3 days ago' },
    { id: 1005, emoji: '🍌', name: 'Banana – Poovan',   farmer: 'Lakshmi',       qty: '120 bunches', location: 'Vadipatti',         category: 'Fruits',     price: '—',         status: 'pending',      date: '4 days ago' },
    { id: 1006, emoji: '🍆', name: 'Brinjal',           farmer: 'Raja',          qty: '90 kg',       location: 'Othakadai',         category: 'Vegetables', price: '—',         status: 'approved',     date: '5 days ago' },
    { id: 1007, emoji: '🥜', name: 'Groundnut',         farmer: 'Arun Kumar',    qty: '150 kg',      location: 'Melur, Madurai',    category: 'Grains',     price: '—',         status: 'approved',     date: '6 days ago' },
    { id: 1008, emoji: '🌿', name: 'Turmeric',          farmer: 'M. Selvam',     qty: '50 kg',       location: 'Thirumangalam',     category: 'Grains',     price: '—',         status: 'removed',      date: '7 days ago' }
  ],
  offers: [
    { id: 2001, product: 'Fresh Tomatoes',  farmer: 'Arun Kumar',    buyer: 'Green Basket',   price: '₹31/kg',       qty: '100 kg',      status: 'Pending',  datetime: 'Today, 10:18 AM' },
    { id: 2002, product: 'Fresh Tomatoes',  farmer: 'Arun Kumar',    buyer: 'Madura Mart',    price: '₹34/kg',       qty: '80 kg',       status: 'Pending',  datetime: 'Today, 9:42 AM' },
    { id: 2003, product: 'Coconut',         farmer: 'Kavitha Farms', buyer: 'South Fresh',    price: '₹42/piece',    qty: '200 pieces',  status: 'Accepted', datetime: 'Yesterday, 4:30 PM' },
    { id: 2004, product: 'Ponni Rice',      farmer: 'M. Selvam',     buyer: 'Ananya Retail',  price: '₹2,800/qtl',   qty: '10 quintal',  status: 'Pending',  datetime: 'Yesterday, 11:00 AM' },
    { id: 2005, product: 'Red Chillies',    farmer: 'R. Muthu',      buyer: 'Farm Direct Co', price: '₹120/kg',      qty: '50 kg',       status: 'Accepted', datetime: '2 days ago, 3:15 PM' },
    { id: 2006, product: 'Groundnut',       farmer: 'Arun Kumar',    buyer: 'Salem Traders',  price: '₹90/kg',       qty: '100 kg',      status: 'Closed',   datetime: '3 days ago, 9:00 AM' },
    { id: 2007, product: 'Brinjal',         farmer: 'Raja',          buyer: 'Green Basket',   price: '₹28/kg',       qty: '60 kg',       status: 'Pending',  datetime: 'Today, 8:50 AM' },
    { id: 2008, product: 'Banana – Poovan', farmer: 'Lakshmi',       buyer: 'South Fresh',    price: '₹55/bunch',    qty: '80 bunches',  status: 'Pending',  datetime: 'Today, 7:30 AM' }
  ],
  orders: [
    { id: 'UZ-2048', product: '🍅 Fresh Tomatoes',  farmer: 'Arun Kumar',    buyer: 'Madura Mart',    qty: '80 kg',       price: '₹34/kg',    delivery: '₹120',  total: '₹2,840', date: 'Today, 10:30 AM',    status: 'Order Confirmed' },
    { id: 'UZ-3124', product: '🥥 Coconut',          farmer: 'Kavitha Farms', buyer: 'South Fresh',    qty: '200 pieces',  price: '₹42/piece', delivery: '₹200',  total: '₹8,600', date: 'Yesterday, 3:00 PM', status: 'Completed' },
    { id: 'UZ-5892', product: '🌶️ Red Chillies',    farmer: 'R. Muthu',      buyer: 'Farm Direct Co', qty: '50 kg',       price: '₹120/kg',   delivery: '₹150',  total: '₹6,150', date: '2 days ago',          status: 'In Transit' },
    { id: 'UZ-7734', product: '🥜 Groundnut',        farmer: 'Arun Kumar',    buyer: 'Green Basket',   qty: '100 kg',      price: '₹90/kg',    delivery: '₹100',  total: '₹9,100', date: '3 days ago',          status: 'Pickup' },
    { id: 'UZ-9201', product: '🍆 Brinjal',          farmer: 'Raja',          buyer: 'Green Basket',   qty: '60 kg',       price: '₹28/kg',    delivery: '₹80',   total: '₹1,760', date: '4 days ago',          status: 'Delivered' },
    { id: 'UZ-1547', product: '🌾 Ponni Rice',       farmer: 'M. Selvam',     buyer: 'Salem Traders',  qty: '10 quintal',  price: '₹2,800/qtl',delivery: '₹300',  total: '₹28,300','date': '5 days ago',         status: 'Cancelled' },
    { id: 'UZ-4480', product: '🍌 Banana – Poovan',  farmer: 'Lakshmi',       buyer: 'South Fresh',    qty: '80 bunches',  price: '₹55/bunch', delivery: '₹150',  total: '₹4,550', date: '6 days ago',          status: 'Accepted' }
  ],
  deliveries: [
    { id: 'UZ-2048', farmerName: 'Arun Kumar',    farmerLoc: 'Melur, Madurai',      buyerName: 'Madura Mart',    buyerLoc: 'Madurai City',         dist: '12.4 km', charge: '₹120', eta: '~45 min',   status: 'In Transit' },
    { id: 'UZ-5892', farmerName: 'R. Muthu',      farmerLoc: 'Alanganallur',        buyerName: 'Farm Direct Co', buyerLoc: 'Coimbatore',           dist: '84 km',   charge: '₹150', eta: '~3 hrs',    status: 'Pickup' },
    { id: 'UZ-7734', farmerName: 'Arun Kumar',    farmerLoc: 'Melur, Madurai',      buyerName: 'Green Basket',   buyerLoc: 'Madurai Junction',     dist: '8.9 km',  charge: '₹100', eta: '~30 min',   status: 'Order Confirmed' },
    { id: 'UZ-4480', farmerName: 'Lakshmi',       farmerLoc: 'Vadipatti',           buyerName: 'South Fresh',    buyerLoc: 'Madurai South',        dist: '22.1 km', charge: '₹150', eta: '~1.5 hrs',  status: 'Accepted' }
  ],
  reports: [
    { id: 'RPT-001', type: 'Fake Listing',              reporter: 'Ananya Retail',  reported: 'Lakshmi',        order: '—',       product: 'Banana – Poovan', desc: 'The listed quantity was 120 bunches but only 30 were available at pickup.', status: 'pending',       date: 'Today, 8:00 AM' },
    { id: 'RPT-002', type: 'Order Problem',              reporter: 'Green Basket',   reported: 'Arun Kumar',     order: 'UZ-7734', product: 'Groundnut',       desc: 'Quality of groundnut delivered does not match the description posted.', status: 'investigating', date: 'Yesterday' },
    { id: 'RPT-003', type: 'Incorrect Product Info',     reporter: 'South Fresh',    reported: 'M. Selvam',      order: '—',       product: 'Ponni Rice',      desc: 'Farmer listed rice as Grade A but it is Grade B quality.', status: 'resolved',      date: '3 days ago' },
    { id: 'RPT-004', type: 'Suspicious User',            reporter: 'Farm Direct Co', reported: 'Salem Traders',  order: '—',       product: '—',               desc: 'This buyer has been making offers and cancelling without reason multiple times.', status: 'pending',  date: '4 days ago' }
  ],
  reviews: [
    { id: 3001, reviewer: 'Green Basket',   reviewee: 'Arun Kumar',    role: 'Farmer', rating: 5, text: 'Excellent tomatoes. Very fresh and exactly as described. Will definitely order again!', date: 'Today', reported: false },
    { id: 3002, reviewer: 'South Fresh',    reviewee: 'Kavitha Farms', role: 'Farmer', rating: 5, text: 'Best coconuts in the region. Prompt and professional.', date: 'Yesterday', reported: false },
    { id: 3003, reviewer: 'Madura Mart',    reviewee: 'Arun Kumar',    role: 'Farmer', rating: 4, text: 'Good quality produce. Minor delay in pickup confirmation.', date: '2 days ago', reported: false },
    { id: 3004, reviewer: 'Ananya Retail',  reviewee: 'Lakshmi',       role: 'Farmer', rating: 2, text: 'Quantity was less than posted. Very disappointing.', date: '4 days ago', reported: true },
    { id: 3005, reviewer: 'Farm Direct Co', reviewee: 'R. Muthu',      role: 'Farmer', rating: 4, text: 'Good chillies but could be dried a little more before delivery.', date: '5 days ago', reported: false }
  ],
  notifications: [
    { id: 4001, to: 'All Users',  title: 'Platform Maintenance Notice', body: 'UzhavanGo will be under maintenance tomorrow from 10 PM to 11 PM. Please plan accordingly.', date: 'Today, 9:00 AM', icon: '🔧' },
    { id: 4002, to: 'Farmers',    title: 'Kharif Season Reminder',      body: 'Kharif harvest season is approaching. Start posting your crops now to reach nearby buyers early!', date: 'Yesterday', icon: '🌾' },
    { id: 4003, to: 'Buyers',     title: 'New Feature: Delivery Tracking', body: 'You can now track your order delivery in real-time from the Orders page.', date: '3 days ago', icon: '🚚' }
  ],
  activityLog: [
    { id: 9001, action: 'Product Removed',       target: 'Turmeric (Listing #1008)',      targetType: 'product',  color: 'red',    icon: '🗑️',  time: 'Today, 10:45 AM' },
    { id: 9002, action: 'Notification Sent',     target: 'Platform Maintenance to All',   targetType: 'notif',    color: 'blue',   icon: '🔔',  time: 'Today, 9:00 AM' },
    { id: 9003, action: 'Report Resolved',       target: 'RPT-003 – Incorrect Info',      targetType: 'report',   color: 'green',  icon: '✅',  time: 'Yesterday, 4:00 PM' },
    { id: 9004, action: 'User Deactivated',      target: 'Lakshmi (Farmer)',              targetType: 'user',     color: 'red',    icon: '🚫',  time: 'Yesterday, 2:30 PM' },
    { id: 9005, action: 'Product Approved',      target: 'Fresh Tomatoes – Arun Kumar',  targetType: 'product',  color: 'green',  icon: '✅',  time: '2 days ago, 8:00 AM' },
    { id: 9006, action: 'Review Removed',        target: 'Review #3004 (reported)',       targetType: 'review',   color: 'orange', icon: '⭐',  time: '2 days ago, 11:00 AM' },
    { id: 9007, action: 'Report Opened',         target: 'RPT-002 – Order Problem',       targetType: 'report',   color: 'blue',   icon: '🔵',  time: '3 days ago' },
    { id: 9008, action: 'Notification Sent',     target: 'Kharif Season Reminder to Farmers', targetType: 'notif', color: 'blue', icon: '🔔', time: '3 days ago' }
  ]
};

// ─── AUTH ────────────────────────────────────────────────────
async function adminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPass').value;
  const err = document.getElementById('loginError');
  err.classList.remove('show');
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem('uzAdminUser', JSON.stringify(data.admin));
      err.classList.remove('show');
      showShell();
      nav('dashboard');
    } else {
      err.textContent = data.error || 'Invalid credentials. Please try again.';
      err.classList.add('show');
    }
  } catch (apiErr) {
    err.textContent = 'Unable to connect to authentication server. Please ensure the server is running.';
    err.classList.add('show');
  }
}

function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('uzAdminUser');
  document.getElementById('adminShell').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'grid';
}

function checkAuth() {
  const tok = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!tok) return false;
  try {
    // Check JWT payload or base64 token
    const parts = tok.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.role === 'admin';
    }
    const d = JSON.parse(atob(tok));
    return d.role === 'admin';
  } catch {
    return false;
  }
}

function showShell() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminShell').style.display = 'flex';
}

// ─── ROUTER ─────────────────────────────────────────────────
const SECTION_TITLES = {
  dashboard:'Dashboard', farmers:'Farmer Management', buyers:'Buyer Management',
  products:'Product Management', offers:'Offer Monitoring', orders:'Order Management',
  deliveries:'Delivery Management', reports:'Reports & Complaints', reviews:'Ratings & Reviews',
  notifications:'Notifications', analytics:'Analytics & Reports', activitylog:'Activity Log', settings:'Settings'
};

let currentSection = 'dashboard';

function nav(section) {
  currentSection = section;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + section);
  if (btn) btn.classList.add('active');
  document.getElementById('topbarTitle').textContent = SECTION_TITLES[section] || section;
  const renders = {
    dashboard, farmers, buyers, products, offers, orders,
    deliveries, reports, reviews, notifications, analytics, activitylog, settings
  };
  (renders[section] || dashboard)();
  window.scrollTo(0, 0);
}

// ─── UTILITIES ──────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function logActivity(action, target, targetType, color, icon) {
  db.activityLog.unshift({
    id: Date.now(), action, target, targetType, color: color || 'blue', icon: icon || '📋',
    time: 'Just now'
  });
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

function badgeFor(status) {
  const map = {
    active:'badge-active', inactive:'badge-inactive', pending:'badge-pending',
    investigating:'badge-investigating', resolved:'badge-resolved', rejected:'badge-rejected',
    approved:'badge-approved', removed:'badge-removed', unavailable:'badge-unavailable',
    'Pending':'badge-pending', 'Accepted':'badge-accepted','Order Confirmed':'badge-confirmed',
    'Pickup':'badge-pickup','In Transit':'badge-transit','Delivered':'badge-delivered',
    'Completed':'badge-completed','Cancelled':'badge-cancelled','Closed':'badge-inactive'
  };
  return map[status] || 'badge-pending';
}

function closeModal() { document.getElementById('adminModalRoot').innerHTML = ''; }

function modal(html) {
  document.getElementById('adminModalRoot').innerHTML =
    `<div class="admin-modal-back" onclick="if(event.target===this)closeModal()"><div class="admin-modal">${html}</div></div>`;
}

// ─── CLOCK ───────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
setInterval(updateClock, 1000);

// ═══════════════════════════════════════════════════════════
//  1. DASHBOARD
// ═══════════════════════════════════════════════════════════
function dashboard() {
  const activeDel = db.deliveries.length;
  const completed = db.orders.filter(o => o.status === 'Completed').length;
  const reported  = db.reports.filter(r => r.status === 'pending').length;

  document.getElementById('adminApp').innerHTML = `
    <div class="stats-grid">
      ${statCard('👨‍🌾','green', db.farmers.length,         'Total Farmers',   '+2 this week')}
      ${statCard('🧑‍💼','blue',  db.buyers.length,          'Total Buyers',    '+3 this week')}
      ${statCard('🌾','lime',    db.products.length,        'Total Products',  'listed produce')}
      ${statCard('💰','orange',  db.offers.length,          'Total Offers',    'across all listings')}
      ${statCard('📦','purple',  db.orders.length,          'Total Orders',    'all time')}
      ${statCard('🚚','teal',    activeDel,                 'Active Deliveries','in progress')}
      ${statCard('✅','green',   completed,                 'Completed Orders','successfully closed')}
      ${statCard('⚠️','red',    reported,                  'Reported Issues', 'awaiting review')}
    </div>

    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:18px;margin-bottom:20px">
      <div class="panel-card">
        <h3>Recent Orders</h3>
        <table class="data-table" style="margin-top:-6px">
          <thead><tr><th>Order ID</th><th>Product</th><th>Farmer → Buyer</th><th>Status</th></tr></thead>
          <tbody>${db.orders.slice(0,5).map(o=>`<tr>
            <td><b>${o.id}</b></td>
            <td>${o.product}</td>
            <td style="font-size:12px">${o.farmer} → ${o.buyer}</td>
            <td><span class="badge ${badgeFor(o.status)}">${o.status}</span></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="panel-card">
        <h3>Recent Admin Actions</h3>
        <div class="activity-list">${db.activityLog.slice(0,5).map(a=>`
          <div class="activity-item">
            <div class="activity-dot ${a.color}">${a.icon}</div>
            <div class="activity-content"><b>${a.action}</b><small>${a.target}</small></div>
            <div class="activity-time">${a.time}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
      <div class="panel-card">
        <h3>Platform Health</h3>
        ${healthRow('Active Farmers', db.farmers.filter(f=>f.status==='active').length, db.farmers.length)}
        ${healthRow('Active Buyers',  db.buyers.filter(b=>b.status==='active').length,  db.buyers.length)}
        ${healthRow('Approved Products', db.products.filter(p=>p.status==='approved').length, db.products.length)}
        ${healthRow('Pending Reports',   db.reports.filter(r=>r.status==='pending').length, db.reports.length)}
      </div>
      <div class="panel-card">
        <h3>Offer Status Snapshot</h3>
        ${offerSnap()}
      </div>
      <div class="panel-card">
        <h3>Quick Actions</h3>
        <div style="display:flex;flex-direction:column;gap:9px;margin-top:4px">
          <button class="btn-primary" onclick="nav('farmers')" style="text-align:left">👨‍🌾  Manage Farmers</button>
          <button class="btn-primary" onclick="nav('reports')" style="text-align:left">🚨  Review Reports</button>
          <button class="btn-primary" onclick="nav('notifications')" style="text-align:left">🔔  Send Notification</button>
          <button class="btn-primary" onclick="nav('analytics')" style="text-align:left">📊  View Analytics</button>
        </div>
      </div>
    </div>
  `;
}

function statCard(icon, color, val, label, sub) {
  return `<div class="stat-card">
    <div class="stat-icon ${color}">${icon}</div>
    <div class="stat-info"><small>${label}</small><b>${val}</b><span>${sub}</span></div>
  </div>`;
}

function healthRow(label, val, total) {
  const pct = Math.round((val / total) * 100);
  return `<div style="margin-bottom:12px">
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
      <span>${label}</span><span style="font-weight:700;color:var(--deep)">${val}/${total}</span>
    </div>
    <div style="background:#f1f3f0;border-radius:4px;height:6px">
      <div style="width:${pct}%;background:var(--green);border-radius:4px;height:6px;transition:.3s"></div>
    </div>
  </div>`;
}

function offerSnap() {
  const pending  = db.offers.filter(o=>o.status==='Pending').length;
  const accepted = db.offers.filter(o=>o.status==='Accepted').length;
  const closed   = db.offers.filter(o=>o.status==='Closed').length;
  return ['Pending','Accepted','Closed'].map((s,i)=>{
    const n = [pending, accepted, closed][i];
    const cls = ['badge-pending','badge-accepted','badge-inactive'][i];
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)">
      <span class="badge ${cls}">${s}</span><b style="font-size:18px;color:var(--deep)">${n}</b>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  2. FARMERS
// ═══════════════════════════════════════════════════════════
function farmers(search='', loc='') {
  let list = db.farmers;
  if (search) list = list.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.phone.includes(search));
  if (loc)    list = list.filter(f => f.location.toLowerCase().includes(loc.toLowerCase()));
  const locations = [...new Set(db.farmers.map(f => f.location.split(',')[0].trim()))];
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Manage Farmers</h2><p>${db.farmers.length} registered farmers on the platform</p></div>
      <div class="section-actions">
        <span class="badge badge-active">${db.farmers.filter(f=>f.status==='active').length} Active</span>
        <span class="badge badge-inactive">${db.farmers.filter(f=>f.status==='inactive').length} Inactive</span>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-wrap" style="flex:1"><input placeholder="Search by name or phone..." oninput="farmers(this.value, document.getElementById('farmerLocFilter').value)" value="${search}"/></div>
      <select id="farmerLocFilter" onchange="farmers(document.querySelector('.search-wrap input').value, this.value)">
        <option value="">All Locations</option>
        ${locations.map(l=>`<option value="${l}" ${loc===l?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Farmer</th><th>Phone</th><th>Location</th><th>Joined</th><th>Products</th><th>Orders</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${list.map(f=>`<tr>
          <td><div class="user-cell"><div class="user-avatar">${f.initials}</div><div><div class="user-name">${f.name}</div></div></div></td>
          <td>${f.phone}</td><td>${f.location}</td><td style="font-size:12px;color:var(--muted)">${f.regDate}</td>
          <td><b>${f.products}</b></td><td><b>${f.orders}</b></td>
          <td><span class="stars">${stars(f.rating)}</span><br><small style="color:var(--muted)">${f.rating}/5</small></td>
          <td><span class="badge ${badgeFor(f.status)}">${f.status}</span></td>
          <td><div class="btn-actions">
            <button class="act-btn act-btn-view" onclick="viewFarmer(${f.id})">View</button>
            <button class="act-btn ${f.status==='active'?'act-btn-deactivate':'act-btn-activate'}" onclick="toggleUser('farmer',${f.id})">${f.status==='active'?'Deactivate':'Activate'}</button>
          </div></td>
        </tr>`).join('')}
        ${list.length===0?`<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">👨‍🌾</div><p>No farmers found.</p></div></td></tr>`:''}
        </tbody>
      </table>
    </div>`;
}

function viewFarmer(id) {
  const f = db.farmers.find(x=>x.id===id);
  if (!f) return;
  modal(`<button class="modal-close" onclick="closeModal()">×</button>
    <h2>👨‍🌾 ${f.name}</h2>
    <div class="detail-grid" style="margin-bottom:16px">
      ${detailItem('Phone',f.phone)} ${detailItem('Location',f.location)}
      ${detailItem('Joined',f.regDate)} ${detailItem('Status',f.status.toUpperCase())}
      ${detailItem('Products Listed',f.products)} ${detailItem('Completed Orders',f.orders)}
      ${detailItem('Rating',f.rating+'/5 '+stars(f.rating))} ${detailItem('Account',f.status==='active'?'✅ Active':'❌ Inactive')}
    </div>
    <h3 style="font-size:14px;color:var(--deep);margin-bottom:10px">Listed Products</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${db.products.filter(p=>p.farmer===f.name).map(p=>`
        <div style="display:flex;align-items:center;gap:10px;background:#f8f9f7;border-radius:9px;padding:10px 14px">
          <span style="font-size:22px">${p.emoji}</span>
          <div><b style="font-size:13px">${p.name}</b><br><small style="color:var(--muted)">${p.qty} · ${p.location} · <span class="badge ${badgeFor(p.status)}" style="padding:2px 7px">${p.status}</span></small></div>
        </div>`).join('') || '<p style="color:var(--muted);font-size:13px">No products listed.</p>'}
    </div>
    <div style="margin-top:18px;display:flex;gap:10px">
      <button class="btn-primary" onclick="toggleUser('farmer',${f.id});closeModal()">${f.status==='active'?'Deactivate Account':'Activate Account'}</button>
      <button class="btn-secondary" onclick="closeModal()">Close</button>
    </div>`);
}

function toggleUser(type, id) {
  const list = type === 'farmer' ? db.farmers : db.buyers;
  const u = list.find(x=>x.id===id);
  if (!u) return;
  const wasActive = u.status === 'active';
  u.status = wasActive ? 'inactive' : 'active';
  logActivity(wasActive ? 'User Deactivated' : 'User Activated', `${u.name} (${type})`, 'user', wasActive ? 'red' : 'green', wasActive ? '🚫' : '✅');
  toast(`${u.name} has been ${u.status}.`);
  if (type === 'farmer') farmers(); else buyers();
}

// ═══════════════════════════════════════════════════════════
//  3. BUYERS
// ═══════════════════════════════════════════════════════════
function buyers(search='', loc='') {
  let list = db.buyers;
  if (search) list = list.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase()));
  if (loc)    list = list.filter(b => b.location.toLowerCase().includes(loc.toLowerCase()));
  const locations = [...new Set(db.buyers.map(b=>b.location))];
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Manage Buyers</h2><p>${db.buyers.length} registered buyers on the platform</p></div>
      <div class="section-actions">
        <span class="badge badge-active">${db.buyers.filter(b=>b.status==='active').length} Active</span>
        <span class="badge badge-inactive">${db.buyers.filter(b=>b.status==='inactive').length} Inactive</span>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-wrap" style="flex:1"><input placeholder="Search by name or email..." oninput="buyers(this.value, document.getElementById('buyerLocFilter').value)" value="${search}"/></div>
      <select id="buyerLocFilter" onchange="buyers(document.querySelector('.search-wrap input').value, this.value)">
        <option value="">All Locations</option>
        ${locations.map(l=>`<option value="${l}" ${loc===l?'selected':''}>${l}</option>`).join('')}
      </select>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Buyer</th><th>Email</th><th>Phone</th><th>Location</th><th>Joined</th><th>Offers</th><th>Orders</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${list.map(b=>`<tr>
          <td><div class="user-cell"><div class="user-avatar">${b.initials}</div><div><div class="user-name">${b.name}</div></div></div></td>
          <td style="font-size:12px">${b.email}</td><td>${b.phone}</td><td>${b.location}</td>
          <td style="font-size:12px;color:var(--muted)">${b.regDate}</td>
          <td><b>${b.offers}</b></td><td><b>${b.orders}</b></td>
          <td><span class="stars">${stars(b.rating)}</span><br><small style="color:var(--muted)">${b.rating}/5</small></td>
          <td><span class="badge ${badgeFor(b.status)}">${b.status}</span></td>
          <td><div class="btn-actions">
            <button class="act-btn act-btn-view" onclick="viewBuyer(${b.id})">View</button>
            <button class="act-btn ${b.status==='active'?'act-btn-deactivate':'act-btn-activate'}" onclick="toggleUser('buyer',${b.id})">${b.status==='active'?'Deactivate':'Activate'}</button>
          </div></td>
        </tr>`).join('')}
        ${list.length===0?`<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">🧑‍💼</div><p>No buyers found.</p></div></td></tr>`:''}
        </tbody>
      </table>
    </div>`;
}

function viewBuyer(id) {
  const b = db.buyers.find(x=>x.id===id);
  if (!b) return;
  modal(`<button class="modal-close" onclick="closeModal()">×</button>
    <h2>🧑‍💼 ${b.name}</h2>
    <div class="detail-grid" style="margin-bottom:16px">
      ${detailItem('Email',b.email)} ${detailItem('Phone',b.phone)}
      ${detailItem('Location',b.location)} ${detailItem('Joined',b.regDate)}
      ${detailItem('Total Offers Made',b.offers)} ${detailItem('Total Orders',b.orders)}
      ${detailItem('Rating',b.rating+'/5 '+stars(b.rating))} ${detailItem('Status',b.status==='active'?'✅ Active':'❌ Inactive')}
    </div>
    <h3 style="font-size:14px;color:var(--deep);margin-bottom:10px">Recent Offers</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      ${db.offers.filter(o=>o.buyer===b.name).map(o=>`
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f8f9f7;border-radius:9px;padding:10px 14px">
          <div><b style="font-size:13px">${o.product}</b><br><small style="color:var(--muted)">${o.qty} · ${o.price} · ${o.datetime}</small></div>
          <span class="badge ${badgeFor(o.status)}">${o.status}</span>
        </div>`).join('') || '<p style="color:var(--muted);font-size:13px">No offers placed.</p>'}
    </div>
    <div style="margin-top:18px;display:flex;gap:10px">
      <button class="btn-primary" onclick="toggleUser('buyer',${b.id});closeModal()">${b.status==='active'?'Deactivate Account':'Activate Account'}</button>
      <button class="btn-secondary" onclick="closeModal()">Close</button>
    </div>`);
}

function detailItem(label, val) {
  return `<div class="detail-item"><small>${label}</small><b>${val}</b></div>`;
}

// ═══════════════════════════════════════════════════════════
//  4. PRODUCTS
// ═══════════════════════════════════════════════════════════
function products(search='', cat='', stat='') {
  let list = db.products;
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.farmer.toLowerCase().includes(search.toLowerCase()));
  if (cat)    list = list.filter(p => p.category === cat);
  if (stat)   list = list.filter(p => p.status === stat);
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Product Management</h2><p>${db.products.length} products listed on the platform</p></div>
      <div class="section-actions">
        <span class="badge badge-approved">${db.products.filter(p=>p.status==='approved').length} Approved</span>
        <span class="badge badge-pending">${db.products.filter(p=>p.status==='pending').length} Pending</span>
        <span class="badge badge-removed">${db.products.filter(p=>p.status==='removed').length} Removed</span>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-wrap" style="flex:1"><input placeholder="Search product or farmer..." oninput="products(this.value,document.getElementById('catFilter').value,document.getElementById('statFilter').value)" value="${search}"/></div>
      <select id="catFilter" onchange="products(document.querySelector('.search-wrap input').value,this.value,document.getElementById('statFilter').value)">
        <option value="">All Categories</option>
        <option value="Vegetables" ${cat==='Vegetables'?'selected':''}>🥬 Vegetables</option>
        <option value="Grains" ${cat==='Grains'?'selected':''}>🌾 Grains</option>
        <option value="Fruits" ${cat==='Fruits'?'selected':''}>🍌 Fruits</option>
      </select>
      <select id="statFilter" onchange="products(document.querySelector('.search-wrap input').value,document.getElementById('catFilter').value,this.value)">
        <option value="">All Status</option>
        <option value="approved" ${stat==='approved'?'selected':''}>Approved</option>
        <option value="pending" ${stat==='pending'?'selected':''}>Pending</option>
        <option value="removed" ${stat==='removed'?'selected':''}>Removed</option>
        <option value="unavailable" ${stat==='unavailable'?'selected':''}>Unavailable</option>
      </select>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Product</th><th>Farmer</th><th>Qty</th><th>Location</th><th>Category</th><th>Status</th><th>Date Posted</th><th>Actions</th></tr></thead>
        <tbody>${list.map(p=>`<tr>
          <td><div class="user-cell"><div class="user-avatar" style="font-size:19px;background:#f0f9d4;width:38px;height:38px">${p.emoji}</div><div class="user-name">${p.name}</div></div></td>
          <td>${p.farmer}</td><td>${p.qty}</td><td style="font-size:12px">${p.location}</td>
          <td><small>${p.category}</small></td>
          <td><span class="badge ${badgeFor(p.status)}">${p.status}</span></td>
          <td style="font-size:12px;color:var(--muted)">${p.date}</td>
          <td><div class="btn-actions">
            ${p.status!=='approved'   ?`<button class="act-btn act-btn-approve" onclick="productAction(${p.id},'approved')">Approve</button>`:''}
            ${p.status!=='removed'    ?`<button class="act-btn act-btn-remove" onclick="productAction(${p.id},'removed')">Remove</button>`:''}
            ${p.status!=='unavailable'?`<button class="act-btn act-btn-deactivate" onclick="productAction(${p.id},'unavailable')">Unavailable</button>`:''}
          </div></td>
        </tr>`).join('')}
        ${list.length===0?`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🌾</div><p>No products match the filter.</p></div></td></tr>`:''}
        </tbody>
      </table>
    </div>`;
}

function productAction(id, newStatus) {
  const p = db.products.find(x=>x.id===id);
  if (!p) return;
  const old = p.status;
  p.status = newStatus;
  const actionLabel = newStatus==='approved'?'Product Approved':newStatus==='removed'?'Product Removed':'Product Marked Unavailable';
  const color = newStatus==='approved'?'green':newStatus==='removed'?'red':'orange';
  const icon  = newStatus==='approved'?'✅':newStatus==='removed'?'🗑️':'⏸️';
  logActivity(actionLabel, `${p.name} – ${p.farmer}`, 'product', color, icon);
  toast(`${p.name} marked as "${newStatus}".`);
  products();
}

// ═══════════════════════════════════════════════════════════
//  5. OFFERS
// ═══════════════════════════════════════════════════════════
function offers(search='', stat='') {
  let list = db.offers;
  if (search) list = list.filter(o => o.product.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase()) || o.farmer.toLowerCase().includes(search.toLowerCase()));
  if (stat)   list = list.filter(o => o.status === stat);
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Offer Monitoring</h2><p>Admin-only view — buyers cannot see each other's offers.</p></div>
    </div>
    <div class="privacy-notice">
      🔒 <div><b>Offer Privacy Active</b> — This view is exclusive to Admin. Each buyer sees only their own offer on the platform. Other buyers' prices and identities are never shown to them.</div>
    </div>
    <div class="filter-bar">
      <div class="search-wrap" style="flex:1"><input placeholder="Search product, farmer or buyer..." oninput="offers(this.value,document.getElementById('offerStatFilter').value)" value="${search}"/></div>
      <select id="offerStatFilter" onchange="offers(document.querySelector('.search-wrap input').value,this.value)">
        <option value="">All Status</option>
        <option value="Pending" ${stat==='Pending'?'selected':''}>Pending</option>
        <option value="Accepted" ${stat==='Accepted'?'selected':''}>Accepted</option>
        <option value="Closed" ${stat==='Closed'?'selected':''}>Closed</option>
      </select>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>#</th><th>Product</th><th>Farmer</th><th>Buyer</th><th>Offered Price</th><th>Quantity</th><th>Status</th><th>Date / Time</th></tr></thead>
        <tbody>${list.map((o,i)=>`<tr>
          <td style="color:var(--muted);font-size:12px">${o.id}</td>
          <td><b>${o.product}</b></td><td>${o.farmer}</td><td>${o.buyer}</td>
          <td style="font-weight:700;color:var(--green)">${o.price}</td>
          <td>${o.qty}</td>
          <td><span class="badge ${badgeFor(o.status)}">${o.status}</span></td>
          <td style="font-size:12px;color:var(--muted)">${o.datetime}</td>
        </tr>`).join('')}
        ${list.length===0?`<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">💰</div><p>No offers match.</p></div></td></tr>`:''}
        </tbody>
      </table>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  6. ORDERS
// ═══════════════════════════════════════════════════════════
function orders(search='', stat='') {
  let list = db.orders;
  if (search) list = list.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.product.toLowerCase().includes(search.toLowerCase()) || o.farmer.toLowerCase().includes(search.toLowerCase()) || o.buyer.toLowerCase().includes(search.toLowerCase()));
  if (stat)   list = list.filter(o => o.status === stat);
  const statuses = ['Accepted','Order Confirmed','Pickup','In Transit','Delivered','Completed','Cancelled'];
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Order Management</h2><p>${db.orders.length} total orders on the platform</p></div>
    </div>
    <div class="filter-bar">
      <div class="search-wrap" style="flex:1"><input placeholder="Search order ID, product, farmer or buyer..." oninput="orders(this.value,document.getElementById('orderStatFilter').value)" value="${search}"/></div>
      <select id="orderStatFilter" onchange="orders(document.querySelector('.search-wrap input').value,this.value)">
        <option value="">All Statuses</option>
        ${statuses.map(s=>`<option value="${s}" ${stat===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>
    <div class="data-table-wrap">
      <table class="data-table">
        <thead><tr><th>Order ID</th><th>Product</th><th>Farmer</th><th>Buyer</th><th>Qty</th><th>Price</th><th>Delivery</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>${list.map(o=>`<tr>
          <td><b style="color:var(--green)">${o.id}</b></td>
          <td>${o.product}</td><td>${o.farmer}</td><td>${o.buyer}</td>
          <td>${o.qty}</td>
          <td style="font-size:12px">${o.price}</td>
          <td style="font-size:12px">${o.delivery}</td>
          <td><b>${o.total}</b></td>
          <td style="font-size:12px;color:var(--muted)">${o.date}</td>
          <td><span class="badge ${badgeFor(o.status)}">${o.status}</span></td>
        </tr>`).join('')}
        ${list.length===0?`<tr><td colspan="10"><div class="empty-state"><div class="empty-icon">📦</div><p>No orders match.</p></div></td></tr>`:''}
        </tbody>
      </table>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  7. DELIVERIES
// ═══════════════════════════════════════════════════════════
function deliveries() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head"><div><h2>Delivery Management</h2><p>Monitor active deliveries across the platform.</p></div></div>
    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:22px">
      ${statCard('🚚','teal',   db.deliveries.length,                           'Active Deliveries',  'currently tracked')}
      ${statCard('📍','orange', db.deliveries.filter(d=>d.status==='Pickup').length, 'At Pickup',         'farmer ready')}
      ${statCard('🛣️','blue',  db.deliveries.filter(d=>d.status==='In Transit').length, 'In Transit',  'on the way')}
      ${statCard('✅','green',  db.orders.filter(o=>o.status==='Delivered').length,'Delivered Today',  'successfully')}
    </div>
    <div class="delivery-grid">
      ${db.deliveries.map(d=>`
        <div class="delivery-card">
          <div class="order-id">Order: ${d.id}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span class="badge ${badgeFor(d.status)}">${d.status}</span>
            <small style="color:var(--muted)">ETA: ${d.eta}</small>
          </div>
          <div class="route-viz">
            <div class="route-node farmer-node">
              <div class="node-label">👨‍🌾 Farmer (Origin)</div>
              <div class="node-name">${d.farmerName}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${d.farmerLoc}</div>
            </div>
            <div class="route-connector"></div>
            <div class="route-node truck-node">
              <div class="node-label">🚚 Delivery Route</div>
              <div class="node-name">${d.dist} · ${d.charge}</div>
            </div>
            <div class="route-connector"></div>
            <div class="route-node buyer-node">
              <div class="node-label">🧑‍💼 Buyer (Destination)</div>
              <div class="node-name">${d.buyerName}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px">${d.buyerLoc}</div>
            </div>
          </div>
          <div class="delivery-meta">
            <div class="delivery-meta-item"><small>Distance</small><b>${d.dist}</b></div>
            <div class="delivery-meta-item"><small>Delivery Charge</small><b>${d.charge}</b></div>
            <div class="delivery-meta-item"><small>ETA</small><b>${d.eta}</b></div>
            <div class="delivery-meta-item"><small>Status</small><b>${d.status}</b></div>
          </div>
        </div>`).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  8. REPORTS
// ═══════════════════════════════════════════════════════════
function reports(filterStat='') {
  let list = db.reports;
  if (filterStat) list = list.filter(r => r.status === filterStat);
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Reports & Complaints</h2><p>${db.reports.length} total reports submitted by users</p></div>
      <div class="section-actions">
        <span class="badge badge-pending">🟡 ${db.reports.filter(r=>r.status==='pending').length} Pending</span>
        <span class="badge badge-investigating">🔵 ${db.reports.filter(r=>r.status==='investigating').length} Investigating</span>
        <span class="badge badge-resolved">🟢 ${db.reports.filter(r=>r.status==='resolved').length} Resolved</span>
      </div>
    </div>
    <div class="filter-bar">
      <select onchange="reports(this.value)">
        <option value="" ${filterStat===''?'selected':''}>All Reports</option>
        <option value="pending" ${filterStat==='pending'?'selected':''}>🟡 Pending</option>
        <option value="investigating" ${filterStat==='investigating'?'selected':''}>🔵 Investigating</option>
        <option value="resolved" ${filterStat==='resolved'?'selected':''}>🟢 Resolved</option>
        <option value="rejected" ${filterStat==='rejected'?'selected':''}>🔴 Rejected</option>
      </select>
    </div>
    <div class="report-list">
      ${list.map(r=>`
        <div class="report-card">
          <div class="report-header">
            <div>
              <div style="display:flex;gap:9px;align-items:center">
                <b>${r.id}</b>
                <span class="badge badge-${r.status}">
                  ${r.status==='pending'?'🟡':r.status==='investigating'?'🔵':r.status==='resolved'?'🟢':'🔴'} ${r.status}
                </span>
              </div>
              <div class="report-type" style="margin-top:6px">${r.type}</div>
            </div>
            <small style="color:var(--muted);font-size:12px">${r.date}</small>
          </div>
          <div class="report-meta">
            Reported by: <b>${r.reporter}</b> &nbsp;·&nbsp; Against: <b>${r.reported}</b>
            ${r.order!=='—'?`&nbsp;·&nbsp; Order: <b>${r.order}</b>`:''}
            ${r.product!=='—'?`&nbsp;·&nbsp; Product: <b>${r.product}</b>`:''}
          </div>
          <div class="report-desc">${r.desc}</div>
          <div class="report-actions">
            ${r.status!=='investigating'&&r.status!=='resolved'&&r.status!=='rejected'?`<button class="act-btn act-btn-investigate" onclick="reportAction('${r.id}','investigating')">🔵 Investigate</button>`:''}
            ${r.status!=='resolved'?`<button class="act-btn act-btn-resolve" onclick="reportAction('${r.id}','resolved')">🟢 Mark Resolved</button>`:''}
            ${r.status!=='rejected'&&r.status!=='resolved'?`<button class="act-btn act-btn-reject" onclick="reportAction('${r.id}','rejected')">🔴 Reject</button>`:''}
          </div>
        </div>`).join('')}
      ${list.length===0?`<div class="empty-state"><div class="empty-icon">🚨</div><p>No reports match the filter.</p></div>`:''}
    </div>`;
}

function reportAction(id, newStatus) {
  const r = db.reports.find(x=>x.id===id);
  if (!r) return;
  r.status = newStatus;
  const label = newStatus==='investigating'?'Report Under Investigation':newStatus==='resolved'?'Report Resolved':'Report Rejected';
  const color = newStatus==='resolved'?'green':newStatus==='rejected'?'red':'blue';
  logActivity(label, `${r.id} – ${r.type}`, 'report', color, newStatus==='resolved'?'✅':newStatus==='rejected'?'❌':'🔵');
  toast(`Report ${r.id} updated to "${newStatus}".`);
  reports();
}

// ═══════════════════════════════════════════════════════════
//  9. REVIEWS
// ═══════════════════════════════════════════════════════════
function reviews() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head">
      <div><h2>Ratings & Reviews</h2><p>Monitor platform reviews. Admins may remove reviews that violate platform rules.</p></div>
    </div>
    <div class="privacy-notice" style="background:#fff3cd;border-color:#ffc107">
      ⚠️ <div><b>Important:</b> Admin can only <em>remove</em> abusive or fake reviews. Genuine ratings cannot be artificially altered.</div>
    </div>
    <div class="review-list">
      ${db.reviews.map(r=>`
        <div class="review-card" ${r.reported?'style="border-color:#f0a4a4"':''}>
          <div>
            ${r.reported?'<span class="badge badge-rejected" style="margin-bottom:6px">⚠️ Reported</span><br>':''}
            <div style="display:flex;align-items:center;gap:8px">
              <div class="user-avatar" style="width:32px;height:32px;font-size:11px">${r.reviewer.slice(0,2).toUpperCase()}</div>
              <div>
                <b style="font-size:13px">${r.reviewer}</b> → <span style="color:var(--muted)">${r.reviewee}</span>
                <span class="badge badge-pending" style="margin-left:6px;padding:2px 7px">${r.role}</span>
              </div>
            </div>
            <div class="review-meta"><span class="stars">${stars(r.rating)}</span> ${r.rating}/5 &nbsp;·&nbsp; ${r.date}</div>
            <div class="review-text">${r.text}</div>
          </div>
          <div style="flex-shrink:0">
            <button class="act-btn act-btn-remove" onclick="removeReview(${r.id})">Remove</button>
          </div>
        </div>`).join('')}
      ${db.reviews.length===0?`<div class="empty-state"><div class="empty-icon">⭐</div><p>No reviews yet.</p></div>`:''}
    </div>`;
}

function removeReview(id) {
  const r = db.reviews.find(x=>x.id===id);
  if (!r) return;
  if (!confirm(`Remove review by ${r.reviewer} for ${r.reviewee}?`)) return;
  db.reviews.splice(db.reviews.indexOf(r), 1);
  logActivity('Review Removed', `Review #${id} by ${r.reviewer}`, 'review', 'orange', '⭐');
  toast('Review removed from the platform.');
  reviews();
}

// ═══════════════════════════════════════════════════════════
//  10. NOTIFICATIONS
// ═══════════════════════════════════════════════════════════
function notifications() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head"><div><h2>Notification Management</h2><p>Send announcements and alerts to platform users.</p></div></div>
    <div class="notif-layout">
      <div class="panel-card">
        <h3>📢 Send Notification</h3>
        <form class="notif-form" onsubmit="sendNotification(event)">
          <div class="form-group">
            <label>Recipient Group</label>
            <select name="to" required>
              <option value="All Users">All Users</option>
              <option value="Farmers">Farmers only</option>
              <option value="Buyers">Buyers only</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notification Title</label>
            <input name="title" required placeholder="e.g. Upcoming Maintenance"/>
          </div>
          <div class="form-group">
            <label>Message Body</label>
            <textarea name="body" required placeholder="Write your message here..."></textarea>
          </div>
          <button type="submit" class="btn-primary" style="width:100%">📤 Send Notification</button>
        </form>
      </div>
      <div class="panel-card">
        <h3>📬 Sent Notifications</h3>
        <div>${db.notifications.map(n=>`
          <div class="notif-history-item">
            <div class="notif-icon">${n.icon}</div>
            <div class="notif-body">
              <b>${n.title}</b>
              <small>To: ${n.to} &nbsp;·&nbsp; ${n.date}</small>
              <div style="font-size:12px;color:#526359;margin-top:5px">${n.body}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function sendNotification(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const icons = {'All Users':'📣','Farmers':'🌾','Buyers':'🧺'};
  const n = { id: Date.now(), to: f.get('to'), title: f.get('title'), body: f.get('body'), date: 'Just now', icon: icons[f.get('to')] || '📣' };
  db.notifications.unshift(n);
  logActivity('Notification Sent', `${n.title} → ${n.to}`, 'notif', 'blue', '🔔');
  toast(`Notification sent to ${n.to}!`);
  e.target.reset();
  notifications();
}

// ═══════════════════════════════════════════════════════════
//  11. ANALYTICS
// ═══════════════════════════════════════════════════════════
function analytics() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head"><div><h2>Analytics & Reports</h2><p>Platform insights and performance metrics.</p></div></div>
    <div class="analytics-grid">
      <div class="chart-card"><h3>📦 Orders by Status</h3><div class="chart-wrap"><canvas id="orderChart"></canvas></div></div>
      <div class="chart-card"><h3>🌾 Top Listed Crops</h3><div class="chart-wrap"><canvas id="cropChart"></canvas></div></div>
      <div class="chart-card"><h3>👥 User Growth (Monthly)</h3><div class="chart-wrap"><canvas id="userChart"></canvas></div></div>
      <div class="chart-card"><h3>💰 Offer Status Breakdown</h3><div class="chart-wrap"><canvas id="offerChart"></canvas></div></div>
    </div>
    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
      ${statCard('👨‍🌾','green', db.farmers.length,       'Total Farmers',  db.farmers.filter(f=>f.status==='active').length+' active')}
      ${statCard('🧑‍💼','blue',  db.buyers.length,        'Total Buyers',   db.buyers.filter(b=>b.status==='active').length+' active')}
      ${statCard('🌾','lime',    db.products.filter(p=>p.status==='approved').length, 'Active Products','available now')}
      ${statCard('📦','purple',  db.orders.filter(o=>o.status==='Completed').length,  'Completed Orders','successfully closed')}
    </div>
    <div class="location-table">
      <table>
        <thead><tr><th>District / City</th><th>Farmers</th><th>Buyers</th><th>Products</th><th>Orders</th><th>Activity</th></tr></thead>
        <tbody>
          ${locationRows()}
        </tbody>
      </table>
    </div>`;

  setTimeout(() => {
    // Orders by Status (Doughnut)
    new Chart(document.getElementById('orderChart'), {
      type:'doughnut',
      data:{labels:['Completed','In Transit','Confirmed','Pickup','Delivered','Cancelled','Accepted'],
            datasets:[{data:[1,1,1,1,1,1,1],backgroundColor:['#1f6b45','#3b82f6','#8b5cf6','#f59e0b','#c9e265','#c65047','#34d399'],borderWidth:2}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right',labels:{font:{size:11},boxWidth:12}}}}
    });
    // Top Crops (Bar)
    new Chart(document.getElementById('cropChart'), {
      type:'bar',
      data:{labels:['Tomatoes','Rice','Coconut','Chillies','Banana','Brinjal','Groundnut'],
            datasets:[{label:'Listings',data:[3,2,2,2,1,2,2],backgroundColor:'#c9e265',borderRadius:6}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#f1f3f0'}},x:{grid:{display:false}}}}
    });
    // User Growth (Line)
    new Chart(document.getElementById('userChart'), {
      type:'line',
      data:{labels:['Jan','Feb','Mar','Apr','May','Jun'],
            datasets:[
              {label:'Farmers',data:[2,4,6,8,10,12],borderColor:'#1f6b45',backgroundColor:'#1f6b4520',tension:.4,fill:true,pointRadius:4},
              {label:'Buyers', data:[1,3,5,9,12,16],borderColor:'#3b82f6',backgroundColor:'#3b82f620',tension:.4,fill:true,pointRadius:4}
            ]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{font:{size:11},boxWidth:12}}},scales:{y:{beginAtZero:true,grid:{color:'#f1f3f0'}},x:{grid:{display:false}}}}
    });
    // Offer Status (Bar)
    new Chart(document.getElementById('offerChart'), {
      type:'bar',
      data:{labels:['Pending','Accepted','Closed'],
            datasets:[{data:[db.offers.filter(o=>o.status==='Pending').length, db.offers.filter(o=>o.status==='Accepted').length, db.offers.filter(o=>o.status==='Closed').length],
                       backgroundColor:['#f59e0b','#1f6b45','#9ca3af'],borderRadius:7}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,grid:{color:'#f1f3f0'}},x:{grid:{display:false}}}}
    });
  }, 100);
}

function locationRows() {
  const data = [
    { city:'Madurai',      farmers:4, buyers:4, products:5, orders:5 },
    { city:'Thirumangalam',farmers:1, buyers:0, products:2, orders:1 },
    { city:'Usilampatti',  farmers:1, buyers:0, products:1, orders:2 },
    { city:'Vadipatti',    farmers:1, buyers:0, products:1, orders:1 },
    { city:'Coimbatore',   farmers:0, buyers:1, products:0, orders:1 },
    { city:'Salem',        farmers:0, buyers:1, products:0, orders:1 }
  ];
  const max = Math.max(...data.map(d=>d.orders));
  return data.map(d=>`<tr>
    <td><b>${d.city}</b></td>
    <td>${d.farmers}</td><td>${d.buyers}</td><td>${d.products}</td><td>${d.orders}</td>
    <td><div class="location-bar-wrap"><div style="font-size:12px;color:var(--muted)">${d.orders} orders</div>
      <div class="location-bar" style="width:${Math.round((d.orders/max)*100)}px"></div></div></td>
  </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════
//  12. ACTIVITY LOG
// ═══════════════════════════════════════════════════════════
function activitylog() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head"><div><h2>Admin Activity Log</h2><p>A record of all administrative actions taken on the platform.</p></div></div>
    <div class="panel-card">
      <div class="activity-list">
        ${db.activityLog.map(a=>`
          <div class="activity-item">
            <div class="activity-dot ${a.color}">${a.icon}</div>
            <div class="activity-content">
              <b>${a.action}</b>
              <small>Target: ${a.target} &nbsp;·&nbsp; Type: ${a.targetType}</small>
            </div>
            <div class="activity-time">${a.time}</div>
          </div>`).join('')}
        ${db.activityLog.length===0?`<div class="empty-state"><div class="empty-icon">📋</div><p>No admin actions recorded yet.</p></div>`:''}
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  13. SETTINGS
// ═══════════════════════════════════════════════════════════
function settings() {
  document.getElementById('adminApp').innerHTML = `
    <div class="section-head"><div><h2>Platform Settings</h2><p>Configure UzhavanGo platform options.</p></div></div>
    <div class="settings-grid">
      <div class="settings-card">
        <h3>Platform Features</h3>
        ${settingToggle('Allow New Farmer Registrations','Farmers can register on the platform',true)}
        ${settingToggle('Allow New Buyer Registrations','Buyers can register on the platform',true)}
        ${settingToggle('Delivery Tracking','Show real-time delivery status to users',true)}
        ${settingToggle('Rating System','Enable ratings and reviews',true)}
        ${settingToggle('Offer Notifications','Notify farmers when new offers arrive',true)}
      </div>
      <div class="settings-card">
        <h3>Security & Privacy</h3>
        ${settingToggle('Offer Privacy Mode','Hide buyer prices from other buyers',true)}
        ${settingToggle('Phone Verification (OTP)','Require OTP for registration',false)}
        ${settingToggle('Admin Activity Logging','Log all admin actions',true)}
        ${settingToggle('Suspicious Activity Alerts','Alert admin on unusual activity',true)}
        ${settingToggle('Maintenance Mode','Put platform in read-only mode',false)}
      </div>
      <div class="settings-card">
        <h3>Platform Info</h3>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">
          ${infoRow('Platform Name','UzhavanGo')}
          ${infoRow('Version','1.0.0-alpha')}
          ${infoRow('Region','Tamil Nadu, India')}
          ${infoRow('Currency','INR (₹)')}
          ${infoRow('Admin Access','Active (Super Administrator)')}
          ${infoRow('API Status','✅ Running on port 3000')}
        </div>
      </div>
      <div class="settings-card">
        <h3>Database Tables</h3>
        ${tableInfo('admins','Admin accounts & roles')}
        ${tableInfo('users','Farmers & buyers')}
        ${tableInfo('posts','Farmer harvest listings')}
        ${tableInfo('offers','Buyer price offers')}
        ${tableInfo('orders','Trade orders')}
        ${tableInfo('reports','User complaints')}
        ${tableInfo('admin_activity_logs','Admin action history')}
      </div>
    </div>`;
}

function settingToggle(label, desc, on) {
  return `<div class="settings-row">
    <div><label>${label}</label><small>${desc}</small></div>
    <button class="toggle ${on?'on':''}" onclick="this.classList.toggle('on');toast('Setting updated.')"></button>
  </div>`;
}

function infoRow(label, val) {
  return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:13px">
    <span style="color:var(--muted)">${label}</span><b>${val}</b>
  </div>`;
}

function tableInfo(name, desc) {
  return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)">
    <code style="background:#f1f3f0;padding:3px 8px;border-radius:5px;font-size:12px;color:var(--deep)">${name}</code>
    <span style="font-size:12px;color:var(--muted)">${desc}</span>
  </div>`;
}

// ─── INIT ────────────────────────────────────────────────────
(function init() {
  updateClock();
  if (checkAuth()) {
    showShell();
    nav('dashboard');
  }
})();
