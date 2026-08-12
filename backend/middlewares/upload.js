const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // cloudinary account me folder ka naam
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4"], // apni need ke hisaab se
    public_id: (req, file) => {
      return Date.now() + "-" + Math.round(Math.random() * 1e9);
    },
  },
});

const upload = multer({ storage });

module.exports = upload;