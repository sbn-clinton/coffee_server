// config/multer.js
import multer from "multer";
import path from "path";

// Allowed image types
const allowedTypes = /jpeg|jpg|png|gif/;

const fileFilter = (req, file, cb) => {
  const isMimeValid = allowedTypes.test(file.mimetype);
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (isMimeValid && isExtValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Use memory storage to get image buffer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
