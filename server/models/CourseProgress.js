const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseProgressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedPercent: { type: Number, default: 0 },
  certificateIssued: { type: Boolean, default: false },
  certificate: { type: Schema.Types.ObjectId, ref: 'Certificate' }
});

CourseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);
