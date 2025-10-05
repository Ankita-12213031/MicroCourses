const mongoose = require('mongoose');
const { Schema } = mongoose;
const CourseSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  published: { type: Boolean, default: false },
  visibility: { type: String, enum: ['private','public'], default: 'private' },
  createdAt: { type: Date, default: Date.now },
  submittedForReview: { type: Boolean, default: false }
});
module.exports = mongoose.model('Course', CourseSchema);
