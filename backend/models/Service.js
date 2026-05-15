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
  requirements: { type: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [76.7794, 30.7333] } // Default to Chandigarh
  }
}, { timestamps: true });

ServiceSchema.index({ location: '2dsphere' });
ServiceSchema.index({ title: 'text', description: 'text', providerName: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);
