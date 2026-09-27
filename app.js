/* ============================================================
   UZHAVANGO — Unified Role-Based Platform
   Modules: 👨‍🌾 Farmer | 🧑‍💼 Buyer | 👨‍💻 Admin
   Single Integrated Application Shell
   ============================================================ */

'use strict';

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
const ADMIN_TOKEN_KEY = 'uzAdminToken';

// ─── STATE MANAGEMENT ─────────────────────────────────────────
const state = {
  role: localStorage.uzRole || 'farmer',
  user: JSON.parse(localStorage.uzUser || 'null') || { name: 'Arun Kumar', role: 'farmer', phone: '+91 98765 43210' },
  listings: JSON.parse(localStorage.uzListings || 'null') || [
    { id: 1, product: 'Fresh Tomatoes', emoji: '🍅', image: null, grade: 'Grade A (Field-grown)', quantity: 240, unit: 'kg', location: 'Melur, Madurai', distance: 3.2, farmer: 'Arun Kumar', description: 'Harvested this morning. Naturally ripened field tomatoes.', offers: [{ buyer: 'Green Basket', initial: 'GB', price: 31, quantity: 100, distance: 2.1, time: '18 min ago' }, { buyer: 'Madura Mart', initial: 'MM', price: 34, quantity: 80, distance: 8.4, time: '42 min ago' }], status: 'Offer Received' },
    { id: 2, product: 'Ponni Rice', emoji: '🌾', image: null, grade: 'Organic Certified', quantity: 18, unit: 'quintal', location: 'Thirumangalam', distance: 7.8, farmer: 'M. Selvam', description: 'Naturally grown Ponni paddy, ready to collect.', offers: [], status: 'Posted' },
    { id: 3, product: 'Coconut', emoji: '🥥', image: null, grade: 'Premium Grade', quantity: 350, unit: 'pieces', location: 'Usilampatti', distance: 12.5, farmer: 'Kavitha Farms', description: 'Mature coconuts, ideal for retail or oil pressing.', offers: [{ buyer: 'South Fresh', initial: 'SF', price: 42, quantity: 200, distance: 11.9, time: '2 hr ago' }], status: 'Offer Received' },
    { id: 4, product: 'Red Chillies', emoji: '🌶️', image: null, grade: 'Sun-Dried A1', quantity: 75, unit: 'kg', location: 'Alanganallur', distance: 15.4, farmer: 'R. Muthu', description: 'Sun-dried red chillies from this season.', offers: [], status: 'Posted' },
    { id: 5, product: 'Banana — Poovan', emoji: '🍌', image: null, grade: 'Fresh Harvest', quantity: 120, unit: 'bunches', location: 'Vadipatti', distance: 9.1, farmer: 'Lakshmi', description: 'Fresh Poovan banana bunches, ready for pickup.', offers: [], status: 'Posted' },
    { id: 6, product: 'Brinjal', emoji: '🍆', image: null, grade: 'Grade A', quantity: 90, unit: 'kg', location: 'Othakadai', distance: 5.7, farmer: 'Raja', description: 'Tender purple brinjals, freshly harvested.', offers: [], status: 'Posted' }
  ],
  orders: JSON.parse(localStorage.uzOrders || 'null') || [
    { id: 'UZ-2048', product: 'Fresh Tomatoes', emoji: '🍅', image: null, quantity: '80 kg', party: 'Madura Mart', farmer: 'Arun Kumar', buyer: 'Madura Mart', price: '₹2,720', rawPrice: 2720, status: 'Accepted', paymentStatus: 'Pending', date: 'Today, 10:30 AM' },
    { id: 'UZ-3124', product: 'Coconut', emoji: '🥥', image: null, quantity: '200 pieces', party: 'South Fresh', farmer: 'Kavitha Farms', buyer: 'South Fresh', price: '₹8,400', rawPrice: 8400, status: 'Order Confirmed', paymentStatus: 'Paid', txnId: 'TXN-849201', date: 'Yesterday, 3:00 PM' }
  ],
  payments: JSON.parse(localStorage.uzPayments || 'null') || [
    { id: 1, txnId: 'TXN-849201', orderId: 'UZ-3124', amount: '₹8,400', method: 'UPI (GPay)', buyer: 'South Fresh', farmer: 'Kavitha Farms', date: 'Yesterday, 3:05 PM', status: 'Success' }
  ],
  // Admin Data Store
  adminData: {
    farmers: [
      { id: 1, name: 'Arun Kumar', initials: 'AK', phone: '+91 98765 43210', location: 'Melur, Madurai', regDate: '12 Jan 2025', products: 4, orders: 18, rating: 4.8, status: 'active' },
      { id: 2, name: 'M. Selvam', initials: 'MS', phone: '+91 94432 10987', location: 'Thirumangalam', regDate: '05 Feb 2025', products: 2, orders: 11, rating: 4.5, status: 'active' },
      { id: 3, name: 'Kavitha Farms', initials: 'KF', phone: '+91 87654 32109', location: 'Usilampatti', regDate: '22 Mar 2025', products: 3, orders: 27, rating: 4.9, status: 'active' },
      { id: 4, name: 'R. Muthu', initials: 'RM', phone: '+91 99887 76543', location: 'Alanganallur', regDate: '08 Apr 2025', products: 2, orders: 9, rating: 4.3, status: 'active' },
      { id: 5, name: 'Lakshmi', initials: 'LK', phone: '+91 93344 55678', location: 'Vadipatti', regDate: '15 May 2025', products: 1, orders: 6, rating: 4.6, status: 'inactive' },
      { id: 6, name: 'Raja', initials: 'RJ', phone: '+91 91234 56789', location: 'Othakadai', regDate: '03 Jun 2025', products: 2, orders: 14, rating: 4.7, status: 'active' }
    ],
    buyers: [
      { id: 101, name: 'Green Basket', initials: 'GB', phone: '+91 98001 11234', email: 'hello@greenbasket.in', location: 'Madurai', regDate: '20 Jan 2025', offers: 12, orders: 9, rating: 4.7, status: 'active' },
      { id: 102, name: 'Madura Mart', initials: 'MM', phone: '+91 97002 22345', email: 'buy@maduramart.com', location: 'Madurai', regDate: '10 Feb 2025', offers: 8, orders: 6, rating: 4.4, status: 'active' },
      { id: 103, name: 'South Fresh', initials: 'SF', phone: '+91 96003 33456', email: 'info@southfresh.co', location: 'Madurai', regDate: '18 Mar 2025', offers: 15, orders: 12, rating: 4.8, status: 'active' },
      { id: 104, name: 'Ananya Retail', initials: 'AR', phone: '+91 95004 44567', email: 'ananya@example.com', location: 'Madurai', regDate: '02 Apr 2025', offers: 5, orders: 4, rating: 4.6, status: 'active' },
      { id: 105, name: 'Farm Direct Co', initials: 'FD', phone: '+91 94005 55678', email: 'orders@farmdirect.in', location: 'Coimbatore', regDate: '25 May 2025', offers: 20, orders: 17, rating: 4.5, status: 'active' },
      { id: 106, name: 'Salem Traders', initials: 'ST', phone: '+91 93006 66789', email: 'salem@traders.net', location: 'Salem', regDate: '11 Jun 2025', offers: 3, orders: 2, rating: 4.2, status: 'inactive' }
    ],
    deliveries: [
      { id: 'UZ-2048', farmerName: 'Arun Kumar', farmerLoc: 'Melur, Madurai', buyerName: 'Madura Mart', buyerLoc: 'Madurai City', dist: '12.4 km', charge: '₹120', eta: '~45 min', status: 'In Transit' },
      { id: 'UZ-3124', farmerName: 'Kavitha Farms', farmerLoc: 'Usilampatti', buyerName: 'South Fresh', buyerLoc: 'Madurai South', dist: '14.2 km', charge: '₹140', eta: 'Delivered', status: 'Delivered' }
    ],
    reports: [
      { id: 'RPT-001', type: 'Fake Listing', reporter: 'Ananya Retail', reported: 'Lakshmi', order: '—', product: 'Banana – Poovan', desc: 'Quantity listed differed from field availability.', status: 'pending', date: 'Today, 8:00 AM' },
      { id: 'RPT-002', type: 'Order Problem', reporter: 'Green Basket', reported: 'Arun Kumar', order: 'UZ-7734', product: 'Groundnut', desc: 'Quality variance reported during delivery collection.', status: 'investigating', date: 'Yesterday' }
    ],
    reviews: [
      { id: 3001, reviewer: 'Green Basket', reviewee: 'Arun Kumar', role: 'Farmer', rating: 5, text: 'Consistently fresh grade produce. Excellent partner!', date: 'Today', reported: false },
      { id: 3002, reviewer: 'South Fresh', reviewee: 'Kavitha Farms', role: 'Farmer', rating: 5, text: 'Top quality coconuts and seamless pickup coordination.', date: 'Yesterday', reported: false }
    ],
    notifications: [
      { id: 4001, to: 'All Users', title: 'Platform Maintenance Notice', body: 'UzhavanGo platform will undergo scheduled maintenance tomorrow from 10 PM to 11 PM.', date: 'Today, 9:00 AM', icon: '🔧' },
      { id: 4002, to: 'Farmers', title: 'Kharif Harvest Window', body: 'Kharif harvesting season is active. Post early to connect with buyers.', date: 'Yesterday', icon: '🌾' }
    ],
    activityLog: [
      { id: 9001, action: 'User Activated', target: 'Arun Kumar (Farmer)', color: 'green', icon: '✅', time: 'Today, 9:30 AM' },
      { id: 9002, action: 'Notification Sent', target: 'Platform Maintenance Notice', color: 'blue', icon: '🔔', time: 'Yesterday, 4:00 PM' }
    ]
  }
};

