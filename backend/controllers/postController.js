const { getPool, isMySQL, memoryStore } = require('../config/db');
const { getProduceImage } = require('../utils/produceImages');

exports.getAllPosts = async (req, res) => {
  try {
    if (isMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
      const [acceptedOffers] = await pool.query("SELECT post_id, buyer_id, buyer_name, quantity, offered_price FROM offers WHERE status = 'Accepted'");

      return res.json(rows.map(r => {
        const postOffers = acceptedOffers.filter(o => o.post_id === r.id);
        const buyersList = postOffers.map(o => ({
          buyerId: o.buyer_id,
          buyerName: o.buyer_name,
          quantity: parseFloat(o.quantity),
          unit: r.unit,
          pricePerKg: parseFloat(o.offered_price)
        }));

        const totalQty = parseFloat(r.total_quantity !== undefined && r.total_quantity !== null ? r.total_quantity : r.quantity);
        // soldQuantity = SUM(quantity of ALL accepted/confirmed orders for that listing)
        const soldQty = buyersList.reduce((sum, b) => sum + b.quantity, 0);
        // remainingQuantity = originalQuantity - soldQuantity
        const availableQty = Math.max(0, totalQty - soldQty);
        let currentStatus = availableQty <= 0.001 ? 'Sold Out' : (r.status === 'Closed' ? 'Closed' : 'Active');

        return {
          id: r.id,
          farmerId: r.farmer_id,
          farmerName: r.farmer_name,
          productName: r.product_name,
          quantity: availableQty, // Buyers see available quantity
          totalQuantity: totalQty,
          originalQuantity: totalQty,
          availableQuantity: availableQty,
          remainingQuantity: availableQty,
          soldQuantity: soldQty,
          buyers: buyersList,
          unit: r.unit,
          location: r.location,
          description: r.description,
          image: r.image || getProduceImage(r.product_name),
          status: currentStatus,
          createdAt: r.created_at
        };
      }));
    } else {
      return res.json(memoryStore.posts.map(r => {
        const postOffers = memoryStore.offers.filter(o => (o.postId || o.post_id) === r.id && o.status === 'Accepted');
        const buyersList = postOffers.map(o => ({
          buyerId: o.buyerId || o.buyer_id,
          buyerName: o.buyerName || o.buyer_name,
          quantity: parseFloat(o.quantity),
          unit: r.unit,
          pricePerKg: parseFloat(o.offeredPrice || o.offered_price)
        }));

        const totalQty = parseFloat(r.totalQuantity ?? r.total_quantity ?? r.quantity);
        // soldQuantity = SUM(quantity of ALL accepted/confirmed orders for that listing)
        const soldQty = buyersList.reduce((sum, b) => sum + b.quantity, 0);
        // remainingQuantity = originalQuantity - soldQuantity
        const availableQty = Math.max(0, totalQty - soldQty);
        let currentStatus = availableQty <= 0.001 ? 'Sold Out' : (r.status === 'Closed' ? 'Closed' : 'Active');

        return {
          id: r.id,
          farmerId: r.farmer_id || r.farmerId,
          farmerName: r.farmer_name || r.farmerName,
          productName: r.product_name || r.productName,
          quantity: availableQty, // Buyers see available quantity
          totalQuantity: totalQty,
          originalQuantity: totalQty,
          availableQuantity: availableQty,
          remainingQuantity: availableQty,
          soldQuantity: soldQty,
          buyers: buyersList,
          unit: r.unit,
          location: r.location,
          description: r.description,
          image: r.image || getProduceImage(r.product_name || r.productName),
          status: currentStatus,
          createdAt: r.created_at || r.createdAt
        };
      }));
    }
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ error: 'Failed to fetch produce posts' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { productName, quantity, unit, location, description, harvestDate, deliveryInfo, image } = req.body;
    if (!productName || !quantity || !unit || !location) {
      return res.status(400).json({ error: 'Produce name, quantity, unit and farm location are required' });
    }
    if ('price' in req.body) {
      return res.status(400).json({ error: 'Farmers cannot set a price — buyers submit bids' });
    }

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    const farmerId = req.user.id;
    const farmerName = req.user.name || 'Farmer';
    
    // Automatically assign suitable representative image based on produce name as default,
    // or use farmer's custom captured photo if provided
    const autoImage = getProduceImage(productName);
    const finalImage = (image && typeof image === 'string' && image.trim()) ? image.trim() : autoImage;

    let fullDescription = description || '';
    if (harvestDate) {
      fullDescription += (fullDescription ? ' | ' : '') + `Harvest Date: ${harvestDate}`;
    }
    if (deliveryInfo) {
      fullDescription += (fullDescription ? ' | ' : '') + `Delivery Note: ${deliveryInfo}`;
    }

    if (isMySQL()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO posts (farmer_id, farmer_name, product_name, quantity, total_quantity, available_quantity, sold_quantity, unit, location, description, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [farmerId, farmerName, productName.trim(), numQty, numQty, numQty, 0, unit, location.trim(), fullDescription, finalImage, 'Active']
      );
      const post = {
        id: result.insertId,
        farmerId,
        farmerName,
        productName: productName.trim(),
        quantity: numQty,
        totalQuantity: numQty,
        availableQuantity: numQty,
        soldQuantity: 0,
        unit,
        location: location.trim(),
        description: fullDescription,
        image: finalImage,
        status: 'Active',
        createdAt: new Date()
      };
      return res.status(201).json(post);
    } else {
      const post = {
        id: Date.now(),
        farmerId,
        farmerName,
        productName: productName.trim(),
        quantity: numQty,
        totalQuantity: numQty,
        availableQuantity: numQty,
        soldQuantity: 0,
        unit,
        location: location.trim(),
        description: fullDescription,
        image: finalImage,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      memoryStore.posts.unshift(post);
      return res.status(201).json(post);
    }
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ error: 'Failed to create produce post' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const postId = +req.params.id;
    const farmerId = req.user.id;

    if (isMySQL()) {
      const pool = getPool();
      const [result] = await pool.query('DELETE FROM posts WHERE id = ? AND farmer_id = ?', [postId, farmerId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Post not found or unauthorized' });
      }
      return res.json({ message: 'Post deleted successfully' });
    } else {
      const idx = memoryStore.posts.findIndex(p => p.id === postId && (p.farmerId === farmerId || p.farmer_id === farmerId));
      if (idx === -1) return res.status(404).json({ error: 'Post not found or unauthorized' });
      memoryStore.posts.splice(idx, 1);
      return res.json({ message: 'Post deleted successfully' });
    }
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
