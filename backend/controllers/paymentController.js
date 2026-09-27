const { getPool, isMySQL, memoryStore } = require('../config/db');

exports.processPayment = async (req, res) => {
  try {
    const { orderId, amount, method, buyerName, farmerName } = req.body;
    if (!orderId || !amount || !method) {
      return res.status(400).json({ error: 'Order ID, amount, and payment method are required' });
    }

    if (req.user.role !== 'buyer') {
      return res.status(403).json({ error: 'Payment can only be processed by buyers.' });
    }

    const txnId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
    const buyer = buyerName || req.user.name || 'Buyer';
    const farmer = farmerName || 'Farmer';

    if (isMySQL()) {
      const pool = getPool();
      const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const order = orders[0];
      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (order.payment_status === 'Successful' || order.payment_status === 'Paid') {
        return res.status(400).json({ error: 'This order has already been paid.' });
      }

      await pool.query(
        'INSERT INTO payments (txn_id, order_id, amount, method, buyer_name, farmer_name, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [txnId, orderId, amount, method, buyer, farmer, 'Successful']
      );

      await pool.query(
        "UPDATE orders SET payment_status = 'Successful', txn_id = ?, status = 'PAID / CONFIRMED' WHERE id = ?",
        [txnId, orderId]
      );

      const [updatedOrders] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
      const updatedOrder = updatedOrders[0];

      const payment = {
        txnId,
        orderId,
        amount,
        method,
        buyerName: buyer,
        farmerName: farmer,
        status: 'Successful',
        createdAt: new Date()
      };

      return res.status(201).json({
        success: true,
        message: 'Payment successful. Your order is confirmed.',
        payment,
        order: {
          id: updatedOrder.id,
          product: updatedOrder.product,
          farmer: updatedOrder.farmer,
          buyer: updatedOrder.buyer,
          quantity: updatedOrder.quantity,
          bidPrice: parseFloat(updatedOrder.bid_price || updatedOrder.raw_price),
          deliveryCharge: parseFloat(updatedOrder.delivery_charge || 100),
          totalAmount: parseFloat(updatedOrder.total_amount),
          status: updatedOrder.status,
          paymentStatus: updatedOrder.payment_status,
          txnId: updatedOrder.txn_id
        }
      });
    } else {
      const order = memoryStore.orders.find(o => o.id === orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      if (order.paymentStatus === 'Successful' || order.paymentStatus === 'Paid') {
        return res.status(400).json({ error: 'This order has already been paid.' });
      }

      const payment = {
        id: Date.now(),
        txnId,
        orderId,
        amount,
        method,
        buyerName: buyer,
        farmerName: farmer,
        status: 'Successful',
        createdAt: new Date().toISOString()
      };
      memoryStore.payments.unshift(payment);

      order.paymentStatus = 'Successful';
      order.txnId = txnId;
      order.status = 'PAID / CONFIRMED';

      return res.status(201).json({
        success: true,
        message: 'Payment successful. Your order is confirmed.',
        payment,
        order
      });
    }
  } catch (err) {
    console.error('processPayment error:', err);
    res.status(500).json({ error: 'Payment failed. Please try again.' });
  }
};
