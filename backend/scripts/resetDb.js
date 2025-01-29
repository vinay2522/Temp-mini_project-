const mongoose = require('mongoose');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test');
    console.log('Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop all collections
    for (let collection of collections) {
      try {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      } catch (error) {
        console.log(`Error dropping collection ${collection.collectionName}:`, error.message);
      }
    }

    // Drop all indexes
    for (let collection of collections) {
      try {
        await collection.dropIndexes();
        console.log(`Dropped indexes for collection: ${collection.collectionName}`);
      } catch (error) {
        console.log(`Error dropping indexes for ${collection.collectionName}:`, error.message);
      }
    }

    console.log('Database reset complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetDatabase();
