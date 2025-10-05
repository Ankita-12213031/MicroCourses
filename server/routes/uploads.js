const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, permit } = require('../middleware/auth');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const upload = multer({ storage });

// Upload media and attach to existing lesson (creator only)
// POST /api/uploads/lessons/:lessonId/media
router.post('/lessons/:lessonId/media', auth, permit('creator'), upload.single('media'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    if (!course) return res.status(403).json({ msg: 'Not allowed' });
    if (course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    // Save local path to contentUrl and set transcriptStatus pending
    lesson.contentUrl = `/uploads/${req.file.filename}`; // serving static files later
    lesson.transcriptStatus = 'pending';
    await lesson.save();

    res.json({ msg: 'File uploaded, transcript job queued', lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
