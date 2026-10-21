require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];

if (!email) {
  console.log('\nUsage: node makeAdmin.js <user-email>\nExample: node makeAdmin.js admin@college.edu\n');
  process.exit(1);
}

const promoteUser = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_lost_found';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB...');

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();

    console.log(`\nSUCCESS: User "${user.name}" (${user.email}) has been promoted to Administrator!\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user to admin:', error.message);
    process.exit(1);
  }
};

promoteUser();
