const multer = require('multer');
const path = require('path');
const { uploadsDir } = require('../config/storage');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only! Upload files with extension jpg, jpeg, png, webp, or gif.'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
