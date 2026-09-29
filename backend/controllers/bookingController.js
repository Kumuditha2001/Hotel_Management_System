const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Helper to compute nights and price including guest supplement
const computeBookingDetails = (startDate, endDate, room, guestsCount = 1) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const nightlyBaseRate =
    room.pricePerNight ||
    (room.pricePerMonth ? Math.round(room.pricePerMonth / 30) : 0);

  const guests = Math.max(1, Number(guestsCount) || 1);

  // Each additional guest beyond 1 adds an extra guest fee (20% of base rate, min Rs. 2,000)
  const extraGuests = Math.max(0, guests - 1);
  const extraGuestFee = Math.max(2000, Math.round(nightlyBaseRate * 0.2));
  const nightlyTotal = nightlyBaseRate + (extraGuests * extraGuestFee);

  const totalPrice = nights * nightlyTotal;

  return { nights, totalPrice, guests, nightlyRate: nightlyTotal, extraGuestFee };
};

// @route   POST /api/bookings
// @access  Private (any logged-in user)
// @desc    Create a new booking request for a room
const createBooking = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate, guests, specialRequests } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Room, Check-in (startDate) and Check-out (endDate) dates are required',
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.availabilityStatus === 'Full' || room.availabilityStatus === 'Unavailable') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently full or unavailable for reservation',
      });
    }

    const { nights, totalPrice, guests: guestCount } = computeBookingDetails(
      startDate,
      endDate,
      room,
      guests
    );

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      startDate,
      endDate,
      nights,
      guests: guestCount,
      totalPrice,
      specialRequests: specialRequests || '',
      status: 'Pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth images capacity')
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Reservation request created successfully',
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/bookings/:id
// @access  Private (owner only, and only while status is Pending)
// @desc    Update a booking's room and/or dates before it has been approved or rejected
const updateBookingDetails = async (req, res, next) => {
  try {
    const { roomId, startDate, endDate, guests, specialRequests } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This reservation is already ${booking.status.toLowerCase()} and can no longer be edited`,
      });
    }

    let targetRoom = await Room.findById(booking.roomId);
    if (roomId && roomId !== booking.roomId.toString()) {
      const newRoom = await Room.findById(roomId);
      if (!newRoom) {
        return res.status(404).json({ success: false, message: 'Selected room not found' });
      }
      if (newRoom.availabilityStatus === 'Full') {
        return res.status(400).json({
          success: false,
          message: 'The selected room is currently full',
        });
      }
      booking.roomId = roomId;
      targetRoom = newRoom;
    }

    if (startDate) booking.startDate = startDate;
    if (endDate) booking.endDate = endDate;
    if (guests) booking.guests = Number(guests);
    if (specialRequests !== undefined) booking.specialRequests = specialRequests;

    if (targetRoom) {
      const { nights, totalPrice } = computeBookingDetails(
        booking.startDate,
        booking.endDate,
        targetRoom,
        booking.guests
      );
      booking.nights = nights;
      booking.totalPrice = totalPrice;
    }

    await booking.save();
    const populated = await Booking.findById(booking._id)
      .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth images capacity')
      .populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/bookings
// @access  Private
// @desc    Admin sees all bookings; regular guest sees only their own
const getBookings = async (req, res, next) => {
  try {
    const filter = ['admin', 'staff'].includes(req.user.role) ? {} : { userId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth images capacity availabilityStatus')
      .populate('userId', 'name email phone')
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
      .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth images capacity description amenities availabilityStatus')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (!['admin', 'staff'].includes(req.user.role) && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
// @desc    Approve or reject a booking - updates occupancy accordingly
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // expected: "Approved" or "Rejected"

    if (!['Approved', 'Rejected', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid reservation status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const room = await Room.findById(booking.roomId);

    // If changing to Approved
    if (status === 'Approved' && booking.status !== 'Approved') {
      if (room) {
        if (room.currentOccupancy >= room.capacity) {
          return res.status(400).json({
            success: false,
            message: 'Cannot approve: Room is already at full capacity',
          });
        }
        room.currentOccupancy += 1;
        if (room.currentOccupancy >= room.capacity) {
          room.availabilityStatus = 'Full';
        }
        await room.save();
      }
    }

    // If previously Approved and now changed away from Approved
    if (booking.status === 'Approved' && status !== 'Approved') {
      if (room) {
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        if (room.availabilityStatus === 'Full' && room.currentOccupancy < room.capacity) {
          room.availabilityStatus = 'Available';
        }
        await room.save();
      }
    }

    booking.status = status;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth images')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: `Reservation marked as ${status.toLowerCase()}`,
      booking: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/bookings/:id
// @access  Private
// @desc    Cancel reservation - updates status to 'Cancelled' and frees up room capacity
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (!['admin', 'staff'].includes(req.user.role) && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
    }

    // If booking was approved, release room occupancy
    if (booking.status === 'Approved') {
      const room = await Room.findById(booking.roomId);
      if (room) {
        room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
        if (room.availabilityStatus === 'Full' && room.currentOccupancy < room.capacity) {
          room.availabilityStatus = 'Available';
        }
        await room.save();
      }
    }

    const { reason } = req.body || {};
    booking.status = 'Cancelled';
    if (reason) booking.cancellationReason = reason;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  updateBookingDetails,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
};