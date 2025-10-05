const express = require('express');
const router = express.Router();
const CreatorApplication = require('../models/CreatorApplication');
const { auth, permit } = require('../middleware/auth');

// Creator applies
router.post('/apply', auth, permit('learner'), async (req, res) => {
  try {
    const { bio, portfolioUrl } = req.body;
    // check if already applied or is creator
    const existing = await CreatorApplication.findOne({ user: req.user.id });
    if (existing) return res.status(400).json({ msg: 'You have already applied' });

    const app = new CreatorApplication({
      user: req.user.id,
      bio,
      portfolioUrl
    });

    await app.save();
    res.status(201).json({ msg: 'Application submitted', application: app });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
