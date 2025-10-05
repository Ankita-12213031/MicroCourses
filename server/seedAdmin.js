require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error(err); process.exit(1); });

async function seedAdmin() {
  const existing = await User.findOne({ email: 'admin@microcourses.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hashed = await bcrypt.hash('Admin@123', 10);
  const admin = new User({
    name: 'Admin User',
    email: 'admin@microcourses.com',
    password: hashed,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin user created: email=admin@microcourses.com password=Admin@123');
  process.exit(0);
}

seedAdmin();
