const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'The Grand Azure Palace & Spa',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Where Timeless Elegance Meets Sublime Luxury',
      trim: true,
    },
    description: {
      type: String,
      default:
        'Nestled amidst breathtaking panoramic views, The Grand Azure Palace offers an unparalleled five-star sanctuary. Experience bespoke hospitality, Michelin-inspired dining, a world-class wellness spa, and elegantly curated suites designed for discerning travelers.',
      trim: true,
    },
    starRating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    address: {
      type: String,
      default: '742 Ocean Crest Boulevard, Coastal Bay',
      trim: true,
    },
    city: {
      type: String,
      default: 'Colombo',
      trim: true,
    },
    country: {
      type: String,
      default: 'Sri Lanka',
      trim: true,
    },
    phone: {
      type: String,
      default: '+94 11 234 5678',
      trim: true,
    },
    email: {
      type: String,
      default: 'concierge@grandazurepalace.com',
      trim: true,
    },
    website: {
      type: String,
      default: 'https://grandazurepalace.com',
      trim: true,
    },
    checkInTime: {
      type: String,
      default: '02:00 PM',
    },
    checkOutTime: {
      type: String,
      default: '11:00 AM',
    },
    heroImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    },
    gallery: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      ],
    },
    amenities: {
      type: [
        {
          name: String,
          description: String,
          icon: String,
        },
      ],
      default: [
        {
          name: 'Infinity Pool & Cabanas',
          description: 'Heated oceanfront pool with private butler cabana service.',
          icon: 'water-outline',
        },
        {
          name: 'Luxe Spa & Thermal Baths',
          description: 'Holistic treatments, sauna, steam room, and hydrotherapy.',
          icon: 'sparkles-outline',
        },
        {
          name: 'Signature Fine Dining',
          description: 'Contemporary culinary experiences led by award-winning chefs.',
          icon: 'restaurant-outline',
        },
        {
          name: '24/7 Royal Concierge',
          description: 'Personalized excursion planning, chauffeur, and room service.',
          icon: 'shield-checkmark-outline',
        },
        {
          name: 'Fitness & Wellness Studio',
          description: 'State-of-the-art TechnoGym equipment and yoga pavilion.',
          icon: 'fitness-outline',
        },
        {
          name: 'Executive Cocktail Lounge',
          description: 'Sunset cocktails, vintage cellar, and live jazz performances.',
          icon: 'wine-outline',
        },
      ],
    },
    policies: {
      cancellation: {
        type: String,
        default: 'Free cancellation up to 48 hours prior to check-in date.',
      },
      checkInRequirements: {
        type: String,
        default: 'Government-issued photo identification and credit card required at check-in.',
      },
      pets: {
        type: String,
        default: 'Pets permitted upon prior request in designated garden suites.',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hotel', hotelSchema);
