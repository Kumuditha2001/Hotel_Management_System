const express = require('express');
const router = express.Router();
const {
  createBooking,
  updateBookingDetails,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/bookings - any logged-in user can request a booking
router.post('/', protect, createBooking);

// GET /api/bookings - admin sees all, regular user sees only their own
router.get('/', protect, getBookings);

// GET /api/bookings/:id - view one booking (with ownership check inside controller)
router.get('/:id', protect, getBookingById);

// PUT /api/bookings/:id - owner edits their own Pending booking's dates
router.put('/:id', protect, updateBookingDetails);

// PUT /api/bookings/:id/status - approve/reject (admin only)
router.put('/:id/status', protect, adminOnly, updateBookingStatus);

// DELETE /api/bookings/:id - cancel (owner or admin, checked inside controller)
router.delete('/:id', protect, cancelBooking);

module.exports = router;