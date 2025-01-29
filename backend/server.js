const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = [
    'NOTIFICATION_TWILIO_ACCOUNT_SID',
    'NOTIFICATION_TWILIO_AUTH_TOKEN',
    'NOTIFICATION_TWILIO_PHONE_NUMBER',
    'MONGODB_URI',
    'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    console.error('Please check your .env file at:', envPath);
    console.error('Make sure these variables are set in your .env file.');
    process.exit(1);
}

// Set default values for optional environment variables
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Log successful configuration (without exposing sensitive data)
console.log('Environment variables loaded successfully from:', envPath);
console.log('Configuration status:', {
    twilio: process.env.NOTIFICATION_TWILIO_ACCOUNT_SID ? 'Configured' : 'Not Configured',
    mongodb: process.env.MONGODB_URI ? 'Configured' : 'Not Configured',
    jwt: process.env.JWT_SECRET ? 'Configured' : 'Not Configured'
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');

// Import models
const Contact = require('./models/Contact');
const User = require('./models/User');
const {
  AmbulanceBooking,
  TransportBooking,
  ConsultationBooking,
  BloodRequest
} = require('./models/Booking');
const {
  BloodDonation,
  BloodInventory,
  BloodCompatibility
} = require('./models/BloodService');

// Import routes
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const emergencyBookingRoutes = require('./routes/emergencyBooking');
const detailedBookingRoutes = require('./routes/detailedBooking');
const driverRoutes = require('./routes/driver');
const twilioWebhookRoutes = require('./routes/twilioWebhook');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - required for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Middleware
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path, req.body);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Test notification page route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-notification.html'));
});

// Mobile notification page route
app.get('/mobile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mobile-notification.html'));
});

// SMS test page route
app.get('/sms-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sms-test.html'));
});

// Mount routes FIRST - before any other routes
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/emergency-booking', emergencyBookingRoutes);
app.use('/api/detailed-booking', detailedBookingRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/twilio', twilioWebhookRoutes);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images only!');
    }
  }
});

