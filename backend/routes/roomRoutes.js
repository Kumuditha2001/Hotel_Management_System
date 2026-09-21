const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// GET /api/rooms - view all rooms (public, per assignment brief)
router.get('/', getRooms);

// GET /api/rooms/:id - view single room (public)
router.get('/:id', getRoomById);

// POST /api/rooms - create room (admin only)
router.post('/', protect, adminOnly, createRoom);

// PUT /api/rooms/:id - update room (admin only)
router.put('/:id', protect, adminOnly, updateRoom);

// DELETE /api/rooms/:id - delete room (admin only)
router.delete('/:id', protect, adminOnly, deleteRoom);

module.exports = router;