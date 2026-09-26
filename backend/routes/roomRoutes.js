const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
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

// POST /api/rooms/:id/upload-images - upload one or more room images (admin only, max 5 per request)
router.post('/:id/upload-images', protect, adminOnly, upload.array('images', 5), uploadRoomImages);

// DELETE /api/rooms/:id/images - remove a single image from a room (admin only)
router.delete('/:id/images', protect, adminOnly, deleteRoomImage);

module.exports = router;