// Configure multer for avatar upload
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.userId}-${uniqueSuffix}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  // Start server only after DB connection
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Helper function to format phone number
const formatPhoneNumber = (number) => {
  const cleaned = number.toString().replace(/\D/g, '');
  return cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
};

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to generate unique userId
const generateUniqueUserId = () => {
  return `user_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and message'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create new contact message
    const contactMessage = new Contact({
      name,
      email,
      message
    });

    await contactMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
});

// Service Booking Routes
app.post('/api/bookings/ambulance', authenticateToken, async (req, res) => {
  try {
    const { pickupLocation, dropLocation, patientName, contactNumber, emergencyType, additionalNotes } = req.body;
    const userId = req.user._id;

    const booking = new AmbulanceBooking({
      userId,
      pickupLocation,
      dropLocation,
      patientName,
      contactNumber,
      emergencyType,
      additionalNotes
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Ambulance booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to book ambulance' });
  }
});

app.post('/api/bookings/transport', authenticateToken, async (req, res) => {
  try {
    const { pickupLocation, dropLocation, patientName, contactNumber, scheduleDate, requiresWheelchair, additionalNotes } = req.body;
    const userId = req.user._id;

    const booking = new TransportBooking({
      userId,
      pickupLocation,
      dropLocation,
      patientName,
      contactNumber,
      scheduleDate,
      requiresWheelchair,
      additionalNotes
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Transport booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to book transport' });
  }
});

app.post('/api/bookings/consultation', authenticateToken, async (req, res) => {
  try {
    const { patientName, contactNumber, consultationType, preferredDate, symptoms, additionalNotes } = req.body;
    const userId = req.user._id;

    const booking = new ConsultationBooking({
      userId,
      patientName,
      contactNumber,
      consultationType,
      preferredDate,
      symptoms,
      additionalNotes
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Consultation booking error:', error);
    res.status(500).json({ success: false, error: 'Failed to book consultation' });
  }
});

app.post('/api/bookings/blood-request', authenticateToken, async (req, res) => {
  try {
    const { patientName, bloodType, units, hospital, urgency, contactNumber, additionalNotes } = req.body;
    const userId = req.user._id;

    const request = new BloodRequest({
      userId,
      patientName,
      bloodType,
      units,
      hospital,
      urgency,
      contactNumber,
      additionalNotes
    });

    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    console.error('Blood request error:', error);
    res.status(500).json({ success: false, error: 'Failed to create blood request' });
  }
});

// Get user's bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const [ambulanceBookings, transportBookings, consultationBookings, bloodRequests] = await Promise.all([
      AmbulanceBooking.find({ userId }).sort({ createdAt: -1 }),
      TransportBooking.find({ userId }).sort({ createdAt: -1 }),
      ConsultationBooking.find({ userId }).sort({ createdAt: -1 }),
      BloodRequest.find({ userId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      bookings: {
        ambulance: ambulanceBookings,
        transport: transportBookings,
        consultation: consultationBookings,
        bloodRequests: bloodRequests
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Initialize blood compatibility data
const initializeBloodCompatibility = async () => {
  try {
    const count = await BloodCompatibility.countDocuments();
    if (count === 0) {
      const compatibilityData = [
        {
          bloodType: 'A+',
          canDonateTo: ['A+', 'AB+'],
          canReceiveFrom: ['A+', 'A-', 'O+', 'O-']
        },
        {
          bloodType: 'A-',
          canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
          canReceiveFrom: ['A-', 'O-']
        },
        {
          bloodType: 'B+',
          canDonateTo: ['B+', 'AB+'],
          canReceiveFrom: ['B+', 'B-', 'O+', 'O-']
        },
        {
          bloodType: 'B-',
          canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
          canReceiveFrom: ['B-', 'O-']
        },
        {
          bloodType: 'AB+',
          canDonateTo: ['AB+'],
          canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        {
          bloodType: 'AB-',
          canDonateTo: ['AB+', 'AB-'],
          canReceiveFrom: ['A-', 'B-', 'AB-', 'O-']
        },
        {
          bloodType: 'O+',
          canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
          canReceiveFrom: ['O+', 'O-']
        },
        {
          bloodType: 'O-',
          canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
          canReceiveFrom: ['O-']
        }
      ];

      await BloodCompatibility.insertMany(compatibilityData);
      console.log('Blood compatibility data initialized');
    }
  } catch (error) {
    console.error('Error initializing blood compatibility data:', error);
  }
};

// Initialize blood inventory
const initializeBloodInventory = async () => {
  try {
    const count = await BloodInventory.countDocuments();
    if (count === 0) {
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const inventoryData = bloodTypes.map(type => ({
        bloodType: type,
        units: 0
      }));

      await BloodInventory.insertMany(inventoryData);
      console.log('Blood inventory initialized');
    }
  } catch (error) {
    console.error('Error initializing blood inventory:', error);
  }
};

// Call initialization functions
initializeBloodCompatibility();
initializeBloodInventory();

// Blood Service Routes
app.post('/api/blood-services/donate', authenticateToken, async (req, res) => {
  try {
    const {
      donorName,
      bloodType,
      age,
      weight,
      contactNumber,
      address,
      lastDonationDate,
      medicalConditions,
      medications,
      preferredDate,
      additionalNotes
    } = req.body;

    const donation = new BloodDonation({
      userId: req.user._id,
      donorName,
      bloodType,
      age,
      weight,
      contactNumber,
      address,
      lastDonationDate,
      medicalConditions,
      medications,
      preferredDate,
      additionalNotes
    });

    await donation.save();
    res.json({ success: true, donation });
  } catch (error) {
    console.error('Blood donation registration error:', error);
    res.status(500).json({ success: false, error: 'Failed to register blood donation' });
  }
});

app.get('/api/blood-services/donations', authenticateToken, async (req, res) => {
  try {
    const donations = await BloodDonation.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch donations' });
  }
});

app.get('/api/blood-services/inventory', async (req, res) => {
  try {
    const inventory = await BloodInventory.find().sort({ bloodType: 1 });
    res.json({ success: true, inventory });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch inventory' });
  }
});

app.get('/api/blood-services/compatibility/:bloodType', async (req, res) => {
  try {
    const { bloodType } = req.params;
    const compatibility = await BloodCompatibility.findOne({ bloodType });
    
    if (!compatibility) {
      return res.status(404).json({ success: false, error: 'Blood type not found' });
    }

    res.json({ success: true, compatibility });
  } catch (error) {
    console.error('Get compatibility error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch compatibility data' });
  }
});

app.get('/api/blood-services/compatibility', async (req, res) => {
  try {
    const compatibility = await BloodCompatibility.find();
    res.json({ success: true, compatibility });
  } catch (error) {
    console.error('Get all compatibility error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch compatibility data' });
  }
});

// Profile avatar upload endpoint
app.put('/api/auth/profile/avatar', authenticateToken, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findOne({ userId: req.user.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar path
    user.avatar = '/uploads/' + req.file.filename;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      user: {
        userId: user.userId,
        name: user.name,
        mobileNumber: user.mobileNumber.replace(/^\+91/, ''),
        address: user.address,
        bio: user.bio,
        avatar: user.avatar,
        vehicleInfo: user.vehicleInfo,
        isDriver: user.isDriver,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar'
    });
  }
});

// Error handling middleware - should be last
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});