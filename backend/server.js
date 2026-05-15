const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const User = require('./models/User');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Category = require('./models/Category');
const Message = require('./models/Message');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/locser';

const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = corsOrigin
  ? { origin: corsOrigin.split(',').map(origin => origin.trim()) }
  : {};

app.use(cors(corsOptions));
app.use(express.json());

/** Stable hero images for services whose DB URLs are missing or no longer load (Unsplash id typos, etc.). */
function resolveServiceImageUrl(title, rawUrl) {
  const t = (title || '').toLowerCase();
  if (t.includes('plumb')) {
    return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1600&auto=format&fit=crop';
  }
  if (t.includes('lawn')) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1600&auto=format&fit=crop';
  }
  const s = rawUrl != null ? String(rawUrl).trim() : '';
  return s || null;
}

// Serve built front‑end (React/Vite) from ./website/dist
app.use(express.static(path.join(__dirname, 'website', 'dist')));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.resolve(__dirname, 'website', 'dist', 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      // In dev, we might not have the build folder yet
      if (NODE_ENV === 'development') return next();
      console.error('Failed to send index.html:', err);
      res.status(500).end();
    }
  });
});

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));


// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// API: Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const newUser = new User({
      fullname: fullName,
      email,
      password_hash: hash,
      role: role || 'consumer'
    });
    
    await newUser.save();
    
    const user = { id: newUser._id, fullname: newUser.fullname, email: newUser.email, role: newUser.role };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullname: user.fullname }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
    
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, fullname: user.fullname }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role, avatar_url: user.avatar_url } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        fullname: name,
        email,
        password_hash: 'google-auth',
        role: 'consumer',
        avatar_url: picture
      });
      await user.save();
    } else {
      // Update avatar if changed
      if (user.avatar_url !== picture) {
        user.avatar_url = picture;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, fullname: user.fullname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, fullname: user.fullname, email: user.email, role: user.role, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('fullname email role avatar_url');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Health Check
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection state
    const dbState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({ status: states[dbState] || 'unknown', env: NODE_ENV });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json({ data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Message/Conversation by ID
app.get('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const message = await Message.findOne({ id });
    if (!message) return res.status(404).json({ error: "Conversation not found" });
    res.json({ data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create a conversation
app.post('/api/messages', async (req, res) => {
  const { id, senderName, senderAvatar, lastMessage, timestamp } = req.body;
  if (!id || !senderName) return res.status(400).json({ error: "Missing required chat details" });

  try {
    let message = await Message.findOne({ id });
    if (!message) {
      message = new Message({
        id,
        senderName,
        senderAvatar,
        lastMessage: lastMessage || 'Chat started',
        timestamp: timestamp || new Date().toISOString(),
        unreadCount: 0,
        isOnline: true
      });
      await message.save();
    }
    res.json({ success: true, data: { id } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete a conversation
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Message.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Conversation not found" });
    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Profile
app.get('/api/profile', async (req, res) => {
  try {
    const user = await User.findOne({ isProvider: true }); // Fallback or mock
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get All Services
app.get('/api/services', async (req, res) => {
  const { categoryId, query: searchQuery } = req.query;
  
  let filter = {};
  
  if (categoryId) {
    filter.categoryId = categoryId;
  }
  
  if (searchQuery) {
    filter.$or = [
      { title: { $regex: searchQuery, $options: 'i' } },
      { description: { $regex: searchQuery, $options: 'i' } },
      { providerName: { $regex: searchQuery, $options: 'i' } }
    ];
  }

  try {
    const services = await Service.find(filter);
    const mappedServices = services.map(s => ({
      id: s.id,
      categoryId: s.categoryId,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      price: s.price,
      imageUrl: resolveServiceImageUrl(s.title, s.imageUrl),
      provider: {
        id: s.providerId || `p-${s.id}`,
        name: s.providerName,
        avatarUrl: s.providerAvatar,
        rating: s.providerRating,
        reviewCount: s.providerReviewCount,
        isCertified: s.providerCertified
      },
      duration: s.duration,
      includes: s.includes,
      requirements: s.requirements
    }));
    res.json({ data: mappedServices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Service by ID
app.get('/api/services/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const s = await Service.findOne({ id });
    if (!s) return res.status(404).json({ error: "Service not found" });
    
    const service = {
      id: s.id,
      categoryId: s.categoryId,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      price: s.price,
      imageUrl: resolveServiceImageUrl(s.title, s.imageUrl),
      provider: {
        id: s.providerId || `p-${s.id}`,
        name: s.providerName,
        avatarUrl: s.providerAvatar,
        rating: s.providerRating,
        reviewCount: s.providerReviewCount,
        isCertified: s.providerCertified
      },
      duration: s.duration,
      includes: s.includes,
      requirements: s.requirements
    };
    res.json({ data: service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get booked slots
app.get('/api/bookings/slots', async (req, res) => {
  const { serviceId, bookingDate } = req.query;
  if (!serviceId || !bookingDate) return res.status(400).json({ error: "Missing serviceId or bookingDate" });

  try {
    const bookings = await Booking.find({ 
      serviceId, 
      bookingDate, 
      status: { $ne: 'CANCELLED' } 
    });
    res.json({ success: true, bookedSlots: bookings.map(b => b.timeSlot) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create Booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  const { serviceId, bookingDate, timeSlot, totalPrice, location } = req.body;
  if (!serviceId || !totalPrice || !bookingDate || !timeSlot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }
  const userId = req.user.id;

  try {
    const existingBooking = await Booking.findOne({
      serviceId,
      bookingDate,
      timeSlot,
      status: { $ne: 'CANCELLED' }
    });
    
    if (existingBooking) return res.status(409).json({ error: "This time slot has already been booked." });

    const newBooking = new Booking({
      serviceId,
      userId,
      bookingDate,
      timeSlot,
      totalPrice,
      status: 'PENDING',
      location: location || 'Not Specified'
    });

    await newBooking.save();

    res.json({
      success: true,
      data: {
        bookingId: newBooking._id,
        status: 'PENDING',
        message: 'Booking request sent.',
        date: bookingDate,
        time: timeSlot,
        location: location || 'Not Specified'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  const targetId = req.user.id;
  const appMode = req.query.mode || 'consumer';
  
  try {
    let bookings;
    if (appMode === 'provider') {
      const services = await Service.find({ providerId: targetId });
      const serviceIds = services.map(s => s.id);
      bookings = await Booking.find({ serviceId: { $in: serviceIds } }).sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ userId: targetId }).sort({ createdAt: -1 });
    }

    const data = await Promise.all(bookings.map(async (b) => {
      const s = await Service.findOne({ id: b.serviceId });
      return {
        ...b.toObject(),
        id: b._id,
        title: s ? s.title : 'Deleted Service',
        providerName: s ? s.providerName : 'Unknown',
        imageUrl: s ? resolveServiceImageUrl(s.title, s.imageUrl) : null,
        price: s ? s.price : 0
      };
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Booking
app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const b = await Booking.findById(id);
    if (!b) return res.status(404).json({ error: "Booking not found" });
    
    const s = await Service.findOne({ id: b.serviceId });
    res.json({ 
      success: true, 
      data: { 
        ...b.toObject(),
        id: b._id,
        title: s ? s.title : 'Deleted Service',
        providerName: s ? s.providerName : 'Unknown',
        imageUrl: s ? resolveServiceImageUrl(s.title, s.imageUrl) : null,
        price: s ? s.price : 0
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  let { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const service = await Service.findOne({ id: booking.serviceId });
    if (!service) return res.status(404).json({ error: "Linked service not found" });

    // Check if the user is either the provider of the service OR the consumer who made the booking
    if (booking.userId !== userId && service.providerId !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    booking.status = status;
    await booking.save();
    
    res.json({ success: true, message: `Booking marked as ${status}` });
  } catch (err) {
    console.error(`Error updating booking ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cancel: backward compatibility for website
app.put('/api/bookings/:id/cancel', async (req, res) => {
  let { id } = req.params;

  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  if (!userId) {
    const bodyUserId = req.body?.userId;
    if (!bodyUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    userId = bodyUserId;
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.userId !== userId) {
      return res.status(403).json({ error: "Forbidden: You don't own this booking" });
    }

    booking.status = 'CANCELLED';
    await booking.save();
    
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(`Error cancelling booking ${id}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Create a new service (Providers only)
app.post('/api/services', authenticateToken, async (req, res) => {
  const { title, categoryId, subtitle, description, price, imageUrl, duration, includes, requirements } = req.body;
  if (!title || !categoryId || !price) {
    return res.status(400).json({ error: "Missing required service details" });
  }

  const id = `s${Date.now()}`;
  const providerId = req.user.id;
  const providerName = req.user.fullname;
  const providerAvatar = req.user.avatar_url || '';

  try {
    const newService = new Service({
      id,
      categoryId,
      title,
      subtitle: subtitle || '',
      description: description || '',
      price,
      imageUrl: imageUrl || '',
      providerName,
      providerAvatar,
      providerRating: 0,
      providerReviewCount: 0,
      providerCertified: false,
      providerId,
      duration: duration || '1 Hour',
      includes: includes || '',
      requirements: requirements || ''
    });

    await newService.save();

    res.json({ success: true, message: "Service listed successfully", data: { id } });
  } catch (err) {
    console.error("Error creating service:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Get Provider Earnings
app.get('/api/provider/earnings', authenticateToken, async (req, res) => {
  const providerId = req.user.id;
  try {
    const services = await Service.find({ providerId });
    const serviceIds = services.map(s => s.id);
    
    const bookings = await Booking.find({ 
      serviceId: { $in: serviceIds }, 
      status: 'COMPLETED' 
    });

    // We need to match titles manually since we don't have SQL Joins
    const detailedBookings = bookings.map(b => {
      const s = services.find(serv => serv.id === b.serviceId);
      return {
        id: b._id,
        title: s ? s.title : 'Deleted Service',
        amount: b.totalPrice,
        date: b.bookingDate
      };
    });

    const totalEarned = detailedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const platformFee = totalEarned * 0.10; // 10% fee
    const tax = totalEarned * 0.05; // 5% tax
    const netEarnings = totalEarned - platformFee - tax;

    res.json({ 
      success: true, 
      data: {
        totalEarned,
        platformFee,
        tax,
        netEarnings,
        bookings: detailedBookings
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get services listed by the logged-in provider
app.get('/api/provider/services', authenticateToken, async (req, res) => {
  const providerId = req.user.id;
  try {
    const services = await Service.find({ providerId });
    const mappedServices = services.map(s => ({
      id: s.id,
      categoryId: s.categoryId,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      price: s.price,
      imageUrl: resolveServiceImageUrl(s.title, s.imageUrl),
      provider: {
        id: providerId,
        name: s.providerName,
        avatarUrl: s.providerAvatar,
        rating: s.providerRating,
        reviewCount: s.providerReviewCount,
        isCertified: s.providerCertified
      },
      duration: s.duration,
      includes: s.includes,
      requirements: s.requirements
    }));
    res.json({ success: true, data: mappedServices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update a service
app.put('/api/services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const providerId = req.user.id;
  const { title, categoryId, subtitle, description, price, imageUrl, duration, includes, requirements } = req.body;

  try {
    const service = await Service.findOne({ id });
    if (!service) return res.status(404).json({ error: "Service not found" });
    
    if (service.providerId !== providerId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this service" });
    }

    service.title = title;
    service.categoryId = categoryId;
    service.subtitle = subtitle;
    service.description = description;
    service.price = price;
    service.imageUrl = imageUrl;
    service.duration = duration;
    service.includes = includes;
    service.requirements = requirements;

    await service.save();

    res.json({ success: true, message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete a service
app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const providerId = req.user.id;

  try {
    const service = await Service.findOne({ id });
    if (!service) return res.status(404).json({ error: "Service not found" });

    if (service.providerId !== providerId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this service" });
    }

    await Service.deleteOne({ id });
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
