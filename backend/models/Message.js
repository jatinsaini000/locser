const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  senderName: { type: String },
  senderAvatar: { type: String },
  lastMessage: { type: String },
  timestamp: { type: String },
  unreadCount: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false }
});

module.exports = mongoose.model('Message', MessageSchema);
