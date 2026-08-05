const crypto = require("crypto");
const path = require("path");
const multer = require("multer");

const allowedTypes = {
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${allowedTypes[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes[file.mimetype]) {
      return callback(new Error("Only JPG, PNG, GIF and WEBP images are allowed"));
    }

    return callback(null, true);
  },
});

const handleImageUpload = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) {
      return next();
    }

    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : error.message;

    return res.status(400).json({ message });
  });
};

const uploadPostImage = handleImageUpload("image");
const uploadProfileImage = handleImageUpload("profile_image");

module.exports = uploadPostImage;
module.exports.uploadProfileImage = uploadProfileImage;
