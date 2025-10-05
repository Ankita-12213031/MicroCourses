const mongoose = require('mongoose');
const { Schema } = mongoose;

const LessonSchema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  contentUrl: String,
  orderNum: { type: Number, required: true },
  durationSeconds: Number,
  transcript: String,
  transcriptStatus: { type: String, enum: ['pending','processing','ready','failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// unique order per course
LessonSchema.index({ course: 1, orderNum: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', LessonSchema);
