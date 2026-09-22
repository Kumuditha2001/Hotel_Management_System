const Room = require('../models/Room');

// @route   POST /api/rooms
// @access  Private/Admin
// @desc    Create a new room
const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, roomType, pricePerMonth, capacity, description, image } = req.body;

    if (!roomNumber || !roomType || !pricePerMonth || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'roomNumber, roomType, pricePerMonth and capacity are required',
      });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'A room with this number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description,
      image,
    });

    res.status(201).json({ success: true, message: 'Room created successfully', room });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rooms
// @access  Public
// @desc    Get all rooms
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/rooms/:id
// @access  Public
// @desc    Get a single room by ID
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, room });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/rooms/:id
// @access  Private/Admin
// @desc    Update a room
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: 'Room updated successfully', room: updatedRoom });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/rooms/:id
// @access  Private/Admin
// @desc    Delete a room
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    await room.deleteOne();

    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rooms/:id/upload-image
// @access  Private/Admin
// @desc    Upload an image for a specific room
const uploadRoomImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Build the public URL where this image can be viewed
    // e.g. https://hotel-management-system-di9f.onrender.com/uploads/room-1695300000000.jpg
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    room.image = imageUrl;
    await room.save();

    res.status(200).json({ success: true, message: 'Image uploaded successfully', room });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRoom, getRooms, getRoomById, updateRoom, deleteRoom, uploadRoomImage };