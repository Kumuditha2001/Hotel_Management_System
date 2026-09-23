const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Instead of saving files to local disk, this storage engine uploads
// directly to Cloudinary and gives us back a permanent hosted URL.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hotel-management-rooms', // organizes uploads into a folder on Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 750, crop: 'limit' }], // auto-resize large images
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;