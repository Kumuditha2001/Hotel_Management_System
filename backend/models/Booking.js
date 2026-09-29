const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date / Check-in is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date / Check-out is required'],
    },
    nights: {
      type: Number,
      default: 1,
      min: 1,
    },
    guests: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    specialRequests: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
      default: 'Pending',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);