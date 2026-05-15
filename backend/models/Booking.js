const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  userId: { type: String, required: true },
  bookingDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  location: { type: String, default: 'Not Specified' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
