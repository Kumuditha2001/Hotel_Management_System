const Hotel = require('../models/Hotel');

// @route   GET /api/hotel
// @access  Public
// @desc    Get hotel details (creates default profile if none exists)
const getHotelDetails = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = await Hotel.create({});
    }
    res.status(200).json({ success: true, hotel });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/hotel
// @access  Private/Admin
// @desc    Update hotel details
const updateHotelDetails = async (req, res, next) => {
  try {
    let hotel = await Hotel.findOne();
    if (!hotel) {
      hotel = new Hotel(req.body);
      await hotel.save();
    } else {
      hotel = await Hotel.findByIdAndUpdate(
        hotel._id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Hotel details updated successfully',
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotelDetails,
  updateHotelDetails,
};
