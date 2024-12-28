const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/seva-drive');
    
    // Find user
    const user = await User.findOne({ mobileNumber: '+918147938224' }).select('+password');
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('\nUser details:', {
      id: user._id,
      mobileNumber: user.mobileNumber,
      hasPassword: !!user.password,
      passwordHash: user.password,
      isVerified: user.isVerified
    });

    // Create new user with known password
    const password = 'vinayswathi';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update user
    user.password = hash;
    await user.save();
    console.log('\nUpdated password hash:', hash);

    // Test password
    const isMatch = await bcrypt.compare(password, hash);
    console.log('\nPassword verification:', isMatch ? 'PASSED' : 'FAILED');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkUser();
