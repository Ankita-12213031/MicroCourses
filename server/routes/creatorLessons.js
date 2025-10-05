const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, permit } = require('../middleware/auth');

// Create a lesson under a course
router.post('/:courseId/lessons', auth, permit('creator'), async (req, res) => {
  try {
    const { title, contentUrl, orderNum, durationSeconds } = req.body;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    if (course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    const lesson = new Lesson({
      course: course._id,
      title,
      contentUrl,
      orderNum,
      durationSeconds,
      transcriptStatus: 'pending'
    });

    await lesson.save();
    return res.status(201).json(lesson);
  } catch (err) {
    console.error(err);
    // handle duplicate key error (unique index conflict for course+orderNum)
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'A lesson with that order number already exists for this course', error: err.keyValue });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update lesson (only owner)
router.put('/lessons/:id', auth, permit('creator'), async (req,res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    if (course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    const { title, contentUrl, orderNum, durationSeconds } = req.body;
    if (title) lesson.title = title;
    if (contentUrl) lesson.contentUrl = contentUrl;
    if (durationSeconds) lesson.durationSeconds = durationSeconds;
    if (orderNum !== undefined) lesson.orderNum = orderNum;

    await lesson.save();
    res.json(lesson);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ msg: 'A lesson with that order number already exists for this course', error: err.keyValue });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete lesson (only owner)
router.delete('/lessons/:id', auth, permit('creator'), async (req,res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    if (course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    await lesson.remove();
    res.json({ msg: 'Lesson deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
