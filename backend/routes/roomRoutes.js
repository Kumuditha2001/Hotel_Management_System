const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  uploadRoomImage,
} = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/rooms - view all rooms (public)
router.get('/', getRooms);

// GET /api/rooms/:id - view single room (public)
router.get('/:id', getRoomById);

// POST /api/rooms - create room (admin only)
router.post('/', protect, adminOnly, createRoom);

// PUT /api/rooms/:id - update room (admin only)
router.put('/:id', protect, adminOnly, updateRoom);

// DELETE /api/rooms/:id - delete room (admin only)
router.delete('/:id', protect, adminOnly, deleteRoom);

// POST /api/rooms/:id/upload-image - upload room image (admin only)
router.post('/:id/upload-image', protect, adminOnly, upload.single('image'), uploadRoomImage);

module.exports = router;