const app = document.querySelector('#app');
const save = () => {
  localStorage.uzListings = JSON.stringify(state.listings);
  localStorage.uzOrders = JSON.stringify(state.orders);
  localStorage.uzPayments = JSON.stringify(state.payments);
  localStorage.uzRole = state.role;
  localStorage.uzUser = JSON.stringify(state.user);
};
const money = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── ROUTING & ROUTE GUARDS ──────────────────────────────────
function go(page) {
  location.hash = page;
  render(page);
}

function updateNavState() {
  const avatar = document.querySelector('#userAvatarBtn');
  if (avatar) {
    if (state.role === 'admin') avatar.textContent = 'AD';
    else if (state.role === 'farmer') avatar.textContent = 'AK';
    else avatar.textContent = 'AR';
  }
}

function render(page = (location.hash || '#home').slice(1)) {
  window.scrollTo(0, 0);
  updateNavState();

  // Route Guard: #admin requires admin verification
  if (page === 'admin') {
    if (checkAdminAuth()) {
      renderAdminDashboard();
    } else {
      renderAdminLoginScreen();
    }
    return;
  }

  const routes = {
    home, market, farmer, buyer, register, post, orders, how, notifications, profile
  };
  (routes[page] || home)();
}

// ─── ADMIN AUTH HELPERS ───────────────────────────────────────
function checkAdminAuth() {
  const tok = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!tok) return false;
  try {
    const parts = tok.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      return payload.role === 'admin';
    }
    return JSON.parse(atob(tok)).role === 'admin';
  } catch {
    return false;
  }
}

// ══════════════════════════════════════════════════════════════
//  1. UNIFIED AUTHENTICATION & ROLE SWITCHER
// ══════════════════════════════════════════════════════════════
function register(initialRole = 'farmer') {
  app.innerHTML = `
    <div class="form-page">
      <span class="eyebrow">✦ Access UzhavanGo Portal</span>
      <h1 style="margin-top:10px">Sign In / Register</h1>
      <p>Select your role to access your dedicated workspace.</p>

      <div class="pay-tabs" style="margin-top:20px">
        <button class="pay-tab ${initialRole === 'farmer' ? 'active' : ''}" onclick="register('farmer')">👨‍🌾 Farmer</button>
        <button class="pay-tab ${initialRole === 'buyer' ? 'active' : ''}" onclick="register('buyer')">🧑‍💼 Buyer</button>
        <button class="pay-tab ${initialRole === 'admin' ? 'active' : ''}" onclick="register('admin')">👨‍💻 Admin</button>
      </div>

      ${initialRole === 'admin' ? `
        <form class="form-box" onsubmit="handleUnifiedAdminLogin(event)">
          <h2>Admin Authentication</h2>
          <p style="color:var(--muted);font-size:13px;margin-bottom:18px">Secure privileged portal for platform management.</p>
          <div class="login-error" id="adminAuthErr" style="display:none;background:#fde8e8;color:#c65047;padding:10px;border-radius:8px;margin-bottom:14px;font-size:13px"></div>
          <div class="form-grid">
            <label class="full"><span>Admin Username / Email</span><input name="email" id="adminInpEmail" required placeholder="Enter admin username" autocomplete="username"/></label>
            <label class="full"><span>Password</span><input name="password" id="adminInpPass" type="password" required placeholder="••••••••" autocomplete="current-password"/></label>
          </div>
          <div class="cta-row" style="margin-top:20px">
            <button class="primary" type="submit">Sign In as Admin →</button>
            <button type="button" class="secondary" onclick="go('home')">Cancel</button>
          </div>
        </form>
      ` : `
        <form class="form-box" onsubmit="finishRegistration(event, '${initialRole}')">
          <h2>${initialRole === 'farmer' ? '👨‍🌾 Farmer Access' : '🧑‍💼 Buyer Access'}</h2>
          <div class="form-grid">
            <label><span>${initialRole === 'farmer' ? 'Farmer Name' : 'Business / Buyer Name'}</span><input name="name" required value="${initialRole === 'farmer' ? 'Arun Kumar' : 'Ananya Retail'}" placeholder="Full Name"/></label>
            <label><span>Mobile Number</span><input name="phone" required pattern="[0-9+ -]{10,15}" value="+91 98765 43210" placeholder="+91 98765 43210"/></label>
            ${initialRole === 'buyer' ? `
              <label><span>Email ID</span><input name="email" type="email" required value="ananya@example.com"/></label>
              <label><span>Delivery Town / City</span><input name="location" required value="Madurai"/></label>
            ` : `
              <label class="full"><span>Farm Location</span><input name="location" required value="Melur, Madurai"/></label>
            `}
          </div>
          <div class="notice" style="margin-top:17px">🔐 Direct secure access: Role-based dashboard loads upon verification.</div>
          <div class="cta-row">
            <button class="primary" type="submit">Enter ${initialRole === 'farmer' ? 'Farmer' : 'Buyer'} Portal →</button>
            <button type="button" class="secondary" onclick="go('home')">Back</button>
          </div>
        </form>
      `}
    </div>`;
}

async function handleUnifiedAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminInpEmail').value.trim();
  const password = document.getElementById('adminInpPass').value;
  const errEl = document.getElementById('adminAuthErr');
  errEl.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      state.role = 'admin';
      state.user = { name: 'Administrator', role: 'admin', email };
      save();
      toast('Admin signed in successfully.');
      go('admin');
    } else {
      errEl.textContent = data.error || 'Invalid admin credentials.';
      errEl.style.display = 'block';
    }
  } catch (err) {
    // Fallback verification if offline / file protocol
    errEl.textContent = 'Unable to reach backend server. Please verify server is running on http://localhost:3000';
    errEl.style.display = 'block';
  }
}

function finishRegistration(e, role) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.role = role;
  state.user = { name: f.get('name'), role, phone: f.get('phone'), location: f.get('location') || 'Madurai' };
  save();
  toast(`Welcome ${state.user.name}! Redirecting to ${role} dashboard.`);
  go(role);
}

