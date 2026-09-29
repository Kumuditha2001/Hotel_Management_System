const Room = require('../models/Room');

// @route   POST /api/rooms
// @access  Private/Admin
// @desc    Create a new room
const createRoom = async (req, res, next) => {
  try {
    const {
      roomNumber,
      roomType,
      pricePerNight,
      pricePerMonth,
      capacity,
      description,
      amenities,
      images,
      image,
    } = req.body;

    const nightlyPrice = pricePerNight || (pricePerMonth ? Math.round(pricePerMonth / 30) : 0);
    const monthlyPrice = pricePerMonth || (pricePerNight ? pricePerNight * 30 : 0);

    if (!roomNumber || !roomType || (!pricePerNight && !pricePerMonth) || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'roomNumber, roomType, price (per night or month) and capacity are required',
      });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: 'A room with this number already exists' });
    }

    // Combine any images provided
    let roomImages = Array.isArray(images) ? [...images] : [];
    if (image && !roomImages.includes(image)) {
      roomImages.unshift(image);
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerNight: nightlyPrice,
      pricePerMonth: monthlyPrice,
      capacity,
      description: description || '',
      amenities: Array.isArray(amenities) ? amenities : undefined,
      images: roomImages,
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

    // Synchronize prices if one is updated
    if (req.body.pricePerNight && !req.body.pricePerMonth) {
      req.body.pricePerMonth = req.body.pricePerNight * 30;
    } else if (req.body.pricePerMonth && !req.body.pricePerNight) {
      req.body.pricePerNight = Math.round(req.body.pricePerMonth / 30);
    }

    // If a single image URL was supplied, make sure it is in images array
    if (req.body.image) {
      const currentImages = req.body.images || room.images || [];
      if (!currentImages.includes(req.body.image)) {
        req.body.images = [req.body.image, ...currentImages];
      }
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

// @route   POST /api/rooms/:id/upload-images
// @access  Private/Admin
// @desc    Upload one or more images for a specific room (appends to existing images)
const uploadRoomImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const newImageUrls = req.files.map((file) => file.path);

    room.images = [...room.images, ...newImageUrls];
    await room.save();

    res.status(200).json({ success: true, message: 'Images uploaded successfully', room });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/rooms/:id/images
// @access  Private/Admin
// @desc    Remove a single image URL from a room's images array
const deleteRoomImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'imageUrl is required' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.images = room.images.filter((url) => url !== imageUrl);
    await room.save();

    res.status(200).json({ success: true, message: 'Image removed', room });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/rooms/upload-image
// @access  Private/Admin
// @desc    Upload a single image to Cloudinary and return the hosted URL
const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      url: req.file.path,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  uploadRoomImages,
  deleteRoomImage,
  uploadSingleImage,
};