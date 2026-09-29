require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const User = require('./models/user');
const Room = require('./models/Room');
const Booking = require('./models/Booking');
const Hotel = require('./models/Hotel');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Wipe all existing collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
      Hotel.deleteMany({}),
    ]);
    console.log('All previous database records removed.');

    // 2. Create Users (Admin & Guest)
    console.log('Seeding user accounts...');
    const adminUser = await User.create({
      name: 'Executive Administrator',
      email: 'admin@hotel.com',
      password: 'admin123',
      role: 'admin',
      phone: '+94 11 234 5678',
    });

    const guestUser = await User.create({
      name: 'Alexander Wright',
      email: 'guest@hotel.com',
      password: 'guest123',
      role: 'guest',
      phone: '+94 77 987 6543',
    });

    console.log(`Created Admin: admin@hotel.com / admin123`);
    console.log(`Created Guest: guest@hotel.com / guest123`);

    // 3. Create Hotel Profile
    console.log('Seeding Hotel profile...');
    const hotel = await Hotel.create({
      name: 'The Grand Azure Palace & Spa',
      tagline: 'Where Timeless Elegance Meets Sublime Luxury',
      description:
        'Nestled along pristine coastal bluffs, The Grand Azure Palace offers an idyllic sanctuary of five-star luxury. Enjoy Michelin-curated gastronomy, a signature hydrothermal wellness spa, private ocean-view cabanas, and bespoke 24/7 butler service.',
      starRating: 5,
      address: '742 Ocean Crest Boulevard',
      city: 'Colombo',
      country: 'Sri Lanka',
      phone: '+94 11 234 5678',
      email: 'concierge@grandazurepalace.com',
      website: 'https://grandazurepalace.com',
      checkInTime: '02:00 PM',
      checkOutTime: '11:00 AM',
      heroImage:
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: [
        {
          name: 'Infinity Pool & Private Cabanas',
          description: 'Oceanfront heated infinity pool with chilled towel and beverage butler service.',
          icon: 'water-outline',
        },
        {
          name: 'Luxe Spa & Hydrothermal Baths',
          description: 'Holistic Ayurvedic therapies, Himalayan salt sauna, and steam grotto.',
          icon: 'sparkles-outline',
        },
        {
          name: 'Signature Fine Dining & Cellar',
          description: 'Michelin-starred culinary creations and sommelier curated international wines.',
          icon: 'restaurant-outline',
        },
        {
          name: '24/7 Royal Concierge & Chauffeur',
          description: 'Private airport transfers, yacht charters, and bespoke local excursions.',
          icon: 'shield-checkmark-outline',
        },
        {
          name: 'Fitness & Yoga Pavilion',
          description: 'State-of-the-art TechnoGym cardio studio and sunrise ocean yoga sessions.',
          icon: 'fitness-outline',
        },
        {
          name: 'Executive Jazz & Cocktail Lounge',
          description: 'Handcrafted signature cocktails, single malts, and live evening acoustic jazz.',
          icon: 'wine-outline',
        },
      ],
      policies: {
        cancellation: 'Complimentary cancellation up to 48 hours prior to your scheduled check-in date.',
        checkInRequirements: 'Government-issued photo identification and security deposit required upon check-in.',
        pets: 'Small pets allowed upon advance request in designated garden ground suites.',
      },
    });

    // 4. Create Curated Hotel Suites
    console.log('Seeding luxury suites...');
    const roomsData = [
      {
        roomNumber: '501',
        roomType: 'Presidential Suite',
        pricePerNight: 45000,
        pricePerMonth: 1350000,
        capacity: 4,
        currentOccupancy: 0,
        description:
          'Our crowning jewel on the top floor with panoramic ocean vistas, private heated infinity plunge pool, dedicated 24/7 butler, and master marble bathroom.',
        amenities: [
          'Private Infinity Plunge Pool',
          'Personal 24/7 Butler',
          'Ocean View Balcony',
          'High-speed Wi-Fi',
          'Jacuzzi & Spa Tub',
          'Espresso & Vintage Bar',
          'Air Conditioning',
          'Flat-screen Smart TV',
        ],
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
        ],
        availabilityStatus: 'Available',
      },
      {
        roomNumber: '402',
        roomType: 'Executive Suite',
        pricePerNight: 28000,
        pricePerMonth: 840000,
        capacity: 3,
        currentOccupancy: 1, // Currently occupied by Alexander
        description:
          'Generous executive living space with bespoke teak furnishings, private ocean-breeze terrace, king-sized pillow-top bedding, and soaking tub.',
        amenities: [
          'Ocean View Balcony',
          'High-speed Wi-Fi',
          'Luxury Toiletries',
          '24/7 Room Service',
          'Air Conditioning',
          'Flat-screen Smart TV',
        ],
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
        ],
        availabilityStatus: 'Available',
      },
      {
        roomNumber: '305',
        roomType: 'Deluxe',
        pricePerNight: 18500,
        pricePerMonth: 555000,
        capacity: 2,
        currentOccupancy: 0,
        description:
          'Serene sanctuary overlooking lush tropical courtyard fountains. Features organic cotton linens, rainfall marble shower, and artisan minibar.',
        amenities: [
          'Tropical Courtyard View',
          'High-speed Wi-Fi',
          'Luxury Toiletries',
          'Air Conditioning',
          'Espresso & Minibar',
        ],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
        ],
        availabilityStatus: 'Available',
      },
      {
        roomNumber: '210',
        roomType: 'Family Suite',
        pricePerNight: 24000,
        pricePerMonth: 720000,
        capacity: 5,
        currentOccupancy: 0,
        description:
          'Crafted for families with two interconnected bedrooms, kids play alcove, twin designer vanities, and direct pathway to the resort pool.',
        amenities: [
          'Interconnecting Bedrooms',
          'Resort Pool Access',
          'High-speed Wi-Fi',
          'Smart TV with Streaming',
          'Luxury Toiletries',
        ],
        images: [
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80',
        ],
        availabilityStatus: 'Available',
      },
      {
        roomNumber: '108',
        roomType: 'Standard',
        pricePerNight: 12500,
        pricePerMonth: 375000,
        capacity: 2,
        currentOccupancy: 0,
        description:
          'Refined room offering five-star elegance with plush queen bedding, executive workstation, and complimentary high-speed connectivity.',
        amenities: [
          'Queen Bed',
          'High-speed Wi-Fi',
          'Work Desk',
          'Air Conditioning',
          'Smart TV',
        ],
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
        ],
        availabilityStatus: 'Available',
      },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`Seeded ${createdRooms.length} luxury hotel suites.`);

    // 5. Create Sample Bookings
    console.log('Seeding sample guest reservations...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const inFourDays = new Date(now);
    inFourDays.setDate(now.getDate() + 4);

    const inSixDays = new Date(now);
    inSixDays.setDate(now.getDate() + 6);

    const inEightDays = new Date(now);
    inEightDays.setDate(now.getDate() + 8);

    await Booking.create([
      {
        userId: guestUser._id,
        roomId: createdRooms[1]._id, // Room 402 (Executive Suite)
        startDate: tomorrow,
        endDate: inFourDays,
        nights: 3,
        guests: 2,
        totalPrice: 28000 * 3,
        specialRequests: 'High floor preferred, complimentary anniversary champagne.',
        status: 'Approved',
      },
      {
        userId: guestUser._id,
        roomId: createdRooms[2]._id, // Room 305 (Deluxe)
        startDate: inSixDays,
        endDate: inEightDays,
        nights: 2,
        guests: 2,
        totalPrice: 18500 * 2,
        specialRequests: 'Late check-in around 8 PM.',
        status: 'Pending',
      },
    ]);

    console.log('Sample reservations seeded (1 Approved, 1 Pending).');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