// ══════════════════════════════════════════════════════════════
//  2. HOME & DISCOVERY
// ══════════════════════════════════════════════════════════════
function home() {
  app.innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">✦ Direct Farm Marketplace</span>
        <h1>From the hands that grow, <em>to the homes that need.</em></h1>
        <p>UZHAVANGO connects farmers, buyers, and administrators in one unified platform. Pure farmer harvest discovery, private bidding, and secure online payments.</p>
        <div class="cta-row">
          <button class="primary" onclick="go('market')">Explore produce →</button>
          <button class="secondary" onclick="register('farmer')">Join as Farmer</button>
          <button class="secondary" onclick="register('buyer')">Join as Buyer</button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="field"></div>
        <div class="stat-card stat-one"><b>₹18.4L+</b><small>earned directly by farmers</small></div>
        <div class="stat-card stat-two"><b>2,400+</b><small>active local buyers</small></div>
        <div class="people"><span>A</span><span>S</span><span>K</span> &nbsp;Trusted by 1,200+ growers</div>
      </div>
    </section>

    <div class="trust">
      <div><b>↗ 38%</b> better farmer earnings</div>
      <div><b>◎ 5–20 km</b> local-first discovery</div>
      <div><b>🔒 100%</b> private buyer bids</div>
      <div><b>💳 Instant</b> online payments</div>
    </div>

    <section class="section">
      <h2 class="section-title">Three Roles, One Integrated Platform</h2>
      <p class="section-sub">Choose your role to get started.</p>
      <div class="role-grid">
        <article class="role-card">
          <div class="role-icon">👨‍🌾</div>
          <h3>Farmer Portal</h3>
          <p>Upload harvest photos, list ready crops with quality grades, compare all incoming buyer bids, and choose the best price.</p>
          <ul>
            <li>📸 Real crop photo upload</li>
            <li>🛡️ No farmer price pressure (buyers bid)</li>
            <li>👁️ Farmer sees all competing bids</li>
          </ul>
          <button class="primary" onclick="register('farmer')">Enter Farmer Portal</button>
        </article>

        <article class="role-card">
          <div class="role-icon">🧑‍💼</div>
          <h3>Buyer Portal</h3>
          <p>Browse nearby fresh produce photos, make private price offers, complete instant online payments, and track deliveries.</p>
          <ul>
            <li>🔍 Browse harvests by radius</li>
            <li>🔒 Private offers (hidden from others)</li>
            <li>💳 Online UPI & Card payments</li>
          </ul>
          <button class="primary" onclick="register('buyer')">Enter Buyer Portal</button>
        </article>

        <article class="role-card">
          <div class="role-icon">👨‍💻</div>
          <h3>Admin Portal</h3>
          <p>Monitor platform health, verify farmers & buyers, review crop listings, track private offers, audit payments, and resolve reports.</p>
          <ul>
            <li>📊 Live analytics & Chart.js reports</li>
            <li>🚚 Delivery & order tracking</li>
            <li>💰 Complete payment auditing</li>
          </ul>
          <button class="primary" onclick="go('admin')" style="background:var(--deep)">Enter Admin Portal</button>
        </article>
      </div>
    </section>`;
}

// ══════════════════════════════════════════════════════════════
//  3. MARKETPLACE (DISCOVERY WITH CROP PHOTOS)
// ══════════════════════════════════════════════════════════════
function market() {
  app.innerHTML = `
    <div class="page-head">
      <div>
        <h1>Fresh from nearby farms</h1>
        <p>Discover real crop photos posted by verified farmers around Madurai.</p>
      </div>
      <button class="button" onclick="state.role==='farmer'?go('post'):register('farmer')">+ Post produce</button>
    </div>
    <div class="market-layout">
      <aside class="filters">
        <div class="filter-title">Filter Produce</div>
        <label>Search Produce / Farmer</label>
        <input id="search" oninput="filterListings()" placeholder="Tomatoes, rice, coconut..."/>
        <label>Distance</label>
        <select id="radius" onchange="filterListings()">
          <option value="25">Within 25 km</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
        </select>
        <label>Category</label>
        <select id="marketCat" onchange="filterListings()">
          <option value="">All Produce</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Grains">Grains & Paddy</option>
          <option value="Fruits">Fruits</option>
        </select>
      </aside>
      <section>
        <div class="result-head">
          <b id="resultCount">${state.listings.length} harvests nearby</b>
          <select id="sort" onchange="filterListings()">
            <option value="near">Nearest first</option>
            <option value="offers">Most bids</option>
            <option value="qty">Highest quantity</option>
          </select>
        </div>
        <div class="listing-grid" id="listingGrid"></div>
      </section>
    </div>`;
  filterListings();
}

function filterListings() {
  let arr = [...state.listings];
  const q = document.querySelector('#search')?.value.toLowerCase() || '';
  const r = +(document.querySelector('#radius')?.value || 25);
  const s = document.querySelector('#sort')?.value || 'near';
  arr = arr.filter(x => x.distance <= r && (x.product.toLowerCase().includes(q) || x.location.toLowerCase().includes(q) || x.farmer.toLowerCase().includes(q)));
  arr.sort((a, b) => s === 'offers' ? b.offers.length - a.offers.length : s === 'qty' ? b.quantity - a.quantity : a.distance - b.distance);
  const countEl = document.querySelector('#resultCount');
  if (countEl) countEl.textContent = `${arr.length} harvest${arr.length === 1 ? '' : 's'} nearby`;
  const gridEl = document.querySelector('#listingGrid');
  if (gridEl) gridEl.innerHTML = arr.map(card).join('') || '<div class="empty">No harvests match your filters.</div>';
}

function card(x) {
  const imgHtml = x.image ? `<img src="${x.image}" alt="${x.product}"/>` : x.emoji;
  return `
    <article class="listing" onclick="details(${x.id})">
      <div class="produce-art">
        ${imgHtml}
        <span>◎ ${x.distance} km away</span>
      </div>
      <div class="listing-body">
        <h3>${x.product}</h3>
        <div class="farmer">by <b>${x.farmer}</b> &nbsp;·&nbsp; <span style="color:var(--green)">${x.grade || 'Grade A'}</span></div>
        <div class="listing-meta">
          <span><b>${x.quantity} ${x.unit}</b> available</span>
          <span class="distance">${x.offers.length} bid${x.offers.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </article>`;
}

// ══════════════════════════════════════════════════════════════
//  4. FARMER MODULE (PHOTO UPLOAD, BID COMPARE & SELECTION)
// ══════════════════════════════════════════════════════════════
function farmer() {
  state.role = 'farmer';
  save();
  const mine = state.listings.filter(x => x.farmer === state.user.name || x.farmer === 'Arun Kumar');
  const allBids = state.listings.flatMap(x => x.offers.map(o => ({ ...o, product: x.product, id: x.id, unit: x.unit })));

  app.innerHTML = `
    <div class="dashboard">
      <div class="welcome">
        <div>
          <h1>Farmer Dashboard — Welcome, ${state.user.name} 👋</h1>
          <p>Manage your harvest posts, review buyer bids, and fulfill orders.</p>
        </div>
        <button class="button" onclick="go('post')">+ Post Produce with Photo</button>
      </div>

      <div class="stat-grid">
        <div class="metric"><small>Active Posts</small><b>${mine.length || 1}</b></div>
        <div class="metric"><small>Incoming Bids</small><b>${allBids.length}</b></div>
        <div class="metric"><small>Orders Confirmed</small><b>${state.orders.filter(o => o.status !== 'Accepted').length}</b></div>
        <div class="metric"><small>Completed Deals</small><b>12</b></div>
      </div>

      <div class="dash-grid">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Incoming Buyer Bids</h2><small>Compare price, distance, and quantity before selecting</small></div>
            <button class="link-btn" onclick="go('market')">View all listings →</button>
          </div>
          ${allBids.length ? allBids.map(o => `
            <div class="offer-row">
              <div class="initial">${o.initial}</div>
              <div>
                <b>${o.buyer} bid for ${o.product}</b>
                <small>${o.quantity} ${o.unit || 'units'} · ◎ ${o.distance} km · ${o.time}</small>
              </div>
              <div style="text-align:right">
                <span class="price">${money(o.price)}/unit</span><br/>
                <button class="link-btn" onclick="details(${o.id})">Review & Select →</button>
              </div>
            </div>`).join('') : '<div class="empty">No buyer bids received yet.</div>'}
        </section>

        <aside class="panel">
          <h2>Farmer Order Journey</h2>
          <div class="timeline">
            <div><b>1. Post with Photo</b>Share crop photo, grade, and harvest details</div>
            <div><b>2. Review Bids</b>View all competing price bids privately</div>
            <div><b>3. Choose Best Bid</b>Select your preferred buyer</div>
            <div><b>4. Receive Payment</b>Buyer pays online via UPI / Card</div>
            <div><b>5. Delivery / Pickup</b>Hand over fresh produce to complete</div>
          </div>
        </aside>
      </div>
    </div>`;
}

// Post Produce with Crop Photo Upload
let uploadedCropImage = null;

function post() {
  state.role = 'farmer';
  save();
  uploadedCropImage = null;
  app.innerHTML = `
    <div class="form-page">
      <h1>Post Your Harvest</h1>
      <p>Upload a photo of your fresh crop and tell buyers what is ready in your field.</p>
      <form class="form-box" onsubmit="createPostWithPhoto(event)">
        <h2>Crop Details</h2>
        <div class="notice">🛡️ <b>Pure Discovery & Bidding</b>: Farmers do not set prices. Buyers submit private bids.</div>
        
        <div class="form-grid">
          <label><span>Crop / Vegetable Name</span><input name="product" required placeholder="e.g. Fresh Tomatoes, Ponni Rice, Coconut"/></label>
          <label><span>Quality Grade</span>
            <select name="grade">
              <option>Grade A (Premium)</option>
              <option>Organic Certified</option>
              <option>Field-Grown Standard</option>
              <option>Export Quality</option>
            </select>
          </label>
          <label><span>Available Quantity</span><input name="quantity" type="number" min="1" required placeholder="e.g. 150"/></label>
          <label><span>Unit</span>
            <select name="unit">
              <option>kg</option>
              <option>quintal</option>
              <option>bags</option>
              <option>pieces</option>
              <option>bunches</option>
            </select>
          </label>
          <label class="full"><span>Farm Pickup Location</span><input name="location" required value="${state.user.location || 'Melur, Madurai'}"/></label>
          
          <div class="full">
            <label style="display:block;margin-bottom:7px;font-size:13px;font-weight:bold;color:#53645a">Crop Photo Upload</label>
            <div class="photo-upload-area" onclick="document.getElementById('cropPhotoInput').click()">
              <div style="font-size:28px">📸</div>
              <b style="font-size:13px;color:var(--deep)">Click to upload crop photo</b>
              <p style="font-size:11px;color:var(--muted);margin-top:3px">Supports JPG, PNG from camera or gallery</p>
              <input type="file" id="cropPhotoInput" accept="image/*" style="display:none" onchange="handleCropPhotoSelect(event)"/>
            </div>
            <div class="photo-preview-box" id="cropPhotoPreviewBox">
              <img id="cropPhotoPreviewImg" src="" alt="Crop Preview"/>
              <button type="button" class="photo-remove-btn" onclick="removeCropPhoto(event)">✕</button>
            </div>
          </div>

          <label class="full"><span>Description & Harvesting Notes</span>
            <textarea name="description" required placeholder="Harvest date, freshness, organic practices, pickup timing..."></textarea>
          </label>
        </div>

        <div class="cta-row" style="margin-top:20px">
          <button class="primary" type="submit">Publish Harvest for Bidding →</button>
          <button class="secondary" type="button" onclick="go('farmer')">Cancel</button>
        </div>
      </form>
    </div>`;
}

function handleCropPhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    uploadedCropImage = evt.target.result;
    const previewBox = document.getElementById('cropPhotoPreviewBox');
    const previewImg = document.getElementById('cropPhotoPreviewImg');
    if (previewBox && previewImg) {
      previewImg.src = uploadedCropImage;
      previewBox.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function removeCropPhoto(e) {
  e.stopPropagation();
  uploadedCropImage = null;
  const previewBox = document.getElementById('cropPhotoPreviewBox');
  const photoInput = document.getElementById('cropPhotoInput');
  if (previewBox) previewBox.style.display = 'none';
  if (photoInput) photoInput.value = '';
}

function createPostWithPhoto(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  const product = f.get('product');
  const numQty = +f.get('quantity');
  const postItem = {
    id: Date.now(),
    product,
    emoji: icon(product),
    image: uploadedCropImage,
    grade: f.get('grade'),
    quantity: numQty,
    totalQuantity: numQty,
    availableQuantity: numQty,
    soldQuantity: 0,
    unit: f.get('unit'),
    location: f.get('location'),
    distance: 0.5,
    farmer: state.user.name || 'Arun Kumar',
    description: f.get('description'),
    offers: [],
    status: 'Active'
  };
  state.listings.unshift(postItem);
  save();
  toast('Your crop listing with photo is now live for buyers!');
  go('farmer');
}

function icon(p) {
  p = p.toLowerCase();
  return p.includes('rice') || p.includes('paddy') ? '🌾' : p.includes('banana') ? '🍌' : p.includes('coconut') ? '🥥' : p.includes('chilli') ? '🌶️' : p.includes('brinjal') ? '🍆' : p.includes('tomato') ? '🍅' : '🥬';
}

// ══════════════════════════════════════════════════════════════
//  5. BUYER MODULE (PRIVATE BIDS & ONLINE PAYMENT)
// ══════════════════════════════════════════════════════════════
function buyer() {
  state.role = 'buyer';
  save();
  const nearby = state.listings.filter(x => x.distance <= 15);
  const myOffersCount = state.listings.flatMap(x => x.offers).filter(o => o.buyer === state.user.name || o.buyer === 'Ananya Retail').length;
  const pendingOrders = state.orders.filter(o => o.status === 'Accepted' && (o.buyer === state.user.name || o.buyer === 'Madura Mart' || o.buyer === 'Ananya Retail'));

  app.innerHTML = `
    <div class="dashboard">
      <div class="welcome">
        <div>
          <h1>Buyer Dashboard — Welcome, ${state.user.name} 👋</h1>
          <p>Find nearby harvests, submit private bids, and complete payments.</p>
        </div>
        <button class="button" onclick="go('market')">Browse All Crops</button>
      </div>

      <div class="stat-grid">
        <div class="metric"><small>Nearby Harvests</small><b>${nearby.length}</b></div>
        <div class="metric"><small>Active Bids Placed</small><b>${myOffersCount || 3}</b></div>
        <div class="metric"><small>Awaiting Payment</small><b>${pendingOrders.length}</b></div>
        <div class="metric"><small>Confirmed Orders</small><b>${state.orders.length}</b></div>
      </div>

      ${pendingOrders.length ? `
        <div style="background:#fff8e0;border:1.5px solid #fde68a;border-radius:14px;padding:18px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:gap">
          <div>
            <b style="color:#92611a;font-size:15px">🎉 Your bid was accepted for ${pendingOrders[0].product}!</b>
            <div style="font-size:13px;color:#785319;margin-top:3px">The farmer has selected you. Complete online payment to confirm pickup/delivery.</div>
          </div>
          <button class="button" onclick="payOrder('${pendingOrders[0].id}')" style="background:var(--green)">💳 Pay Now (${pendingOrders[0].price})</button>
        </div>
      ` : ''}

      <div class="dash-grid">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Produce Closest to You</h2><small>Fresh from farms within 15 km</small></div>
            <button class="link-btn" onclick="go('market')">See all →</button>
          </div>
          <div class="listing-grid">${nearby.slice(0, 3).map(card).join('')}</div>
        </section>

        <aside class="panel">
          <h2>How Bidding & Buying Works</h2>
          <div class="timeline">
            <div><b>1. Explore Crops</b>Browse verified photos and quality grades</div>
            <div><b>2. Private Bid</b>Submit your price per unit (hidden from other buyers)</div>
            <div><b>3. Farmer Selects</b>Farmer chooses the best offer</div>
            <div><b>4. Online Payment</b>Pay securely via UPI / Card once accepted</div>
            <div><b>5. Delivery Tracking</b>Follow your order until delivered</div>
          </div>
        </aside>
      </div>
    </div>`;
}

// Details Modal with Crop Image & Privacy Enforcement
function details(id) {
  const x = state.listings.find(x => x.id === id);
  const myBuyerName = state.user.name || 'Ananya Retail';
  const myOffers = x.offers.filter(o => o.buyer === myBuyerName || (state.role === 'buyer' && o.buyer === 'Ananya Retail'));
  const otherCount = x.offers.length - myOffers.length;

  const imgHtml = x.image
    ? `<img src="${x.image}" style="width:100%;height:160px;object-fit:cover;border-radius:12px;margin-bottom:12px" alt="${x.product}"/>`
    : `<div class="produce-art" style="border-radius:12px;margin-bottom:12px">${x.emoji}<span>◎ ${x.distance} km away</span></div>`;

  const buyerViewHtml = `
    ${myOffers.length ? `
      <div style="background:#f0f9d4;border-radius:10px;padding:12px;margin:12px 0">
        <b style="font-size:13px;color:var(--deep)">Your Active Bid</b>
        <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:13px">
          <span>${myOffers[0].quantity} ${x.unit} @ <b>${money(myOffers[0].price)}/${x.unit}</b></span>
          <span class="badge badge-pending">Awaiting Farmer</span>
        </div>
      </div>
      <button class="primary" style="width:100%" onclick="offerForm(${x.id})">Update Bid</button>
    ` : `<button class="primary" style="width:100%" onclick="offerForm(${x.id})">Submit Private Bid</button>`}
    ${otherCount > 0 ? `<div class="notice" style="margin-top:12px">🔒 <b>Bid Privacy Active</b>: ${otherCount} other bid${otherCount === 1 ? '' : 's'} received. Competing prices remain strictly hidden from buyers.</div>` : ''}
  `;

  const farmerViewHtml = `
    <div class="panel" style="padding:14px;margin-top:12px">
      <h3 style="font-size:14px;color:var(--deep);margin-bottom:10px">Incoming Buyer Bids (${x.offers.length})</h3>
      ${x.offers.length ? x.offers.map(o => `
        <div class="offer-row">
          <div class="initial">${o.initial}</div>
          <div><b>${o.buyer}</b><small>${o.quantity} ${x.unit} · ◎ ${o.distance} km</small></div>
          <button class="primary" onclick="selectOffer(${x.id},'${o.buyer}',${o.price},${o.quantity})">Choose ${money(o.price)}</button>
        </div>`).join('') : '<small style="color:var(--muted)">No bids received yet. Bids will appear here.</small>'}
    </div>
  `;

  document.querySelector('#modalRoot').innerHTML = `
    <div class="modal-back" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <button class="close" onclick="closeModal()">×</button>
        ${imgHtml}
        <h2>${x.product}</h2>
        <p style="color:#68776c;font-size:13px;margin:4px 0 10px">
          <b>${x.quantity} ${x.unit}</b> available · <span style="color:var(--green);font-weight:600">${x.grade || 'Grade A'}</span> · ${x.location}<br/>
          Posted by <b>${x.farmer}</b>
        </p>
        <p style="font-size:13.5px;line-height:1.5">${x.description}</p>
        ${state.role === 'buyer' ? buyerViewHtml : farmerViewHtml}
      </div>
    </div>`;
}

function offerForm(id) {
  const x = state.listings.find(x => x.id === id);
  document.querySelector('#modalRoot').innerHTML = `
    <div class="modal-back">
      <div class="modal">
        <button class="close" onclick="closeModal()">×</button>
        <h2>Submit Private Bid</h2>
        <p>Quote your price for <b>${x.product}</b> (${x.quantity} ${x.unit} available). The farmer will review and decide.</p>
        <form onsubmit="submitOffer(event, ${id})">
          <div class="form-grid">
            <label><span>Quantity needed (max ${x.quantity} ${x.unit})</span>
              <input name="qty" type="number" min="1" max="${x.quantity}" required value="${Math.min(50, x.quantity)}"/>
            </label>
            <label><span>Your bid per ${x.unit} (₹)</span>
              <input name="price" type="number" min="1" required placeholder="e.g. 35"/>
            </label>
            <label class="full"><span>Message to Farmer (optional)</span>
              <textarea name="msg" placeholder="Pickup timing or special packing requirements..."></textarea>
            </label>
          </div>
          <div class="notice" style="margin-top:14px">🔒 Your bid is private. Other buyers cannot see your price.</div>
          <div class="cta-row">
            <button class="primary" type="submit">Send Bid Directly →</button>
            <button type="button" class="secondary" onclick="details(${id})">Back</button>
          </div>
        </form>
      </div>
    </div>`;
}

function submitOffer(e, id) {
  e.preventDefault();
  const f = new FormData(e.target);
  const x = state.listings.find(x => x.id === id);
  if (!x) return;

  const reqQty = +f.get('qty');
  const avail = x.availableQuantity !== undefined ? x.availableQuantity : x.quantity;

  if (avail <= 0 || x.status === 'Sold Out') {
    toast('⚠️ This listing is sold out and no longer accepting bids.');
    return;
  }
  if (reqQty > avail) {
    toast(`⚠️ Only ${avail} ${x.unit} is currently available.`);
    return;
  }

  const buyerName = state.user.name || 'Ananya Retail';
  // Replace or push bid
  const existingIdx = x.offers.findIndex(o => o.buyer === buyerName);
  const bidObj = {
    buyer: buyerName,
    initial: buyerName.slice(0, 2).toUpperCase(),
    price: +f.get('price'),
    quantity: reqQty,
    distance: 4.6,
    time: 'Just now'
  };
  if (existingIdx >= 0) x.offers[existingIdx] = bidObj;
  else x.offers.push(bidObj);
  x.status = 'Offer Received';
  save();
  closeModal();
  toast('Your private bid was sent directly to the farmer!');
}

function selectOffer(id, buyer, price, quantity) {
  const x = state.listings.find(x => x.id === id);
  if (!x) return;

  const avail = x.availableQuantity !== undefined ? x.availableQuantity : x.quantity;
  if (avail < quantity) {
    toast(`⚠️ Insufficient quantity available. Only ${avail} ${x.unit} remaining.`);
    return;
  }

  if (x.totalQuantity === undefined) x.totalQuantity = x.quantity;
  if (x.availableQuantity === undefined) x.availableQuantity = x.quantity;
  if (x.soldQuantity === undefined) x.soldQuantity = 0;

  const newAvailable = Math.max(0, x.availableQuantity - quantity);
  x.availableQuantity = newAvailable;
  x.soldQuantity = (x.soldQuantity || 0) + quantity;
  x.quantity = newAvailable;

  if (newAvailable <= 0) {
    x.status = 'Sold Out';
    x.offers = x.offers.filter(o => o.buyer === buyer);
  } else {
    x.status = 'Active';
    x.offers = x.offers.filter(o => o.buyer === buyer || o.quantity <= newAvailable);
  }

  const orderId = 'UZ-' + Math.floor(2000 + Math.random() * 7000);
  state.orders.unshift({
    id: orderId,
    product: x.product,
    emoji: x.emoji,
    image: x.image,
    quantity: `${quantity} ${x.unit}`,
    party: buyer,
    farmer: x.farmer,
    buyer,
    price: money(price * quantity),
    rawPrice: price * quantity,
    status: 'Accepted',
    paymentStatus: 'Pending',
    date: 'Just now'
  });
  save();
  closeModal();
  toast(`Bid accepted! Order ${orderId} (${quantity} ${x.unit}). Remaining: ${x.availableQuantity} ${x.unit}`);
  go('orders');
}

// ══════════════════════════════════════════════════════════════
//  6. ORDERS & ONLINE PAYMENT MODAL
// ══════════════════════════════════════════════════════════════
function orders() {
  app.innerHTML = `
    <div class="dashboard">
      <div class="welcome">
        <div>
          <h1>Orders & Transactions</h1>
          <p>Track direct trades from bid acceptance to payment and delivery.</p>
        </div>
      </div>
      <div class="dash-grid">
        <section class="panel">
          <div class="panel-head">
            <div><h2>Active Orders</h2><small>Actions depend on your active role</small></div>
          </div>
          ${state.orders.map(o => `
            <div class="order-card">
              <div class="order-icon">${o.emoji}</div>
              <div style="flex:1">
                <h3>${o.product} 
                  <span class="status ${o.status === 'Accepted' ? 'selected' : 'progress'}">${o.status}</span>
                  ${o.paymentStatus === 'Paid' ? '<span class="status" style="background:#dceba6;color:#3a6020">💳 Paid</span>' : '<span class="status" style="background:#fff3cd;color:#856404">Payment Pending</span>'}
                </h3>
                <p>${o.quantity} · ${state.role === 'farmer' ? 'Buyer: ' + (o.buyer || o.party) : 'Farmer: ' + (o.farmer || o.party)} · ${o.date}</p>
                ${o.txnId ? `<small style="color:var(--muted)">Txn: <b>${o.txnId}</b></small>` : ''}
              </div>
              <div class="order-side">
                <b class="price">${o.price}</b><br/>
                ${o.status === 'Accepted' && state.role === 'buyer' && o.paymentStatus !== 'Paid' ? `
                  <button class="button" style="padding:7px 12px;font-size:12px;margin-top:6px;background:var(--green)" onclick="payOrder('${o.id}')">💳 Pay Now</button>
                ` : `
                  <button class="link-btn" onclick="advance('${o.id}')" style="margin-top:6px">Update Status →</button>
                `}
              </div>
            </div>`).join('') || '<div class="empty">No orders found.</div>'}
        </section>

        <aside class="panel">
          <h2>Order & Delivery Guide</h2>
          <div class="timeline">
            <div><b>1. Accepted</b>Farmer selects buyer's bid</div>
            <div><b>2. Payment & Confirmed</b>Buyer pays online via UPI/Card</div>
            <div><b>3. Pickup</b>Produce packed at the farm</div>
            <div><b>4. In Transit</b>Delivery vehicle on route</div>
            <div><b>5. Delivered</b>Order safely reached buyer</div>
            <div><b>6. Completed</b>Deal finished with buyer rating</div>
          </div>
        </aside>
      </div>
    </div>`;
}

function advance(id) {
  const o = state.orders.find(x => x.id === id);
  const seq = ['Accepted', 'Order Confirmed', 'Pickup', 'In Transit', 'Delivered', 'Completed'];
  const i = seq.indexOf(o.status);
  if (i === -1 || i === seq.length - 1) {
    toast('Order is already completed.');
    return;
  }
  if (o.status === 'Accepted' && o.paymentStatus !== 'Paid' && state.role === 'buyer') {
    payOrder(id);
    return;
  }
  o.status = seq[i + 1];
  save();
  toast(`Order updated to: ${o.status}`);
  orders();
}

// Interactive Online Payment Modal
function payOrder(orderId) {
  const o = state.orders.find(x => x.id === orderId);
  if (!o) return;
  renderPaymentModal(o, 'upi');
}

function renderPaymentModal(o, method = 'upi') {
  document.querySelector('#modalRoot').innerHTML = `
    <div class="modal-back">
      <div class="modal" style="max-width:460px">
        <button class="close" onclick="closeModal()">×</button>
        <h2>Online Payment</h2>
        <p style="color:var(--muted);font-size:13px">Pay <b>${o.farmer || o.party}</b> for <b>${o.product}</b> (${o.quantity})</p>
        
        <div class="pay-tabs">
          <button class="pay-tab ${method === 'upi' ? 'active' : ''}" onclick="renderPaymentModal(state.orders.find(x=>x.id==='${o.id}'), 'upi')">📱 UPI / QR</button>
          <button class="pay-tab ${method === 'card' ? 'active' : ''}" onclick="renderPaymentModal(state.orders.find(x=>x.id==='${o.id}'), 'card')">💳 Card</button>
          <button class="pay-tab ${method === 'net' ? 'active' : ''}" onclick="renderPaymentModal(state.orders.find(x=>x.id==='${o.id}'), 'net')">🏦 Net Banking</button>
        </div>

        ${method === 'upi' ? `
          <div class="upi-qr-box">
            <div class="qr-dummy">📱</div>
            <b style="font-size:14px;color:var(--deep)">Scan UPI QR to Pay ${o.price}</b>
            <p style="font-size:12px;color:var(--muted);margin:4px 0 10px">Supports GPay, PhonePe, Paytm, BHIM</p>
            <div style="background:#fff;border:1px solid #dbe1d9;border-radius:8px;padding:9px;font-size:13px;font-weight:600;color:var(--ink)">
              uzhavango.farm@upi
            </div>
          </div>
        ` : method === 'card' ? `
          <div class="pay-card-box">
            <div class="form-grid">
              <label class="full"><span>Card Number</span><input placeholder="4532 •••• •••• 8901" value="4532 8901 2345 8901"/></label>
              <label><span>Expiry</span><input placeholder="MM/YY" value="08/28"/></label>
              <label><span>CVV</span><input type="password" placeholder="•••" value="789"/></label>
            </div>
          </div>
        ` : `
          <div style="padding:10px 0">
            <label style="font-size:13px;font-weight:700;color:#53645a;display:block;margin-bottom:8px">Select Bank</label>
            <select style="width:100%;padding:10px;border-radius:8px;border:1px solid #dbe1d9">
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Tamilnad Mercantile Bank</option>
            </select>
          </div>
        `}

        <div style="margin-top:18px">
          <button class="primary" style="width:100%;padding:13px" onclick="processPayment('${o.id}', '${method.toUpperCase()}')">Authorize & Pay ${o.price} →</button>
        </div>
      </div>
    </div>`;
}

function processPayment(orderId, method) {
  const o = state.orders.find(x => x.id === orderId);
  if (!o) return;
  const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  o.paymentStatus = 'Paid';
  o.txnId = txnId;
  o.status = 'Order Confirmed';
  
  const paymentRecord = {
    id: Date.now(),
    txnId,
    orderId,
    amount: o.price,
    method,
    buyer: state.user.name || 'Ananya Retail',
    farmer: o.farmer || o.party,
    date: 'Just now',
    status: 'Success'
  };
  state.payments.unshift(paymentRecord);
  save();

  // Show Payment Receipt Modal
  document.querySelector('#modalRoot').innerHTML = `
    <div class="modal-back">
      <div class="modal" style="max-width:440px;text-align:center">
        <div style="font-size:48px">✅</div>
        <h2 style="margin:8px 0 4px;color:var(--green)">Payment Successful!</h2>
        <p style="font-size:13px;color:var(--muted)">Transaction completed securely via ${method}</p>
        
        <div class="receipt-card">
          <div class="receipt-row"><span>Transaction ID</span><b>${txnId}</b></div>
          <div class="receipt-row"><span>Order ID</span><b>${orderId}</b></div>
          <div class="receipt-row"><span>Paid To</span><b>${o.farmer || o.party}</b></div>
          <div class="receipt-row"><span>Amount Paid</span><b>${o.price}</b></div>
        </div>

        <button class="primary" style="width:100%" onclick="closeModal();orders()">View Confirmed Order →</button>
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════
//  7. INTEGRATED ADMIN MODULE (#admin)
// ══════════════════════════════════════════════════════════════
function renderAdminLoginScreen() {
  app.innerHTML = `
    <div id="loginScreen" style="min-height:75vh;display:grid;place-items:center">
      <div class="login-card" style="max-width:420px;width:100%">
        <div class="login-logo">
          <div class="login-mark">U</div>
          <div class="login-title">UZHAVANGO<small>Admin Portal</small></div>
        </div>
        <h2>Admin Sign In</h2>
        <p>Enter your administrator credentials to access the dashboard.</p>
        <div class="login-error" id="adminPgErr" style="display:none;background:#fde8e8;color:#c65047;padding:10px;border-radius:8px;margin-bottom:14px;font-size:13px"></div>
        <form onsubmit="handleAdminPgLogin(event)">
          <div class="login-field">
            <label>Admin Username / Email</label>
            <input type="text" id="adminPgEmail" required placeholder="Enter admin username" autocomplete="username"/>
          </div>
          <div class="login-field">
            <label>Password</label>
            <input type="password" id="adminPgPass" required placeholder="••••••••" autocomplete="current-password"/>
          </div>
          <button type="submit" class="login-btn">Sign In to Dashboard →</button>
        </form>
        <div class="login-badge" style="margin-top:16px">🔐 Role-protected access · Farmers & buyers cannot enter this portal</div>
      </div>
    </div>`;
}

async function handleAdminPgLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminPgEmail').value.trim();
  const password = document.getElementById('adminPgPass').value;
  const err = document.getElementById('adminPgErr');
  err.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      state.role = 'admin';
      state.user = { name: 'Administrator', role: 'admin', email };
      save();
      renderAdminDashboard();
    } else {
      err.textContent = data.error || 'Invalid admin credentials.';
      err.style.display = 'block';
    }
  } catch (apiErr) {
    err.textContent = 'Unable to connect to server. Please verify backend is running.';
    err.style.display = 'block';
  }
}

