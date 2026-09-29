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
      enum: [
        'Single',
        'Double',
        'Triple',
        'Deluxe',
        'Executive Suite',
        'Suite',
        'Presidential Suite',
        'Family Suite',
        'Standard',
      ],
      required: [true, 'Room type is required'],
    },
    pricePerNight: {
      type: Number,
      min: [0, 'Price per night cannot be negative'],
    },
    pricePerMonth: {
      type: Number,
      min: [0, 'Price per month cannot be negative'],
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
    amenities: {
      type: [String],
      default: ['High-speed Wi-Fi', 'Air Conditioning', 'Flat-screen Smart TV', 'Luxury Toiletries', 'Room Service'],
    },
    images: {
      type: [String], // array of hosted image URLs
      default: [],
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Full', 'Unavailable', 'Maintenance'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for single image compatibility
roomSchema.virtual('image').get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

// Pre-save hook to ensure pricePerNight & pricePerMonth stay synchronized
roomSchema.pre('save', function () {
  if (this.pricePerNight && !this.pricePerMonth) {
    this.pricePerMonth = this.pricePerNight * 30;
  } else if (this.pricePerMonth && !this.pricePerNight) {
    this.pricePerNight = Math.round(this.pricePerMonth / 30);
  }
});

module.exports = mongoose.model('Room', roomSchema);