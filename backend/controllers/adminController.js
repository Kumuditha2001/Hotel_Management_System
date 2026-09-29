const User = require('../models/user');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @route   GET /api/admin/dashboard
// @access  Private/Admin
// @desc    Get key business metrics, revenue, occupancy, and booking breakdown
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRooms,
      availableRooms,
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      cancelledBookings,
      totalStaff,
      totalGuests,
      recentBookings,
    ] = await Promise.all([
      Room.countDocuments(),
      Room.countDocuments({ availabilityStatus: 'Available' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Approved' }),
      Booking.countDocuments({ status: 'Rejected' }),
      Booking.countDocuments({ status: 'Cancelled' }),
      User.countDocuments({ role: { $in: ['admin', 'staff'] } }),
      User.countDocuments({ role: { $in: ['guest', 'student'] } }),
      Booking.find()
        .populate('roomId', 'roomNumber roomType pricePerNight pricePerMonth')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    // Calculate revenue from approved bookings
    const approvedList = await Booking.find({ status: 'Approved' }).populate('roomId');
    let totalRevenue = 0;
    approvedList.forEach((b) => {
      if (b.totalPrice && b.totalPrice > 0) {
        totalRevenue += b.totalPrice;
      } else if (b.roomId) {
        const nightly = b.roomId.pricePerNight || (b.roomId.pricePerMonth ? Math.round(b.roomId.pricePerMonth / 30) : 0);
        const nights = b.nights || 1;
        totalRevenue += nightly * nights;
      }
    });

    const occupiedRooms = totalRooms - availableRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalRooms,
        availableRooms,
        occupiedRooms,
        occupancyRate,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        cancelledBookings,
        totalStaff,
        totalGuests,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/staff
// @access  Private/Admin
// @desc    Get all staff & admin team members
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'staff'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/admin/staff
// @access  Private/Admin
// @desc    Create a new staff or admin user
const createStaffMember = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'staff';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: `${assignedRole === 'admin' ? 'Admin' : 'Staff member'} created successfully`,
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/admin/staff/:id
// @access  Private/Admin
// @desc    Remove a staff member
const deleteStaffMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Protect against deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the only remaining admin in the system',
        });
      }
    }

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'Team member removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/staff/:id/role
// @access  Private/Admin
// @desc    Update team member role (staff <-> admin)
const updateStaffRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'staff', 'guest'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own admin rights' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStaffList,
  createStaffMember,
  deleteStaffMember,
  updateStaffRole,
};
