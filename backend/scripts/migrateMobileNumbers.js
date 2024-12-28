const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seva-drive', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('../models/User');

const migrateMobileNumbers = async () => {
    try {
        // Get all users
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate`);

        for (const user of users) {
            // Get the current mobile number
            const currentNumber = user.mobileNumber;
            
            // Remove any existing prefix and clean the number
            const cleanNumber = currentNumber.replace(/^(\+91|91)/, '').replace(/\D/g, '');
            
            // Add the +91 prefix
            const newNumber = `+91${cleanNumber}`;
            
            // Update the user's mobile number
            if (currentNumber !== newNumber) {
                console.log(`Migrating ${currentNumber} to ${newNumber}`);
                user.mobileNumber = newNumber;
                await user.save();
            }
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateMobileNumbers();
