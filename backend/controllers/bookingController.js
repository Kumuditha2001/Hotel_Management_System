const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @route   POST /api/bookings
// @access  Private (any logged-in user)
// @desc    Create a new booking request for a room
const createBooking = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'roomId, startDate and endDate are required',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Business logic: block new booking requests if the room is already full
    if (room.availabilityStatus === 'Full') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently full and not accepting new bookings',
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      startDate,
      endDate,
    });

    res.status(201).json({ success: true, message: 'Booking request created', booking });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings
// @access  Private
// @desc    Admin sees all bookings; a regular user sees only their own
const getBookings = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('roomId', 'roomNumber roomType pricePerMonth')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId', 'roomNumber roomType pricePerMonth')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // A regular user can only view their own booking, not anyone else's
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
// @desc    Approve or reject a booking - this is where occupancy gets updated
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // expected: "Approved" or "Rejected"

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This booking has already been ${booking.status.toLowerCase()}`,
      });
    }

    const room = await Room.findById(booking.roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Associated room not found' });
    }

    if (status === 'Approved') {
      // Business logic: approving a booking increases occupancy
      if (room.currentOccupancy >= room.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve: room is already at full capacity',
        });
      }

      room.currentOccupancy += 1;

      // Business logic: flip availability once capacity is reached
      if (room.currentOccupancy >= room.capacity) {
        room.availabilityStatus = 'Full';
      }

      await room.save();
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, message: `Booking ${status.toLowerCase()}`, booking });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/bookings/:id
// @access  Private
// @desc    Cancel a booking - if it was Approved, release the occupied space
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only the owner or an admin can cancel
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Business logic: releasing an approved booking frees up a spot in the room
    if (booking.status === 'Approved') {
      const room = await Room.findById(booking.roomId);
      if (room) {
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        // If the room was Full, it now has space again
        if (room.availabilityStatus === 'Full' && room.currentOccupancy < room.capacity) {
          room.availabilityStatus = 'Available';
        }
        await room.save();
      }
    }

    await booking.deleteOne();

    res.status(200).json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookings, getBookingById, updateBookingStatus, cancelBooking };