const express = require('express');
const router = express.Router();
const CreatorApplication = require('../models/CreatorApplication');
const User = require('../models/User');
const { auth, permit } = require('../middleware/auth');

// Admin lists pending applications
router.get('/creator_applications', auth, permit('admin'), async (req,res)=>{
  const apps = await CreatorApplication.find({ status: 'pending' }).populate('user','name email');
  res.json(apps);
});

// Admin approves or rejects
router.post('/creator_applications/:id/review', auth, permit('admin'), async (req,res)=>{
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve','reject'].includes(action)) return res.status(400).json({ msg: 'Invalid action' });

    const app = await CreatorApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ msg: 'Application not found' });

    app.status = action === 'approve' ? 'approved' : 'rejected';
    app.reviewedAt = new Date();
    await app.save();

    if(action === 'approve') {
      await User.findByIdAndUpdate(app.user, { role: 'creator' });
    }

    res.json({ msg: `Application ${action}d`, application: app });
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Admin publish course
router.post('/courses/:id/publish', auth, permit('admin'), async (req, res) => {
  try {
    const Course = require('../models/Course');
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    course.published = true;
    course.publishedAt = new Date();
    course.submittedForReview = false;
    course.visibility = 'public';
    await course.save();

    res.json({ msg: 'Course published', course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});



module.exports = router;
