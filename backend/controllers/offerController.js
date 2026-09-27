const { getPool, isMySQL, memoryStore } = require('../config/db');
const { getProduceImage } = require('../utils/produceImages');

const STANDARD_DELIVERY_CHARGE = 100.00;

exports.submitOffer = async (req, res) => {
  try {
    const postId = +req.params.id;
    const { offeredPrice, quantity, message } = req.body;
    if (!offeredPrice || !quantity) {
      return res.status(400).json({ error: 'Offered price and quantity are required' });
    }

    const reqQty = parseFloat(quantity);
    if (isNaN(reqQty) || reqQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    const buyerId = req.user.id;
    const buyerName = req.user.name || 'Buyer';

    if (isMySQL()) {
      const pool = getPool();
      const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
      const post = posts[0];
      if (!post) return res.status(404).json({ error: 'Produce listing not found' });

      const isFarmerOwner = String(post.farmer_id) === String(buyerId) || 
                            (post.farmer_name && buyerName && post.farmer_name.trim().toLowerCase() === buyerName.trim().toLowerCase());
      if (isFarmerOwner) {
        return res.status(400).json({ error: 'You cannot bid on your own produce.' });
      }

      // Check if listing is active
      const postStatus = post.status;
      if (postStatus === 'Sold Out' || postStatus === 'Closed') {
        return res.status(400).json({ error: 'This listing is sold out and no longer accepting bids.' });
      }

      const totalQty = parseFloat(post.total_quantity !== undefined && post.total_quantity !== null ? post.total_quantity : post.quantity);
      const [allAccepted] = await pool.query("SELECT SUM(quantity) as total_sold FROM offers WHERE post_id = ? AND status = 'Accepted'", [postId]);
      const currentSold = parseFloat(allAccepted[0]?.total_sold || 0);
      const availableQty = Math.max(0, totalQty - currentSold);

      if (availableQty <= 0) {
        return res.status(400).json({ error: 'This produce is currently sold out.' });
      }

      // Over-purchasing validation
      if (reqQty > availableQty) {
        return res.status(400).json({ error: `Only ${availableQty} ${post.unit} remaining.` });
      }

      const [result] = await pool.query(
        'INSERT INTO offers (post_id, buyer_id, buyer_name, offered_price, quantity, message, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [postId, buyerId, buyerName, offeredPrice, reqQty, message || '', 'Pending']
      );

      const offer = {
        id: result.insertId,
        postId,
        buyerId,
        buyerName,
        offeredPrice: +offeredPrice,
        quantity: reqQty,
        message: message || '',
        status: 'Pending',
        createdAt: new Date()
      };
      return res.status(201).json(offer);
    } else {
      const post = memoryStore.posts.find(p => p.id === postId || String(p.id) === String(postId));
      if (!post) return res.status(404).json({ error: 'Produce listing not found' });

      const farmerId = post.farmer_id || post.farmerId;
      const farmerName = post.farmer_name || post.farmerName;
      const isFarmerOwner = String(farmerId) === String(buyerId) ||
                            (farmerName && buyerName && farmerName.trim().toLowerCase() === buyerName.trim().toLowerCase());
      if (isFarmerOwner) {
        return res.status(400).json({ error: 'You cannot bid on your own produce.' });
      }

      const postStatus = post.status;
      if (postStatus === 'Sold Out' || postStatus === 'Closed') {
        return res.status(400).json({ error: 'This listing is sold out and no longer accepting bids.' });
      }

      const totalQty = parseFloat(post.totalQuantity ?? post.total_quantity ?? post.quantity);
      const previouslyAccepted = memoryStore.offers.filter(o => (o.postId === postId || String(o.postId) === String(postId) || o.post_id === postId) && o.status === 'Accepted');
      const currentSold = previouslyAccepted.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
      const availableQty = Math.max(0, totalQty - currentSold);

      if (availableQty <= 0) {
        return res.status(400).json({ error: 'This produce is currently sold out.' });
      }

      // Over-purchasing validation
      if (reqQty > availableQty) {
        return res.status(400).json({ error: `Only ${availableQty} ${post.unit} remaining.` });
      }

      const offer = {
        id: Date.now(),
        postId,
        buyerId,
        buyerName,
        offeredPrice: +offeredPrice,
        quantity: reqQty,
        message: message || '',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      memoryStore.offers.push(offer);
      return res.status(201).json(offer);
    }
  } catch (err) {
    console.error('submitOffer error:', err);
    res.status(500).json({ error: 'Failed to submit private bid' });
  }
};

exports.getPostOffers = async (req, res) => {
  try {
    const postId = +req.params.id;

    if (isMySQL()) {
      const pool = getPool();
      const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
      const post = posts[0];
      if (!post) return res.status(404).json({ error: 'Produce listing not found' });

      let sql = 'SELECT * FROM offers WHERE post_id = ?';
      let params = [postId];

      // Privacy protection:
      // Farmer sees all bids on their post
      // Buyer sees ONLY their own bids
      // Admin can view all
      if (req.user.role === 'farmer') {
        const isOwner = String(post.farmer_id) === String(req.user.id) ||
                        (post.farmer_name && req.user.name && post.farmer_name.trim().toLowerCase() === req.user.name.trim().toLowerCase());
        if (!isOwner) return res.status(403).json({ error: 'Unauthorized: Not your produce listing' });
      } else if (req.user.role === 'buyer') {
        sql += ' AND (buyer_id = ? OR buyer_name = ?)';
        params.push(req.user.id, req.user.name);
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const [rows] = await pool.query(sql, params);
      return res.json(rows.map(o => ({
        id: o.id,
        postId: o.post_id,
        buyerId: o.buyer_id,
        buyerName: o.buyer_name,
        offeredPrice: parseFloat(o.offered_price),
        quantity: parseFloat(o.quantity),
        message: o.message,
        status: o.status,
        createdAt: o.created_at
      })));
    } else {
      const post = memoryStore.posts.find(p => p.id === postId || String(p.id) === String(postId));
      if (!post) return res.status(404).json({ error: 'Produce listing not found' });

      const farmerId = post.farmer_id || post.farmerId;
      const farmerName = post.farmer_name || post.farmerName;
      if (req.user.role === 'farmer') {
        const isOwner = String(farmerId) === String(req.user.id) ||
                        (farmerName && req.user.name && farmerName.trim().toLowerCase() === req.user.name.trim().toLowerCase());
        if (!isOwner) return res.status(403).json({ error: 'Unauthorized: Not your produce listing' });
        return res.json(memoryStore.offers.filter(o => String(o.postId || o.post_id) === String(postId)));
      }
      if (req.user.role === 'buyer') {
        return res.json(memoryStore.offers.filter(o => String(o.postId || o.post_id) === String(postId) && (String(o.buyerId || o.buyer_id) === String(req.user.id) || (o.buyerName || o.buyer_name) === req.user.name)));
      }
      if (req.user.role === 'admin') {
        return res.json(memoryStore.offers.filter(o => String(o.postId || o.post_id) === String(postId)));
      }
      return res.status(403).json({ error: 'Unauthorized' });
    }
  } catch (err) {
    console.error('getPostOffers error:', err);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
};

exports.selectOffer = async (req, res) => {
  try {
    const offerId = +req.params.id;

    if (isMySQL()) {
      const pool = getPool();
      const [offers] = await pool.query('SELECT * FROM offers WHERE id = ?', [offerId]);
      const offer = offers[0];
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      if (offer.status === 'Accepted') {
        return res.status(400).json({ error: 'This bid has already been accepted.' });
      }

      const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [offer.post_id]);
      const post = posts[0];
      if (!post) return res.status(404).json({ error: 'Listing not found' });

      const isFarmerOwner = String(post.farmer_id) === String(req.user.id) ||
                            (post.farmer_name && req.user.name && post.farmer_name.trim().toLowerCase() === req.user.name.trim().toLowerCase());
      if (!isFarmerOwner && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not your post or unauthorized' });
      }

      const offerQty = parseFloat(offer.quantity);
      const totalQty = parseFloat(post.total_quantity !== undefined && post.total_quantity !== null ? post.total_quantity : post.quantity);

      // Compute current sold from all accepted offers
      const [allAcceptedBefore] = await pool.query("SELECT SUM(quantity) as total_sold FROM offers WHERE post_id = ? AND status = 'Accepted'", [post.id]);
      const currentSold = parseFloat(allAcceptedBefore[0]?.total_sold || 0);
      const currentAvailable = Math.max(0, totalQty - currentSold);

      if (currentAvailable < offerQty) {
        return res.status(400).json({
          error: `Only ${currentAvailable} ${post.unit} remaining.`
        });
      }

      // Mark this offer as Accepted
      await pool.query("UPDATE offers SET status = 'Accepted' WHERE id = ?", [offerId]);

      // Calculate new totals
      const [allAccepted] = await pool.query("SELECT buyer_id, buyer_name, quantity, offered_price FROM offers WHERE post_id = ? AND status = 'Accepted'", [post.id]);
      const buyersList = allAccepted.map(o => ({
        buyerId: o.buyer_id,
        buyerName: o.buyer_name,
        quantity: parseFloat(o.quantity),
        unit: post.unit,
        pricePerKg: parseFloat(o.offered_price)
      }));

      const newSoldQty = buyersList.reduce((sum, b) => sum + b.quantity, 0);
      const newRemainingQty = Math.max(0, totalQty - newSoldQty);
      const newStatus = newRemainingQty <= 0.001 ? 'Sold Out' : 'Active';

      // Update post in database
      await pool.query(
        'UPDATE posts SET total_quantity = ?, sold_quantity = ?, available_quantity = ?, quantity = ?, status = ? WHERE id = ?',
        [totalQty, newSoldQty, newRemainingQty, newRemainingQty, newStatus, post.id]
      );

      if (newRemainingQty <= 0.001) {
        // Automatically close all other pending offers since listing is sold out
        await pool.query("UPDATE offers SET status = 'Closed' WHERE post_id = ? AND status = 'Pending'", [post.id]);
      } else {
        // Close any pending offers that exceed the new available quantity
        await pool.query("UPDATE offers SET status = 'Closed' WHERE post_id = ? AND status = 'Pending' AND quantity > ?", [post.id, newRemainingQty]);
      }

      const orderId = 'UZ-' + Math.floor(2000 + Math.random() * 7000);
      const bidPrice = parseFloat(offer.offered_price) * offerQty;
      const deliveryCharge = STANDARD_DELIVERY_CHARGE;
      const totalAmount = bidPrice + deliveryCharge;
      const qtyStr = `${offerQty} ${post.unit}`;
      const produceImage = post.image || getProduceImage(post.product_name);

      await pool.query(
        'INSERT INTO orders (id, offer_id, post_id, product, image, farmer, buyer, quantity, bid_price, delivery_charge, total_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, offer.id, post.id, post.product_name, produceImage, post.farmer_name, offer.buyer_name, qtyStr, bidPrice, deliveryCharge, totalAmount, 'PAYMENT PENDING', 'Pending']
      );

      const order = {
        id: orderId,
        offerId: offer.id,
        postId: post.id,
        product: post.product_name,
        image: produceImage,
        farmer: post.farmer_name,
        buyer: offer.buyer_name,
        buyerId: offer.buyer_id,
        quantity: qtyStr,
        quantityValue: offerQty,
        unit: post.unit,
        pricePerKg: parseFloat(offer.offered_price),
        bidPrice,
        deliveryCharge,
        totalAmount,
        status: 'PAYMENT PENDING',
        paymentStatus: 'Pending',
        createdAt: new Date()
      };

      return res.json({
        offer: { ...offer, status: 'Accepted' },
        order,
        totalQuantity: totalQty,
        originalQuantity: totalQty,
        soldQuantity: newSoldQty,
        availableQuantity: newRemainingQty,
        remainingQuantity: newRemainingQty,
        buyers: buyersList,
        listingStatus: newStatus
      });
    } else {
      const offer = memoryStore.offers.find(o => o.id === offerId || String(o.id) === String(offerId));
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      if (offer.status === 'Accepted') {
        return res.status(400).json({ error: 'This bid has already been accepted.' });
      }

      const post = memoryStore.posts.find(p => (p.id === (offer.postId || offer.post_id) || String(p.id) === String(offer.postId || offer.post_id)) && 
        (String(p.farmerId || p.farmer_id) === String(req.user.id) || 
         (p.farmerName && req.user.name && p.farmerName.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
         (p.farmer_name && req.user.name && p.farmer_name.trim().toLowerCase() === req.user.name.trim().toLowerCase()) ||
         req.user.role === 'admin'));
      if (!post) return res.status(403).json({ error: 'Not your post or unauthorized' });

      const offerQty = parseFloat(offer.quantity);
      const totalQty = parseFloat(post.totalQuantity ?? post.total_quantity ?? post.quantity);
      
      // Calculate current sold from already accepted offers
      const previouslyAccepted = memoryStore.offers.filter(o => (o.postId === post.id || String(o.postId) === String(post.id) || o.post_id === post.id) && o.status === 'Accepted');
      const previouslySold = previouslyAccepted.reduce((sum, o) => sum + parseFloat(o.quantity), 0);
      const currentAvailable = Math.max(0, totalQty - previouslySold);

      if (currentAvailable < offerQty) {
        return res.status(400).json({
          error: `Only ${currentAvailable} ${post.unit} remaining.`
        });
      }

      // Accept this offer
      offer.status = 'Accepted';

      // Recompute dynamic buyers and totals
      const allAccepted = memoryStore.offers.filter(o => (o.postId === post.id || String(o.postId) === String(post.id) || o.post_id === post.id) && o.status === 'Accepted');
      const buyersList = allAccepted.map(o => ({
        buyerId: o.buyerId || o.buyer_id,
        buyerName: o.buyerName || o.buyer_name,
        quantity: parseFloat(o.quantity),
        unit: post.unit,
        pricePerKg: parseFloat(o.offeredPrice || o.offered_price)
      }));

      const newSold = buyersList.reduce((sum, b) => sum + b.quantity, 0);
      const newAvailable = Math.max(0, totalQty - newSold);
      const newStatus = newAvailable <= 0.001 ? 'Sold Out' : 'Active';

      post.totalQuantity = totalQty;
      post.total_quantity = totalQty;
      post.availableQuantity = newAvailable;
      post.available_quantity = newAvailable;
      post.remainingQuantity = newAvailable;
      post.soldQuantity = newSold;
      post.sold_quantity = newSold;
      post.quantity = newAvailable;
      post.status = newStatus;
      post.buyers = buyersList;

      if (newAvailable <= 0.001) {
        // Close all other pending bids
        memoryStore.offers
          .filter(o => (o.postId === post.id || String(o.postId) === String(post.id) || o.post_id === post.id) && o.id !== offer.id && o.status === 'Pending')
          .forEach(o => o.status = 'Closed');
      } else {
        // Close bids that exceed remaining quantity
        memoryStore.offers
          .filter(o => (o.postId === post.id || String(o.postId) === String(post.id) || o.post_id === post.id) && o.id !== offer.id && o.status === 'Pending' && parseFloat(o.quantity) > newAvailable)
          .forEach(o => o.status = 'Closed');
      }

      const bidPrice = (offer.offeredPrice || offer.offered_price) * offerQty;
      const deliveryCharge = STANDARD_DELIVERY_CHARGE;
      const totalAmount = bidPrice + deliveryCharge;
      const produceImage = post.image || getProduceImage(post.productName || post.product_name);
      const qtyStr = `${offerQty} ${post.unit}`;

      const order = {
        id: 'UZ-' + Math.floor(2000 + Math.random() * 7000),
        offerId: offer.id,
        postId: post.id,
        product: post.productName || post.product_name,
        image: produceImage,
        farmer: post.farmerName || post.farmer_name,
        buyer: offer.buyerName || offer.buyer_name,
        buyerId: offer.buyerId || offer.buyer_id,
        quantity: qtyStr,
        quantityValue: offerQty,
        unit: post.unit,
        pricePerKg: parseFloat(offer.offeredPrice || offer.offered_price),
        bidPrice,
        deliveryCharge,
        totalAmount,
        status: 'PAYMENT PENDING',
        paymentStatus: 'Pending',
        createdAt: new Date().toISOString()
      };

      memoryStore.orders.unshift(order);
      return res.json({
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
    }
  } catch (err) {
    console.error('selectOffer error:', err);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
};
