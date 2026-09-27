const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { auth, farmerOnly } = require('../middleware/authMiddleware');

router.post('/:id/select', auth, farmerOnly, offerController.selectOffer);

module.exports = router;
