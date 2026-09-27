const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const offerController = require('../controllers/offerController');
const { auth, farmerOnly, buyerOnly } = require('../middleware/authMiddleware');

router.get('/', postController.getAllPosts);
router.post('/', auth, farmerOnly, postController.createPost);
router.delete('/:id', auth, farmerOnly, postController.deletePost);

// Nested routes for offers on a specific post
router.post('/:id/offers', auth, buyerOnly, offerController.submitOffer);
router.get('/:id/offers', auth, offerController.getPostOffers);

module.exports = router;
