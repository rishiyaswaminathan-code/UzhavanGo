import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getProduceImage } from '../utils/produceImages';
import {
  LayoutDashboard, Users, ShoppingBag, DollarSign, Package,
  AlertTriangle, Shield, Bell, Activity, LogOut, CheckCircle2, XCircle
} from 'lucide-react';

export function AdminPortal({ showToast }) {
  const { adminUser, loginAdmin, logoutAdmin } = useAuth();

  // Login form state
  const [email, setEmail] = useState('admin@uzhavan.com');
  const [password, setPassword] = useState('uzhavan@2026');
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin section state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Broadcast state
  const [notifForm, setNotifForm] = useState({ title: '', body: '', to: 'all' });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      await loginAdmin(email, password);
      showToast('Admin authenticated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadAdminData = async () => {
    if (!adminUser) return;
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const s = await api.getAdminStats();
        setStats(s);
      } else if (activeTab === 'farmers') {
        const f = await api.getAdminFarmers();
        setDataList(f);
      } else if (activeTab === 'buyers') {
        const b = await api.getAdminBuyers();
        setDataList(b);
      } else if (activeTab === 'products') {
        const p = await api.getAdminProducts();
        setDataList(p);
      } else if (activeTab === 'offers') {
        const o = await api.getAdminOffers();
        setDataList(o);
      } else if (activeTab === 'orders') {
        const ord = await api.getAdminOrders();
        setDataList(ord);
      } else if (activeTab === 'payments') {
        const pay = await api.getAdminPayments();
        setDataList(pay);
      } else if (activeTab === 'reports') {
        const rep = await api.getAdminReports();
        setDataList(rep);
      } else if (activeTab === 'activitylog') {
        const logs = await api.getAdminActivityLogs();
        setDataList(logs);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [adminUser, activeTab]);

  const handleToggleUser = async (userId, currentActive) => {
    try {
      await api.updateUserStatus(userId, !currentActive);
      showToast(`User status updated to ${!currentActive ? 'Active' : 'Deactivated'}`, 'info');
      loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      await api.updateReportStatus(reportId, status);
      showToast(`Report updated to ${status}`, 'success');
      loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    try {
      await api.sendAdminNotification(notifForm);
      showToast('Announcement broadcast sent!', 'success');
      setNotifForm({ title: '', body: '', to: 'all' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!adminUser) {
    return (
      <div style={{ maxWidth: '420px', margin: '3rem auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <img
              src="/assets/uzhavan-go-logo.png"
              alt="UzhavanGo Logo"
              style={{ width: '64px', height: '64px', objectFit: 'contain', margin: '0 auto 1rem', display: 'block', borderRadius: '12px' }}
            />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f2937' }}>
              Administrator Sign In
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Secure PBKDF2 role-protected portal access
            </p>
          </div>

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Admin Email / Username</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-primary"
              style={{ width: '100%', background: '#174d35', marginTop: '0.5rem' }}
            >
              {loginLoading ? 'Authenticating...' : 'Sign In to Admin Portal →'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
            🔐 <strong>Default Credentials:</strong> <code>admin@uzhavan.com</code> / <code>uzhavan@2026</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/assets/uzhavan-go-logo.png"
            alt="UzhavanGo Logo"
            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '10px' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#174d35', margin: 0 }}>
              UZHAVANGO Administration
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
              Direct marketplace oversight, audits &amp; moderation
            </p>
          </div>
        </div>

        <button
          className="btn btn-danger"
          style={{ fontSize: '0.85rem' }}
          onClick={() => {
            logoutAdmin();
            showToast('Logged out of Admin Portal', 'info');
          }}
        >
          <LogOut size={16} /> Sign Out Admin
        </button>
      </div>

      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <div className="sidebar-menu">
            <button
              className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              className={`sidebar-item ${activeTab === 'farmers' ? 'active' : ''}`}
              onClick={() => setActiveTab('farmers')}
            >
              <Users size={18} /> Registered Farmers
            </button>
            <button
              className={`sidebar-item ${activeTab === 'buyers' ? 'active' : ''}`}
              onClick={() => setActiveTab('buyers')}
            >
              <Users size={18} /> Registered Buyers
            </button>
            <button
              className={`sidebar-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <ShoppingBag size={18} /> Produce Listings
            </button>
            <button
              className={`sidebar-item ${activeTab === 'offers' ? 'active' : ''}`}
              onClick={() => setActiveTab('offers')}
            >
              <DollarSign size={18} /> Bids &amp; Offers
            </button>
            <button
              className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> Orders
            </button>
            <button
              className={`sidebar-item ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              <DollarSign size={18} /> Payments Audit
            </button>
            <button
              className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <AlertTriangle size={18} /> Reports
            </button>
            <button
              className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={18} /> Broadcast
            </button>
            <button
              className={`sidebar-item ${activeTab === 'activitylog' ? 'active' : ''}`}
              onClick={() => setActiveTab('activitylog')}
            >
              <Activity size={18} /> Activity Log
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="admin-main">
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Loading records...
            </div>
          ) : activeTab === 'dashboard' ? (
            <div>
              <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-box">
                  <div className="stat-value">{stats?.farmers ?? '-'}</div>
                  <div className="stat-label">Registered Farmers</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats?.buyers ?? '-'}</div>
                  <div className="stat-label">Registered Buyers</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats?.products ?? '-'}</div>
                  <div className="stat-label">Total Listings</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats?.offers ?? '-'}</div>
                  <div className="stat-label">Total Bids Placed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats?.orders ?? '-'}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{stats?.payments ?? '-'}</div>
                  <div className="stat-label">Successful Payments</div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Architecture &amp; Platform Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b' }}>Frontend Framework:</div>
                    <div style={{ fontWeight: 700, color: '#174d35' }}>React.js (Vite Modern SPA)</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b' }}>Backend Stack:</div>
                    <div style={{ fontWeight: 700, color: '#174d35' }}>Node.js + Express.js REST APIs</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b' }}>Database:</div>
                    <div style={{ fontWeight: 700, color: '#174d35' }}>MySQL Relational Engine (Connection Pooling)</div>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ color: '#64748b' }}>Produce Image Engine:</div>
                    <div style={{ fontWeight: 700, color: '#174d35' }}>Automatic Representative Image Mapper</div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'farmers' || activeTab === 'buyers' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {activeTab === 'farmers' ? 'Registered Farmers' : 'Registered Buyers'}
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td>{u.phone}</td>
                      <td>{u.location || 'N/A'}</td>
                      <td>
                        <span style={{ color: u.active ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn ${u.active ? 'btn-danger' : 'btn-primary'}`}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleToggleUser(u.id, u.active)}
                        >
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'products' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Produce Listings (Automatic Images, No Grading)
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Produce</th>
                    <th>Farmer</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image || getProduceImage(p.product_name || p.productName) ? (
                          <img
                            src={p.image || getProduceImage(p.product_name || p.productName)}
                            alt="produce"
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
                            }}
                          />
                        ) : null}
                        <span style={{ display: (p.image || getProduceImage(p.product_name || p.productName)) ? 'none' : 'inline-block', fontSize: '0.7rem', color: '#94a3b8' }}>
                          No image
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{p.product_name || p.productName}</td>
                      <td>{p.farmer_name || p.farmerName}</td>
                      <td>{p.quantity} {p.unit}</td>
                      <td>{p.location}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: p.status === 'Posted' ? '#16a34a' : '#64748b' }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'offers' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                All Bids &amp; Offers (Privileged Administrator Monitor)
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Bid ID</th>
                    <th>Post ID</th>
                    <th>Buyer</th>
                    <th>Offered Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>Post #{o.post_id || o.postId}</td>
                      <td style={{ fontWeight: 700 }}>{o.buyer_name || o.buyerName}</td>
                      <td>₹{o.offered_price || o.offeredPrice}</td>
                      <td>{o.quantity}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: o.status === 'Accepted' ? '#16a34a' : 'inherit' }}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'orders' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Marketplace Orders
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Farmer</th>
                    <th>Buyer</th>
                    <th>Quantity</th>
                    <th>Bid Price</th>
                    <th>Delivery</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((ord) => (
                    <tr key={ord.id}>
                      <td style={{ fontWeight: 700, color: '#1b5e20' }}>{ord.id}</td>
                      <td>{ord.product}</td>
                      <td>{ord.farmer}</td>
                      <td>{ord.buyer}</td>
                      <td>{ord.quantity}</td>
                      <td>₹{(ord.bid_price || ord.bidPrice || ord.raw_price || 0).toLocaleString('en-IN')}</td>
                      <td>₹{(ord.delivery_charge || ord.deliveryCharge || 100).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>₹{(ord.total_amount || ord.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td><span style={{ fontWeight: 700 }}>{ord.status}</span></td>
                      <td>
                        <span style={{ color: (ord.payment_status === 'Successful' || ord.payment_status === 'Paid') ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                          {ord.payment_status || ord.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'payments' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Payments Audit
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Farmer</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((pay) => (
                    <tr key={pay.id || pay.txn_id || pay.txnId}>
                      <td style={{ fontWeight: 700 }}>{pay.txn_id || pay.txnId}</td>
                      <td>{pay.order_id || pay.orderId}</td>
                      <td>{pay.buyer_name || pay.buyerName}</td>
                      <td>{pay.farmer_name || pay.farmerName}</td>
                      <td style={{ fontWeight: 800, color: '#16a34a' }}>₹{Number(pay.amount).toLocaleString('en-IN')}</td>
                      <td>{pay.method}</td>
                      <td>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>{pay.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'reports' ? (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Dispute &amp; Issue Reports
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Reason</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td style={{ fontWeight: 700 }}>{r.reason}</td>
                      <td>{r.description}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.status === 'pending' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => handleUpdateReport(r.id, 'resolved')}
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === 'notifications' ? (
            <div className="card" style={{ maxWidth: '560px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Broadcast System Announcement
              </h3>
              <form onSubmit={handleSendBroadcast}>
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Harvest Delivery Advisory"
                    value={notifForm.title}
                    onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select
                    className="form-select"
                    value={notifForm.to}
                    onChange={(e) => setNotifForm({ ...notifForm, to: e.target.value })}
                  >
                    <option value="all">Platform-Wide (All Users)</option>
                    <option value="farmer">Farmers Only</option>
                    <option value="buyer">Buyers Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Body</label>
                  <textarea
                    rows="3"
                    required
                    className="form-textarea"
                    placeholder="Enter announcement details..."
                    value={notifForm.body}
                    onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#174d35' }}>
                  Send Broadcast
                </button>
              </form>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'capitalize' }}>
                Activity Log
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Target ID</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at || log.createdAt).toLocaleTimeString()}</td>
                      <td style={{ fontWeight: 700 }}>{log.action}</td>
                      <td>{log.target_type || log.targetType}</td>
                      <td>#{log.target_id || log.targetId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
