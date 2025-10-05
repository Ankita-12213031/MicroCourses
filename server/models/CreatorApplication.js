const mongoose = require('mongoose');
const { Schema } = mongoose;
const CreatorApplicationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  bio: String,
  portfolioUrl: String,
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: Date
});
module.exports = mongoose.model('CreatorApplication', CreatorApplicationSchema);
