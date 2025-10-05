const mongoose = require('mongoose');
const { Schema } = mongoose;

const LessonProgressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

// each user can track one progress record per lesson
LessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('LessonProgress', LessonProgressSchema);
