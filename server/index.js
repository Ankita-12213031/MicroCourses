require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });


// routes (we'll add these files next)
app.use('/api/auth', require('./routes/auth'));

// health
app.get('/api/health', (req,res) => res.json({ ok: true }));

// creator routes
app.use('/api/creator', require('./routes/creator'));

//admin routes
app.use('/api/admin', require('./routes/admin'));

// creator course management
app.use('/api/creator/courses', require('./routes/creatorCourses'));

// creator lesson management
app.use('/api/creator', require('./routes/creatorLessons'));

// public course browsing
app.use('/api/courses', require('./routes/publicCourses'));

// uploads
app.use('/api/uploads', require('./routes/uploads'));

// learning routes
app.use('/api', require('./routes/learn'));






const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
