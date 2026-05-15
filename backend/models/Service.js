const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Custom ID for compatibility
  categoryId: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  providerName: { type: String },
  providerAvatar: { type: String },
  providerRating: { type: Number, default: 0 },
  providerReviewCount: { type: Number, default: 0 },
  providerCertified: { type: Boolean, default: false },
  providerId: { type: String }, // Links to User._id or custom providerId
  duration: { type: String, default: '1 Hour' },
  includes: { type: String },
  requirements: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
