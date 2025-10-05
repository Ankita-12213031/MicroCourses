const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// List published courses (only public + published)
router.get('/', async (req,res) => {
  const courses = await Course.find({ published: true, visibility: 'public' }).populate('creator','name email');
  res.json(courses);
});

// Course detail (includes lessons if you want)
router.get('/:id', async (req,res) => {
  try {
    const course = await Course.findById(req.params.id).populate('creator','name email');
    if (!course || !course.published || course.visibility !== 'public') return res.status(404).json({ msg: 'Course not found' });

    const lessons = await Lesson.find({ course: course._id }).sort({ orderNum: 1 });
    res.json({ course, lessons });
  } catch(err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