let adminCurrentTab = 'dashboard';

function renderAdminDashboard(tab = adminCurrentTab) {
  adminCurrentTab = tab;
  app.innerHTML = `
    <div id="adminShell" style="display:flex;min-height:calc(100vh - 76px)">
      <aside class="admin-sidebar" style="position:relative;min-height:100%;width:240px">
        <div class="sidebar-brand">
          <div class="sidebar-mark">U</div>
          <div class="sidebar-name">UZHAVANGO<small>Admin Panel</small></div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-section">Main</div>
          <button class="nav-btn ${tab === 'dashboard' ? 'active' : ''}" onclick="renderAdminDashboard('dashboard')"><span class="nav-icon">🏠</span><span>Dashboard</span></button>
          <div class="sidebar-section">Users</div>
          <button class="nav-btn ${tab === 'farmers' ? 'active' : ''}" onclick="renderAdminDashboard('farmers')"><span class="nav-icon">👨‍🌾</span><span>Farmers</span></button>
          <button class="nav-btn ${tab === 'buyers' ? 'active' : ''}" onclick="renderAdminDashboard('buyers')"><span class="nav-icon">🧑‍💼</span><span>Buyers</span></button>
          <div class="sidebar-section">Marketplace</div>
          <button class="nav-btn ${tab === 'products' ? 'active' : ''}" onclick="renderAdminDashboard('products')"><span class="nav-icon">🌾</span><span>Products</span></button>
          <button class="nav-btn ${tab === 'offers' ? 'active' : ''}" onclick="renderAdminDashboard('offers')"><span class="nav-icon">💰</span><span>Offers / Bids</span></button>
          <button class="nav-btn ${tab === 'orders' ? 'active' : ''}" onclick="renderAdminDashboard('orders')"><span class="nav-icon">📦</span><span>Orders</span></button>
          <button class="nav-btn ${tab === 'payments' ? 'active' : ''}" onclick="renderAdminDashboard('payments')"><span class="nav-icon">💳</span><span>Payments</span></button>
          <button class="nav-btn ${tab === 'deliveries' ? 'active' : ''}" onclick="renderAdminDashboard('deliveries')"><span class="nav-icon">🚚</span><span>Deliveries</span></button>
          <div class="sidebar-section">Moderation</div>
          <button class="nav-btn ${tab === 'reports' ? 'active' : ''}" onclick="renderAdminDashboard('reports')"><span class="nav-icon">🚨</span><span>Reports</span></button>
          <button class="nav-btn ${tab === 'reviews' ? 'active' : ''}" onclick="renderAdminDashboard('reviews')"><span class="nav-icon">⭐</span><span>Reviews</span></button>
          <button class="nav-btn ${tab === 'notifications' ? 'active' : ''}" onclick="renderAdminDashboard('notifications')"><span class="nav-icon">🔔</span><span>Notifications</span></button>
          <div class="sidebar-section">Insights</div>
          <button class="nav-btn ${tab === 'analytics' ? 'active' : ''}" onclick="renderAdminDashboard('analytics')"><span class="nav-icon">📊</span><span>Analytics</span></button>
          <button class="nav-btn ${tab === 'activitylog' ? 'active' : ''}" onclick="renderAdminDashboard('activitylog')"><span class="nav-icon">📋</span><span>Activity Log</span></button>
          <button class="nav-btn ${tab === 'settings' ? 'active' : ''}" onclick="renderAdminDashboard('settings')"><span class="nav-icon">⚙️</span><span>Settings</span></button>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn" onclick="adminLogout()"><span class="nav-icon">🚪</span><span>Logout</span></button>
        </div>
      </aside>

      <div class="admin-content" style="margin-left:0;flex:1">
        <div class="admin-body" id="adminTabContent"></div>
      </div>
    </div>`;

  renderAdminTabContent(tab);
}

