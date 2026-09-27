const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/authMiddleware');

router.get('/stats', adminAuth, adminController.getStats);
router.get('/farmers', adminAuth, adminController.getFarmers);
router.get('/buyers', adminAuth, adminController.getBuyers);
router.patch('/users/:id/status', adminAuth, adminController.updateUserStatus);
router.get('/products', adminAuth, adminController.getProducts);
router.patch('/products/:id', adminAuth, adminController.updateProductStatus);
router.get('/offers', adminAuth, adminController.getOffers);
router.get('/orders', adminAuth, adminController.getOrders);
router.get('/payments', adminAuth, adminController.getPayments);
router.get('/reports', adminAuth, adminController.getReports);
router.patch('/reports/:id/status', adminAuth, adminController.updateReportStatus);
router.get('/activity-log', adminAuth, adminController.getActivityLogs);
router.post('/notifications', adminAuth, adminController.createNotification);

module.exports = router;
