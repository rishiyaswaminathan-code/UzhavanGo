const { getPool, isMySQL, memoryStore } = require('../config/db');

const ORDER_STATES = [
  'POSTED',
  'BID RECEIVED',
  'BID ACCEPTED',
  'PAYMENT PENDING',
  'PAID / CONFIRMED',
  'PROCESSING',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED'
];

exports.getOrders = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userName = req.user.name;

    if (isMySQL()) {
      const pool = getPool();
      let sql = 'SELECT * FROM orders ORDER BY created_at DESC';
      let params = [];

      if (userRole === 'farmer') {
        sql = 'SELECT * FROM orders WHERE farmer = ? ORDER BY created_at DESC';
        params = [userName];
      } else if (userRole === 'buyer') {
        sql = 'SELECT * FROM orders WHERE buyer = ? ORDER BY created_at DESC';
        params = [userName];
      }

      const [rows] = await pool.query(sql, params);
      return res.json(rows.map(r => ({
        id: r.id,
        offerId: r.offer_id,
        postId: r.post_id,
        product: r.product,
        image: r.image,
        farmer: r.farmer,
        buyer: r.buyer,
        quantity: r.quantity,
        bidPrice: parseFloat(r.bid_price || r.raw_price || 0),
        deliveryCharge: parseFloat(r.delivery_charge || 100),
        totalAmount: parseFloat(r.total_amount || (r.raw_price ? r.raw_price + 100 : 0)),
        status: r.status,
        paymentStatus: r.payment_status,
        txnId: r.txn_id,
        createdAt: r.created_at
      })));
    } else {
      if (userRole === 'admin') return res.json(memoryStore.orders);
      if (userRole === 'farmer') {
        return res.json(memoryStore.orders.filter(o => 
          (o.farmer && userName && o.farmer.trim().toLowerCase() === userName.trim().toLowerCase()) ||
          (o.farmerId && String(o.farmerId) === String(req.user.id))
        ));
      }
      return res.json(memoryStore.orders.filter(o => 
        (o.buyer && userName && o.buyer.trim().toLowerCase() === userName.trim().toLowerCase()) ||
        (o.buyerId && String(o.buyerId) === String(req.user.id))
      ));
    }
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!ORDER_STATES.includes(status)) {
      return res.status(400).json({ error: `Invalid order status. Allowed: ${ORDER_STATES.join(', ')}` });
    }

    if (isMySQL()) {
      const pool = getPool();
      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const order = orders[0];
      if (!order) return res.status(404).json({ error: 'Order not found' });

      // If status is trying to move past PAYMENT PENDING without payment, reject
      if (['PROCESSING', 'OUT FOR DELIVERY', 'DELIVERED', 'COMPLETED'].includes(status) && order.payment_status !== 'Successful' && order.payment_status !== 'Paid') {
        return res.status(400).json({ error: 'Cannot advance order status until the buyer completes payment.' });
      }

      await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
      order.status = status;

      if (status === 'CANCELLED' && order.offer_id) {
        await pool.query("UPDATE offers SET status = 'Cancelled' WHERE id = ?", [order.offer_id]);
        if (order.post_id) {
          const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [order.post_id]);
          const post = posts[0];
          if (post) {
            const [allAccepted] = await pool.query("SELECT SUM(quantity) as total_sold FROM offers WHERE post_id = ? AND status = 'Accepted'", [post.id]);
            const newSold = parseFloat(allAccepted[0]?.total_sold || 0);
            const totalQty = parseFloat(post.total_quantity !== undefined && post.total_quantity !== null ? post.total_quantity : post.quantity);
            const newAvail = Math.max(0, totalQty - newSold);
            const newPostStatus = newAvail <= 0.001 ? 'Sold Out' : 'Active';
            await pool.query('UPDATE posts SET sold_quantity = ?, available_quantity = ?, quantity = ?, status = ? WHERE id = ?', [newSold, newAvail, newAvail, newPostStatus, post.id]);
          }
        }
      }

      return res.json(order);
    } else {
      const order = memoryStore.orders.find(o => o.id === orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (['PROCESSING', 'OUT FOR DELIVERY', 'DELIVERED', 'COMPLETED'].includes(status) && order.paymentStatus !== 'Successful' && order.paymentStatus !== 'Paid') {
        return res.status(400).json({ error: 'Cannot advance order status until the buyer completes payment.' });
      }

      order.status = status;

      if (status === 'CANCELLED' && order.offerId) {
        const offer = memoryStore.offers.find(o => o.id === order.offerId || String(o.id) === String(order.offerId));
        if (offer) offer.status = 'Cancelled';
        const post = memoryStore.posts.find(p => p.id === order.postId || String(p.id) === String(order.postId));
        if (post) {
          const acceptedOffers = memoryStore.offers.filter(o => (o.postId === post.id || String(o.postId) === String(post.id)) && o.status === 'Accepted');
          const newSold = acceptedOffers.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
          const totalQty = parseFloat(post.totalQuantity ?? post.total_quantity ?? post.quantity);
          const newAvail = Math.max(0, totalQty - newSold);
          const newPostStatus = newAvail <= 0.001 ? 'Sold Out' : 'Active';

          post.soldQuantity = newSold;
          post.sold_quantity = newSold;
          post.availableQuantity = newAvail;
          post.available_quantity = newAvail;
          post.remainingQuantity = newAvail;
          post.quantity = newAvail;
          post.status = newPostStatus;
          post.buyers = acceptedOffers.map(o => ({
            buyerId: o.buyerId || o.buyer_id,
            buyerName: o.buyerName || o.buyer_name,
            quantity: parseFloat(o.quantity),
            unit: post.unit,
            pricePerKg: parseFloat(o.offeredPrice || o.offered_price)
          }));
        }
      }

      return res.json(order);
    }
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