function renderAdminTabContent(tab) {
  const el = document.getElementById('adminTabContent');
  if (!el) return;

  if (tab === 'dashboard') {
    el.innerHTML = `
      <div class="stats-grid">
        ${statCard('👨‍🌾', 'green', state.adminData.farmers.length, 'Total Farmers', 'Registered growers')}
        ${statCard('🧑‍💼', 'blue', state.adminData.buyers.length, 'Total Buyers', 'Active businesses')}
        ${statCard('🌾', 'lime', state.listings.length, 'Total Crops', 'Live listings')}
        ${statCard('💰', 'orange', state.listings.flatMap(x => x.offers).length, 'Total Bids', 'Private offers')}
        ${statCard('📦', 'purple', state.orders.length, 'Total Orders', 'Trade volume')}
        ${statCard('💳', 'teal', state.payments.length, 'Total Payments', 'Completed')}
        ${statCard('🚚', 'teal', state.adminData.deliveries.length, 'Deliveries', 'In transit')}
        ${statCard('🚨', 'red', state.adminData.reports.filter(r => r.status === 'pending').length, 'Reports', 'Pending review')}
      </div>
      <div class="dash-grid" style="grid-template-columns:1.3fr 1fr">
        <div class="panel-card">
          <h3>Recent Marketplace Orders</h3>
          <table class="data-table">
            <thead><tr><th>Order ID</th><th>Crop</th><th>Farmer → Buyer</th><th>Status</th></tr></thead>
            <tbody>${state.orders.slice(0, 5).map(o => `
              <tr>
                <td><b>${o.id}</b></td>
                <td>${o.product}</td>
                <td>${o.farmer || o.party} → ${o.buyer || o.party}</td>
                <td><span class="badge ${badgeFor(o.status)}">${o.status}</span></td>
              </tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="panel-card">
          <h3>Admin Audit Log</h3>
          <div class="activity-list">${state.adminData.activityLog.slice(0, 5).map(a => `
            <div class="activity-item">
              <div class="activity-dot ${a.color}">${a.icon}</div>
              <div class="activity-content"><b>${a.action}</b><small>${a.target}</small></div>
              <div class="activity-time">${a.time}</div>
            </div>`).join('')}</div>
        </div>
      </div>`;
  } else if (tab === 'farmers') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Farmer Management</h2><p>Manage registered agricultural producers.</p></div></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Farmer</th><th>Phone</th><th>Location</th><th>Joined</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${state.adminData.farmers.map(f => `
            <tr>
              <td><b>${f.name}</b></td><td>${f.phone}</td><td>${f.location}</td><td>${f.regDate}</td>
              <td><span class="stars">${stars(f.rating)}</span> ${f.rating}</td>
              <td><span class="badge ${badgeFor(f.status)}">${f.status}</span></td>
              <td><button class="act-btn ${f.status === 'active' ? 'act-btn-deactivate' : 'act-btn-activate'}" onclick="toggleAdminFarmer(${f.id})">${f.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } else if (tab === 'buyers') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Buyer Management</h2><p>Manage registered commercial and retail buyers.</p></div></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Buyer</th><th>Email</th><th>Phone</th><th>Location</th><th>Rating</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${state.adminData.buyers.map(b => `
            <tr>
              <td><b>${b.name}</b></td><td>${b.email}</td><td>${b.phone}</td><td>${b.location}</td>
              <td><span class="stars">${stars(b.rating)}</span> ${b.rating}</td>
              <td><span class="badge ${badgeFor(b.status)}">${b.status}</span></td>
              <td><button class="act-btn ${b.status === 'active' ? 'act-btn-deactivate' : 'act-btn-activate'}" onclick="toggleAdminBuyer(${b.id})">${b.status === 'active' ? 'Deactivate' : 'Activate'}</button></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } else if (tab === 'products') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Crop & Harvest Listings</h2><p>Review and moderate active listings.</p></div></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Crop</th><th>Farmer</th><th>Grade</th><th>Quantity</th><th>Location</th><th>Bids</th><th>Status</th></tr></thead>
          <tbody>${state.listings.map(p => `
            <tr>
              <td><b>${p.product}</b></td><td>${p.farmer}</td><td>${p.grade || 'Grade A'}</td><td>${p.quantity} ${p.unit}</td><td>${p.location}</td>
              <td><b>${p.offers.length}</b></td>
              <td><span class="badge ${badgeFor(p.status)}">${p.status}</span></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } else if (tab === 'offers') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Privileged Offer Monitor</h2><p>Monitor all private bids across the marketplace.</p></div></div>
      <div class="privacy-notice">🔒 <b>Admin Privileged View</b>: Buyers only see their own price. This monitor is restricted to administrators.</div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Crop</th><th>Farmer</th><th>Buyer</th><th>Bid Price</th><th>Quantity</th><th>Status</th></tr></thead>
          <tbody>${state.listings.flatMap(x => x.offers.map(o => ({ ...o, product: x.product, farmer: x.farmer, unit: x.unit }))).map(o => `
            <tr>
              <td><b>${o.product}</b></td><td>${o.farmer}</td><td>${o.buyer}</td>
              <td style="color:var(--green);font-weight:700">${money(o.price)}/${o.unit}</td>
              <td>${o.quantity} ${o.unit}</td>
              <td><span class="badge ${badgeFor(o.status || 'Pending')}">${o.status || 'Pending'}</span></td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  } else if (tab === 'payments') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Online Payments Audit</h2><p>Audit all digital transactions and receipts.</p></div></div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Txn ID</th><th>Order ID</th><th>Buyer</th><th>Farmer</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th></tr></thead>
          <tbody>${state.payments.map(p => `
            <tr>
              <td><b style="color:var(--green)">${p.txnId}</b></td><td>${p.orderId}</td><td>${p.buyer}</td><td>${p.farmer}</td>
              <td><b>${p.amount}</b></td><td><span class="badge badge-accepted">${p.method}</span></td><td>${p.date}</td>
              <td><span class="badge badge-active">${p.status}</span></td>
            </tr>`).join('') || '<tr><td colspan="8" class="empty">No payment transactions recorded yet.</td></tr>'}</tbody>
        </table>
      </div>`;
  } else if (tab === 'deliveries') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Delivery Monitoring</h2><p>Track active transportation routes.</p></div></div>
      <div class="delivery-grid">
        ${state.adminData.deliveries.map(d => `
          <div class="delivery-card">
            <div class="order-id">Order: ${d.id}</div>
            <div class="route-viz">
              <div class="route-node farmer-node"><div class="node-label">👨‍🌾 Farmer</div><div class="node-name">${d.farmerName} (${d.farmerLoc})</div></div>
              <div class="route-connector"></div>
              <div class="route-node truck-node"><div class="node-label">🚚 Route</div><div class="node-name">${d.dist} · ${d.charge}</div></div>
              <div class="route-connector"></div>
              <div class="route-node buyer-node"><div class="node-label">🧑‍💼 Buyer</div><div class="node-name">${d.buyerName} (${d.buyerLoc})</div></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:12px">
              <span class="badge badge-transit">${d.status}</span>
              <small style="color:var(--muted)">ETA: ${d.eta}</small>
            </div>
          </div>`).join('')}
      </div>`;
  } else if (tab === 'reports') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Reports & Complaints</h2><p>Investigate and resolve user issues.</p></div></div>
      <div class="report-list">
        ${state.adminData.reports.map(r => `
          <div class="report-card">
            <div class="report-header">
              <div><b>${r.id}</b> · <span class="badge badge-${r.status}">${r.status}</span><div style="font-weight:600;margin-top:4px">${r.type}</div></div>
              <small style="color:var(--muted)">${r.date}</small>
            </div>
            <div class="report-desc">${r.desc}</div>
            <div class="report-actions">
              ${r.status !== 'resolved' ? `<button class="act-btn act-btn-resolve" onclick="resolveReport('${r.id}')">Mark Resolved</button>` : ''}
            </div>
          </div>`).join('')}
      </div>`;
  } else if (tab === 'notifications') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Broadcast Notifications</h2><p>Send platform alerts to farmers and buyers.</p></div></div>
      <div class="panel-card">
        <form onsubmit="adminSendBroadcast(event)">
          <div class="form-grid">
            <label><span>Recipient Group</span><select name="to"><option>All Users</option><option>Farmers</option><option>Buyers</option></select></label>
            <label><span>Title</span><input name="title" required placeholder="Announcement title"/></label>
            <label class="full"><span>Message</span><textarea name="body" required placeholder="Write announcement..."></textarea></label>
          </div>
          <button class="primary" style="margin-top:14px" type="submit">Broadcast Alert →</button>
        </form>
      </div>`;
  } else if (tab === 'analytics') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Platform Analytics</h2><p>Performance metrics and visual reports.</p></div></div>
      <div class="analytics-grid">
        <div class="chart-card"><h3>📦 Orders by Status</h3><div class="chart-wrap"><canvas id="adminOrderChart"></canvas></div></div>
        <div class="chart-card"><h3>🌾 Most Listed Crops</h3><div class="chart-wrap"><canvas id="adminCropChart"></canvas></div></div>
      </div>`;
    setTimeout(() => {
      new Chart(document.getElementById('adminOrderChart'), {
        type: 'doughnut',
        data: { labels: ['Confirmed', 'Accepted', 'Completed', 'In Transit'], datasets: [{ data: [3, 2, 12, 1], backgroundColor: ['#206b46', '#ee8e3c', '#c9e265', '#3b82f6'] }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
      new Chart(document.getElementById('adminCropChart'), {
        type: 'bar',
        data: { labels: ['Tomatoes', 'Rice', 'Coconut', 'Chillies', 'Banana'], datasets: [{ label: 'Listings', data: [4, 2, 3, 1, 2], backgroundColor: '#206b46' }] },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }, 100);
  } else if (tab === 'settings') {
    el.innerHTML = `
      <div class="section-head"><div><h2>Platform Settings</h2><p>System configuration & role management.</p></div></div>
      <div class="settings-grid">
        <div class="settings-card">
          <h3>Platform Status</h3>
          <div style="font-size:13px;line-height:2">
            <div>Platform Name: <b>UzhavanGo</b></div>
            <div>Version: <b>1.0.0-unified</b></div>
            <div>Admin Access: <b>Active (Super Administrator)</b></div>
            <div>API Status: <b>✅ Running on port 3000</b></div>
          </div>
        </div>
      </div>`;
  }
}

function statCard(icon, color, val, label, sub) {
  return `
    <div class="stat-card">
      <div class="stat-icon ${color}">${icon}</div>
      <div class="stat-info"><small>${label}</small><b>${val}</b><span>${sub}</span></div>
    </div>`;
}

function badgeFor(status) {
  const map = {
    active: 'badge-active', inactive: 'badge-inactive', pending: 'badge-pending',
    investigating: 'badge-investigating', resolved: 'badge-resolved', rejected: 'badge-rejected',
    approved: 'badge-approved', removed: 'badge-removed', unavailable: 'badge-unavailable',
    'Pending': 'badge-pending', 'Accepted': 'badge-accepted', 'Order Confirmed': 'badge-confirmed',
    'Pickup': 'badge-pickup', 'In Transit': 'badge-transit', 'Delivered': 'badge-delivered',
    'Completed': 'badge-completed', 'Cancelled': 'badge-cancelled'
  };
  return map[status] || 'badge-pending';
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

function toggleAdminFarmer(id) {
  const f = state.adminData.farmers.find(x => x.id === id);
  if (!f) return;
  f.status = f.status === 'active' ? 'inactive' : 'active';
  toast(`Farmer ${f.name} marked as ${f.status}.`);
  renderAdminTabContent('farmers');
}

function toggleAdminBuyer(id) {
  const b = state.adminData.buyers.find(x => x.id === id);
  if (!b) return;
  b.status = b.status === 'active' ? 'inactive' : 'active';
  toast(`Buyer ${b.name} marked as ${b.status}.`);
  renderAdminTabContent('buyers');
}

function resolveReport(id) {
  const r = state.adminData.reports.find(x => x.id === id);
  if (!r) return;
  r.status = 'resolved';
  toast(`Report ${id} marked as resolved.`);
  renderAdminTabContent('reports');
}

function adminSendBroadcast(e) {
  e.preventDefault();
  const f = new FormData(e.target);
  state.adminData.notifications.unshift({
    id: Date.now(),
    to: f.get('to'),
    title: f.get('title'),
    body: f.get('body'),
    date: 'Just now',
    icon: '📣'
  });
  toast('Broadcast alert sent successfully!');
  e.target.reset();
}

function adminLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  state.role = 'farmer';
  save();
  toast('Admin logged out.');
  go('home');
}

// ══════════════════════════════════════════════════════════════
//  8. PROFILE & NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
function how() {
  app.innerHTML = `
    <section class="section" style="max-width:1000px;margin:auto">
      <span class="eyebrow">The UZHAVANGO Model</span>
      <h1 class="section-title" style="font-size:42px;margin-top:13px">Direct. Transparent. Fair.</h1>
      <p class="section-sub">A single role-based platform eliminating intermediate markups.</p>
      <div class="steps">
        <article class="role-card"><span class="eyebrow">STEP 1</span><h3>Farmer Posts Harvest</h3><p>Share photos, available quantities, and quality grade with zero price pressure.</p></article>
        <article class="role-card"><span class="eyebrow">STEP 2</span><h3>Buyers Submit Bids</h3><p>Nearby buyers submit private bids per unit directly to the grower.</p></article>
        <article class="role-card"><span class="eyebrow">STEP 3</span><h3>Farmer Selects</h3><p>Farmer compares all incoming bids and accepts the best offer.</p></article>
        <article class="role-card"><span class="eyebrow">STEP 4</span><h3>Online Payment</h3><p>Buyer pays online securely via UPI / Card with instant transaction receipt.</p></article>
        <article class="role-card"><span class="eyebrow">STEP 5</span><h3>Direct Fulfillment</h3><p>Track pickup, in-transit delivery, and complete the order.</p></article>
      </div>
    </section>`;
}

function notifications() {
  app.innerHTML = `
    <div class="form-page">
      <h1>Notifications</h1>
      <p>Latest alerts and activity updates.</p>
      <div class="form-box">
        <div class="offer-row"><div class="initial">GB</div><div><b>Green Basket placed an offer</b><small>₹31 per kg for Fresh Tomatoes · 18 min ago</small></div></div>
        <div class="offer-row"><div class="initial">MM</div><div><b>Madura Mart placed an offer</b><small>₹34 per kg for Fresh Tomatoes · 42 min ago</small></div></div>
        <div class="offer-row"><div class="initial">✓</div><div><b>Harvest published live</b><small>Local buyers can now submit bids.</small></div></div>
      </div>
    </div>`;
}

function profile() {
  app.innerHTML = `
    <div class="form-page">
      <h1>Your Profile &amp; Role Switcher</h1>
      <p>Manage your account credentials and role access.</p>
      <div class="form-box">
        <div class="notice">Active Role: <span class="role-badge ${state.role}">${state.role}</span></div>
        <div class="form-grid">
          <label><span>Name</span><input id="profName" value="${state.user.name || 'User'}"/></label>
          <label><span>Phone Number</span><input id="profPhone" value="${state.user.phone || '+91 98765 43210'}"/></label>
          <label class="full"><span>Location</span><input id="profLoc" value="${state.user.location || 'Madurai, Tamil Nadu'}"/></label>
        </div>
        <div class="cta-row" style="margin-top:20px">
          <button class="primary" onclick="saveProfileChanges()">Save Profile</button>
          <button class="secondary" onclick="register('farmer')">Switch to Farmer</button>
          <button class="secondary" onclick="register('buyer')">Switch to Buyer</button>
          <button class="secondary" onclick="go('admin')" style="color:var(--deep);font-weight:bold">Admin Portal</button>
        </div>
      </div>
    </div>`;
}

function saveProfileChanges() {
  state.user.name = document.getElementById('profName').value;
  state.user.phone = document.getElementById('profPhone').value;
  state.user.location = document.getElementById('profLoc').value;
  save();
  toast('Profile updated successfully.');
}

function locate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      document.querySelector('#locationName').textContent = 'Madurai (Verified)';
      toast('Location updated for local matches.');
    }, () => toast('Location permission not granted.'));
  } else toast('Location not supported.');
}

function closeModal() { document.querySelector('#modalRoot').innerHTML = ''; }
function toast(t) {
  let e = document.querySelector('#toast');
  if (!e) return;
  e.textContent = t;
  e.classList.add('show');
  setTimeout(() => e.classList.remove('show'), 3000);
}

// ─── INITIALIZATION ───────────────────────────────────────────
window.addEventListener('hashchange', () => render());
render();
