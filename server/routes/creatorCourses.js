const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, permit } = require('../middleware/auth');

// Create course (draft)
router.post('/', auth, permit('creator'), async (req, res) => {
  try {
    const { title, description, visibility } = req.body;
    const course = new Course({
      creator: req.user.id,
      title,
      description,
      visibility: visibility || 'private'
    });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update course (only owner)
router.put('/:id', auth, permit('creator'), async (req,res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ msg: 'Course not found' });
    if(course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    const { title, description, visibility } = req.body;
    if (title) course.title = title;
    if (description) course.description = description;
    if (visibility) course.visibility = visibility;
    await course.save();
    res.json(course);
  } catch(err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete course (only owner)
router.delete('/:id', auth, permit('creator'), async (req,res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ msg: 'Course not found' });
    if(course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    await course.remove();
    res.json({ msg: 'Course deleted' });
  } catch(err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Submit for review (creator requests admin publish)
router.post('/:id/submit_for_review', auth, permit('creator'), async (req,res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ msg: 'Course not found' });
    if(course.creator.toString() !== req.user.id) return res.status(403).json({ msg: 'Not allowed' });

    course.visibility = 'private'; // keep controlled by admin
    // Optionally set a flag like `submittedForReview: true` (not in schema yet)
    course.submittedForReview = true;
    await course.save();
    res.json({ msg: 'Submitted for review', course });
  } catch(err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
