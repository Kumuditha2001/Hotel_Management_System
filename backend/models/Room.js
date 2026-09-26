const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
    },
    roomType: {
      type: String,
      enum: ['Single', 'Double', 'Triple'],
      required: [true, 'Room type is required'],
    },
    pricePerMonth: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    currentOccupancy: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String], // array of Cloudinary URLs, supports multiple photos per room
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Full', 'Unavailable'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);