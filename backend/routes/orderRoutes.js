const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/authMiddleware');

router.get('/', auth, orderController.getOrders);
router.patch('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;
