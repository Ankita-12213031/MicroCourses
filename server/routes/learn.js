const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const LessonProgress = require('../models/LessonProgress');
const CourseProgress = require('../models/CourseProgress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');
const crypto = require('crypto');
const { auth, permit } = require('../middleware/auth');

// Enroll in a course
// POST /api/courses/:id/enroll
router.post('/courses/:id/enroll', auth, permit('learner','creator'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.published || course.visibility !== 'public') return res.status(404).json({ msg: 'Course not found or not public' });

    const enrollment = new Enrollment({ user: req.user.id, course: course._id });
    await enrollment.save();

    // ensure courseProgress record exists
    await CourseProgress.findOneAndUpdate(
      { user: req.user.id, course: course._id },
      { $setOnInsert: { user: req.user.id, course: course._id, completedPercent: 0, certificateIssued: false } },
      { upsert: true }
    );

    res.status(201).json({ msg: 'Enrolled', enrollment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({ msg: 'Already enrolled' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Mark lesson complete
// POST /api/lessons/:lessonId/complete
router.post('/lessons/:lessonId/complete', auth, permit('learner','creator'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found' });

    const course = await Course.findById(lesson.course);
    // check enrollment
    const EnrollmentModel = require('../models/Enrollment');
    const enrolled = await EnrollmentModel.findOne({ user: req.user.id, course: course._id });
    if (!enrolled) return res.status(403).json({ msg: 'Not enrolled in this course' });

    // upsert lesson progress
    const lp = await LessonProgress.findOneAndUpdate(
      { user: req.user.id, lesson: lesson._id },
      { completed: true, completedAt: new Date() },
      { upsert: true, new: true }
    );

    // recalc course progress
    const totalLessons = await Lesson.countDocuments({ course: course._id });
    const completedCount = await LessonProgress.countDocuments({ user: req.user.id, lesson: { $in: (await Lesson.find({ course: course._id })).map(l => l._id) }, completed: true });

    const percent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

    const cp = await CourseProgress.findOneAndUpdate(
      { user: req.user.id, course: course._id },
      { completedPercent: percent },
      { upsert: true, new: true }
    );

    // if 100% and certificate not issued, issue
    if (percent === 100 && !cp.certificateIssued) {
      const cert = await issueCertificateIfEligible(req.user.id, course._id);
      if (cert) {
        cp.certificateIssued = true;
        cp.certificate = cert._id;
        await cp.save();
      }
    }

    res.json({ msg: 'Lesson marked complete', lessonProgress: lp, courseProgress: cp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get course progress
// GET /api/courses/:id/progress
router.get('/courses/:id/progress', auth, permit('learner','creator','admin'), async (req, res) => {
  try {
    const cp = await CourseProgress.findOne({ user: req.user.id, course: req.params.id }).populate('certificate');
    if (!cp) return res.json({ completedPercent: 0, certificate: null });
    res.json(cp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

/**
 * Helper: Issue certificate if eligible.
 * - Creates Certificate doc with serial HMAC and placeholder pdfUrl.
 * - Returns certificate document or null.
 */
async function issueCertificateIfEligible(userId, courseId) {
  const CourseProgressModel = require('../models/CourseProgress');
  const LessonModel = require('../models/Lesson');
  const CertificateModel = require('../models/Certificate');

  // recalc to be safe
  const totalLessons = await LessonModel.countDocuments({ course: courseId });
  const completedCount = await require('../models/LessonProgress').countDocuments({ user: userId, lesson: { $in: (await LessonModel.find({ course: courseId })).map(l => l._id) }, completed: true });
  const percent = totalLessons === 0 ? 0 : Math.round((completedCount / totalLessons) * 100);

  if (percent !== 100) return null;

  // check existing
  const existing = await CertificateModel.findOne({ user: userId, course: courseId });
  if (existing) return existing;

  // generate serial hash
  const issuedAt = new Date().toISOString();
  const secret = process.env.CERT_SECRET || 'replace_cert_secret';
  const h = crypto.createHmac('sha256', secret).update(`${userId}|${courseId}|${issuedAt}`).digest('hex');
  const serial = `${h.slice(0,8)}-${h.slice(8,16)}-${h.slice(16,24)}`;

  // stub pdf generation: in production render HTML -> PDF, upload to S3, set pdfUrl
  const pdfUrl = `https://example.com/certificates/${serial}.pdf`; // placeholder

  const cert = new CertificateModel({
    user: userId,
    course: courseId,
    serialHash: serial,
    issuedAt: new Date(),
    pdfUrl,
    metadata: { issuedAt }
  });
  await cert.save();

  return cert;
}
