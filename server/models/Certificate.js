const mongoose = require('mongoose');
const { Schema } = mongoose;

const CertificateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  serialHash: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  pdfUrl: String, // path to stored certificate PDF
  metadata: { type: Schema.Types.Mixed }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
