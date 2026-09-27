import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { getProduceImage } from '../utils/produceImages';
import { CreditCard, CheckCircle, Truck, Package, ShieldCheck, ArrowRight, Sprout } from 'lucide-react';

export function OrdersPage({ showToast, setActivePage }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const [ordersData, postsData] = await Promise.all([
        api.getOrders(),
        api.getPosts().catch(() => [])
      ]);
      setOrders(ordersData);
      setPosts(postsData);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenPayment = (order) => {
    if (user?.role !== 'buyer') {
      showToast('Only buyers can initiate payments.', 'error');
      return;
    }
    if (order.status !== 'PAYMENT PENDING' && order.paymentStatus === 'Successful') {
      showToast('This order has already been paid.', 'info');
      return;
    }
    setSelectedOrder(order);
    setPaymentMethod('UPI');
    setPaymentReceipt(null);
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      setSubmittingPayment(true);
      const result = await api.processPayment({
        orderId: selectedOrder.id,
        amount: selectedOrder.totalAmount,
        method: paymentMethod,
        buyerName: selectedOrder.buyer,
        farmerName: selectedOrder.farmer
      });
      setPaymentReceipt(result.payment);
      showToast(result.message || 'Payment successful! Order confirmed.', 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      showToast(`Order status updated to: ${nextStatus}`, 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getNextStatus = (current) => {
    const flow = {
      'PAID / CONFIRMED': 'PROCESSING',
      'PROCESSING': 'OUT FOR DELIVERY',
      'OUT FOR DELIVERY': 'DELIVERED',
      'DELIVERED': 'COMPLETED'
    };
    return flow[current] || null;
  };

  const ORDER_STAGES = [
    'BID ACCEPTED',
    'PAYMENT PENDING',
    'PAID / CONFIRMED',
    'PROCESSING',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'COMPLETED'
  ];

  const getStageIndex = (status) => {
    return ORDER_STAGES.indexOf(status);
  };

  return (
    <div className="orders-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1f2937' }}>
          Orders &amp; Dispatch Tracking
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Full lifecycle management from accepted bids, online buyer payments, to farm gate delivery.
        </p>
      </div>

      {/* FARMER ORDER SUMMARY SECTION */}
      {(() => {
        const isFarmerPost = (p) => (
          String(p.farmerId ?? p.farmer_id) === String(user?.id) ||
          (p.farmerName && user?.name && p.farmerName.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
          (p.farmer_name && user?.name && p.farmer_name.trim().toLowerCase() === user.name.trim().toLowerCase())
        );
        const myFarmerPosts = posts.filter(isFarmerPost);

        if (user?.role !== 'farmer' || myFarmerPosts.length === 0) return null;

        return (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📊 Farmer Produce &amp; Order Summary
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Real-time inventory and partial purchase tracking for all your listed harvests.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {myFarmerPosts.map(post => {
              const productOrders = orders.filter(o => o.postId === post.id || o.product === post.productName);
              const avail = parseFloat(post.availableQuantity !== undefined ? post.availableQuantity : post.quantity);
              const isSoldOut = avail <= 0 || post.status === 'Sold Out';

              return (
                <div key={post.id} className="card" style={{ padding: '1.25rem', border: isSoldOut ? '1px solid #fca5a5' : '1px solid #bbf7d0', background: isSoldOut ? '#fffafb' : '#fafffc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                        {post.productName}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {post.location}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: isSoldOut ? '#dc2626' : '#166534',
                      color: 'white'
                    }}>
                      {isSoldOut ? 'SOLD OUT' : 'ACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem', textAlign: 'center' }}>
                    <div style={{ background: 'white', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total Quantity</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                        {post.totalQuantity ?? post.quantity} {post.unit}
                      </div>
                    </div>
                    <div style={{ background: 'white', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Sold / Purchased</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0284c7' }}>
                        {post.soldQuantity || 0} {post.unit}
                      </div>
                    </div>
                    <div style={{ background: 'white', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Remaining</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isSoldOut ? '#dc2626' : '#166534' }}>
                        {avail} {post.unit}
                      </div>
                    </div>
                  </div>

                  {/* Buyers list */}
                  <div style={{ background: 'white', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569', marginBottom: '0.35rem' }}>
                      Buyers:
                    </div>
                    {productOrders.length === 0 ? (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No partial purchases yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {productOrders.map((ord, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                            <span>👤 {ord.buyer}</span>
                            <strong style={{ color: '#166534' }}>→ {ord.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          Loading orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={40} style={{ color: '#9ca3af', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151' }}>No orders active</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            When a farmer accepts a buyer bid, generated orders will appear here for payment and delivery tracking.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const currentStageIdx = getStageIndex(order.status);
            const produceImg = order.image || getProduceImage(order.product);

            return (
              <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Produce Image with clean fallback */}
                  <div style={{ width: '100px', height: '100px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {produceImg ? (
                      <img
                        src={produceImg}
                        alt={order.product}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{ display: produceImg ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', textAlign: 'center', color: '#94a3b8' }}>
                      <Sprout size={24} color="#16a34a" />
                      <span style={{ fontSize: '0.65rem', marginTop: '0.2rem', fontWeight: 600 }}>No Image</span>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1b5e20' }}>
                        {order.id}
                      </span>
                      <span style={{ fontSize: '0.85rem', padding: '0.2rem 0.6rem', borderRadius: '6px', background: '#f3f4f6', fontWeight: 700 }}>
                        {order.product}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#4b5563', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span>👨‍🌾 <strong>Farmer:</strong> {order.farmer}</span>
                      <span>🧑‍💼 <strong>Buyer:</strong> {order.buyer}</span>
                      <span>⚖️ <strong>Quantity:</strong> {order.quantity}</span>
                    </div>

                    {/* Price Breakdown: Accepted Bid Amount + Delivery Charge = Total */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      marginTop: '0.75rem',
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      fontSize: '0.85rem'
                    }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Accepted Bid: </span>
                        <strong style={{ color: '#1f2937' }}>₹{order.bidPrice?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Delivery Charge: </span>
                        <strong style={{ color: '#1f2937' }}>₹{order.deliveryCharge?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#166534', fontWeight: 700 }}>Total Amount: </span>
                        <strong style={{ color: '#166534', fontSize: '1.05rem' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions Column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', minWidth: '180px' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: (order.paymentStatus === 'Successful' || order.paymentStatus === 'Paid') ? '#dcfce7' : '#fef3c7',
                        color: (order.paymentStatus === 'Successful' || order.paymentStatus === 'Paid') ? '#166534' : '#92400e'
                      }}>
                        Payment: {order.paymentStatus}
                      </span>

                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: order.status === 'COMPLETED' ? '#dcfce7' : '#e0e7ff',
                        color: order.status === 'COMPLETED' ? '#166534' : '#3730a3'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {user?.role === 'buyer' && (order.status === 'PAYMENT PENDING' || order.paymentStatus === 'Pending') && (
                        <button
                          className="btn btn-accent"
                          style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                          onClick={() => handleOpenPayment(order)}
                        >
                          <CreditCard size={16} /> Pay ₹{order.totalAmount?.toLocaleString('en-IN')}
                        </button>
                      )}

                      {nextStatus && (
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                          onClick={() => handleUpdateStatus(order.id, nextStatus)}
                        >
                          <Truck size={16} /> Advance to {nextStatus}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Lifecycle Progression */}
                <div style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}>
                  {ORDER_STAGES.map((stage, idx) => {
                    const isPassed = currentStageIdx >= idx;
                    const isCurrent = currentStageIdx === idx;
                    return (
                      <React.Fragment key={stage}>
                        {idx > 0 && <span style={{ color: isPassed ? '#16a34a' : '#cbd5e1' }}>➔</span>}
                        <span style={{
                          fontWeight: isCurrent ? 800 : isPassed ? 600 : 500,
                          color: isCurrent ? '#1b5e20' : isPassed ? '#16a34a' : '#94a3b8',
                          background: isCurrent ? '#e8f5e9' : 'transparent',
                          padding: isCurrent ? '0.2rem 0.5rem' : '0',
                          borderRadius: '4px'
                        }}>
                          {stage}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Online Buyer Payment */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={paymentReceipt ? 'Payment Confirmation & Receipt' : `Online Payment for Order ${selectedOrder?.id}`}
      >
        {paymentReceipt ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle size={52} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#166534', marginBottom: '0.5rem' }}>
              Payment Successful!
            </h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your order has been verified and confirmed. Transport &amp; delivery tracking has begun.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'left',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Transaction ID:</span>
                <span style={{ fontWeight: 800 }}>{paymentReceipt.txnId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Order ID:</span>
                <span style={{ fontWeight: 700 }}>{paymentReceipt.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Farmer:</span>
                <span style={{ fontWeight: 700 }}>{paymentReceipt.farmerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <span style={{ fontWeight: 700 }}>{paymentReceipt.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>Total Paid:</span>
                <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1.1rem' }}>
                  ₹{Number(paymentReceipt.amount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Done &amp; View Confirmed Order
            </button>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment}>
            {/* Price breakdown summary */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Summary:</div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1f2937' }}>
                {selectedOrder?.product} ({selectedOrder?.quantity})
              </div>
              <div style={{ marginTop: '0.6rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>Accepted Bid Amount:</span>
                  <span>₹{selectedOrder?.bidPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#64748b' }}>Delivery Charge:</span>
                  <span>₹{selectedOrder?.deliveryCharge?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#1b5e20', borderTop: '1px solid #e2e8f0', paddingTop: '0.4rem', marginTop: '0.4rem' }}>
                  <span>Total Payable:</span>
                  <span>₹{selectedOrder?.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Payment Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {['UPI', 'Card', 'NetBanking'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`btn ${paymentMethod === method ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.85rem', padding: '0.6rem 0.2rem' }}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === 'UPI' ? '📱 UPI' : method === 'Card' ? '💳 Card' : '🏦 NetBank'}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="form-group">
                <label className="form-label">Virtual Payment Address (UPI ID / VPA)</label>
                <input
                  type="text"
                  required
                  defaultValue="buyer@okaxis"
                  className="form-input"
                  placeholder="e.g. mobile@upi or username@okhdfcbank"
                />
              </div>
            )}

            {paymentMethod === 'Card' && (
              <>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    required
                    defaultValue="4532 •••• •••• 8892"
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input type="text" defaultValue="08/29" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input type="password" defaultValue="•••" className="form-input" />
                  </div>
                </div>
              </>
            )}

            {paymentMethod === 'NetBanking' && (
              <div className="form-group">
                <label className="form-label">Select Bank</label>
                <select className="form-select">
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                </select>
              </div>
            )}

            <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', color: '#166534', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} />
              <span>Safe demo payment sandbox. No actual credit card info is stored in the database.</span>
            </div>

            <button
              type="submit"
              disabled={submittingPayment}
              className="btn btn-accent"
              style={{ width: '100%' }}
            >
              {submittingPayment ? 'Processing Payment...' : `Confirm & Pay ₹${selectedOrder?.totalAmount?.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
