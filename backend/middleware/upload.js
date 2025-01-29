const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `avatar-${req.user.userId}-${uniqueSuffix}${ext}`;
    // Delete any existing avatars for this user
    const userAvatarPattern = new RegExp(`^avatar-${req.user.userId}-.*`);
    fs.readdir(uploadDir, (err, files) => {
      if (!err) {
        files.forEach(file => {
          if (userAvatarPattern.test(file)) {
            fs.unlink(path.join(uploadDir, file), err => {
              if (err) console.error('Error deleting old avatar:', err);
            });
          }
        });
      }
    });
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (validTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and GIF files are allowed!'), false);
  }
};

// Create multer instance with configuration
const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Export configured multer middleware
module.exports = multerUpload;
