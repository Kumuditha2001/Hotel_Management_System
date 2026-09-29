const express = require('express');
const router = express.Router();
const { getHotelDetails, updateHotelDetails } = require('../controllers/hotelController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route to view hotel details
router.get('/', getHotelDetails);

// Admin-only route to update hotel details
router.put('/', protect, adminOnly, updateHotelDetails);

module.exports = router;
