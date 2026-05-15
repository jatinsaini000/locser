const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const useLocalDb = process.env.USE_LOCAL_DB === 'true';
const corsOrigin = process.env.CORS_ORIGIN;
const dbSslEnabled = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : NODE_ENV === 'production';

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
const path = require('path');
app.use(express.static(path.join(__dirname, 'website', 'dist')));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next(); // let API routes handle themselves
  const indexPath = path.resolve(__dirname, 'website', 'dist', 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      console.error('Failed to send index.html:', err);
      res.status(500).end();
    }
  });
});

// Database connection setup
let pool;

if (useLocalDb) {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./database.sqlite');
  
  pool = {
    query: (text, params) => {
      // Handle callback-style invocation for test connection
      if (typeof params === 'function') {
        const callback = params;
        if (text === 'SELECT NOW()') {
          return callback(null, { rows: [{ now: new Date().toISOString() }] });
        }
        params = [];
      }
      
      return new Promise((resolve, reject) => {
        let finalText = text.replace(/\$\d+/g, '?').replace(/ILIKE/gi, 'LIKE');
        const isInsertReturning = finalText.includes('RETURNING');
        if (isInsertReturning) {
          finalText = finalText.replace(/RETURNING.*/gi, '');
        }
        
        const isSelect = finalText.trim().toUpperCase().startsWith('SELECT');
        const method = isSelect ? 'all' : 'run';
        
        db[method](finalText, params || [], function(err, rows) {
          if (err) {
            reject(err);
          } else {
            if (method === 'run') {
              resolve({ rows: isInsertReturning ? [{ id: this.lastID }] : [], rowCount: this.changes });
            } else {
              resolve({ rows: rows || [] });
            }
          }
        });
      });
    }
  };
  console.log('Using Local SQLite database.');
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when USE_LOCAL_DB is false.');
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: dbSslEnabled ? { rejectUnauthorized: false } : false
  });
  console.log('Using Remote PostgreSQL database.');
}

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Database:', err.message);
  } else {
    console.log('Database connected at:', res.rows[0].now);
  }
});

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
    const check = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (check.rows.length > 0) return res.status(409).json({ error: 'Email already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newId = crypto.randomUUID();
    
    await pool.query(
      "INSERT INTO users (id, fullname, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
      [newId, fullName, email, hash, role || 'consumer']
    );
    const user = { id: newId, fullname: fullName, email, role: role || 'consumer' };
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
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullname: user.fullname }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, avatar_url: user.avatar_url } });
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
    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;

    if (result.rows.length === 0) {
      // Create new user
      const newId = crypto.randomUUID();
      await pool.query(
        "INSERT INTO users (id, fullname, email, password_hash, role, avatar_url) VALUES ($1, $2, $3, $4, $5, $6)",
        [newId, name, email, 'google-auth', 'consumer', picture]
      );
      user = { id: newId, fullname: name, email, role: 'consumer', avatar_url: picture };
    } else {
      user = result.rows[0];
      // Update avatar if changed
      if (user.avatar_url !== picture) {
        await pool.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [picture, user.id]);
        user.avatar_url = picture;
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullname: user.fullname }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role, avatar_url: user.avatar_url } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, fullname, email, role, avatar_url FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Categories
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', env: NODE_ENV });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Messages
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages");
    res.json({ data: result.rows }); // Boolean handles itself in PG
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Message/Conversation by ID
app.get('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM messages WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Conversation not found" });
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create a conversation
app.post('/api/messages', async (req, res) => {
  const { id, senderName, senderAvatar, lastMessage, timestamp } = req.body;
  if (!id || !senderName) return res.status(400).json({ error: "Missing required chat details" });

  try {
    const check = await pool.query("SELECT id FROM messages WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      await pool.query(
        "INSERT INTO messages (id, senderName, senderAvatar, lastMessage, timestamp, unreadCount, isOnline) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, senderName, senderAvatar, lastMessage || 'Chat started', timestamp || new Date().toISOString(), 0, true]
      );
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
    const result = await pool.query("DELETE FROM messages WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Conversation not found" });
    res.json({ success: true, message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Profile
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profile WHERE id = 'u1'");
    res.json({ data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get All Services
app.get('/api/services', async (req, res) => {
  const { categoryId, query: searchQuery } = req.query;
  
  let queryStr = "SELECT * FROM services";
  let params = [];
  let conditions = [];
  
  if (categoryId) {
    conditions.push("categoryId = $" + (params.length + 1));
    params.push(categoryId);
  }
  
  if (searchQuery) {
    conditions.push("(title ILIKE $" + (params.length + 1) + " OR description ILIKE $" + (params.length + 2) + " OR providerName ILIKE $" + (params.length + 3) + ")");
    const likeQ = `%${searchQuery}%`;
    params.push(likeQ, likeQ, likeQ);
  }

  if (conditions.length > 0) {
    queryStr += " WHERE " + conditions.join(" AND ");
  }

  try {
    const result = await pool.query(queryStr, params);
    const pick = (row, camel, lower) => (row[camel] !== undefined ? row[camel] : row[lower]);
    const services = result.rows.map(r => ({
      id: pick(r, 'id', 'id'),
      categoryId: pick(r, 'categoryId', 'categoryid'),
      title: pick(r, 'title', 'title'),
      subtitle: pick(r, 'subtitle', 'subtitle'),
      description: pick(r, 'description', 'description'),
      price: pick(r, 'price', 'price'),
      imageUrl: resolveServiceImageUrl(pick(r, 'title', 'title'), pick(r, 'imageUrl', 'imageurl')),
      provider: {
        id: `p-${pick(r, 'id', 'id')}`,
        name: pick(r, 'providerName', 'providername'),
        avatarUrl: pick(r, 'providerAvatar', 'provideravatar'),
        rating: pick(r, 'providerRating', 'providerrating'),
        reviewCount: pick(r, 'providerReviewCount', 'providerreviewcount'),
        isCertified: pick(r, 'providerCertified', 'providercertified')
      },
      duration: pick(r, 'duration', 'duration'),
      includes: pick(r, 'includes', 'includes'),
      requirements: pick(r, 'requirements', 'requirements')
    }));
    res.json({ data: services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Service by ID
app.get('/api/services/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    
    const row = result.rows[0];
    const pick = (camel, lower) => (row[camel] !== undefined ? row[camel] : row[lower]);
    const service = {
      id: pick('id', 'id'),
      categoryId: pick('categoryId', 'categoryid'),
      title: pick('title', 'title'),
      subtitle: pick('subtitle', 'subtitle'),
      description: pick('description', 'description'),
      price: pick('price', 'price'),
      imageUrl: resolveServiceImageUrl(pick('title', 'title'), pick('imageUrl', 'imageurl')),
      provider: {
        id: `p-${pick('id', 'id')}`,
        name: pick('providerName', 'providername'),
        avatarUrl: pick('providerAvatar', 'provideravatar'),
        rating: pick('providerRating', 'providerrating'),
        reviewCount: pick('providerReviewCount', 'providerreviewcount'),
        isCertified: pick('providerCertified', 'providercertified')
      },
      duration: pick('duration', 'duration'),
      includes: pick('includes', 'includes'),
      requirements: pick('requirements', 'requirements')
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
    const result = await pool.query(
      "SELECT timeSlot FROM bookings WHERE serviceId = $1 AND bookingDate = $2 AND status != 'CANCELLED'",
      [serviceId, bookingDate]
    );
    res.json({ success: true, bookedSlots: result.rows.map(r => r.timeslot || r.timeSlot) });
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
    const check = await pool.query(
      "SELECT id FROM bookings WHERE serviceId = $1 AND bookingDate = $2 AND timeSlot = $3 AND status != 'CANCELLED'",
      [serviceId, bookingDate, timeSlot]
    );
    
    if (check.rows.length > 0) return res.status(409).json({ error: "This time slot has already been booked." });

    const result = await pool.query(
      "INSERT INTO bookings (serviceId, userId, bookingDate, timeSlot, totalPrice, status, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [serviceId, userId, bookingDate, timeSlot, totalPrice, 'PENDING', location || 'Not Specified']
    );

    res.json({
      success: true,
      data: {
        bookingId: result.rows[0].id,
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
    const whereClause = appMode === 'provider' ? "s.providerId = $1" : "b.userId = $1";
    
    const result = await pool.query(`
      SELECT b.*, s.title, s.providerName, s.imageUrl, s.price 
      FROM bookings b
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE ${whereClause}
      ORDER BY b.createdAt DESC
    `, [targetId]);
    const data = result.rows.map((row) => {
      const title = row.title;
      const rawImg = row.imageUrl !== undefined ? row.imageUrl : row.imageurl;
      return { ...row, imageUrl: resolveServiceImageUrl(title, rawImg) };
    });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Booking
app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
  
  try {
    const result = await pool.query(`
      SELECT b.*, s.title, s.providerName, s.imageUrl, s.price 
      FROM bookings b
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE b.id = $1
    `, [numericId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    const row = result.rows[0];
    const title = row.title;
    const rawImg = row.imageUrl !== undefined ? row.imageUrl : row.imageurl;
    res.json({ success: true, data: { ...row, imageUrl: resolveServiceImageUrl(title, rawImg) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  let { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id;

  try {
    // Check if the user is either the provider of the service OR the consumer who made the booking
    const checkQuery = "SELECT b.id FROM bookings b JOIN services s ON b.serviceId = s.id WHERE b.id = $1 AND (b.userId = $2 OR s.providerId = $2)";
    
    const check = await pool.query(checkQuery, [numericId, userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Booking not found or unauthorized" });

    await pool.query("UPDATE bookings SET status = $1 WHERE id = $2", [status, numericId]);
    res.json({ success: true, message: `Booking marked as ${status}` });
  } catch (err) {
    console.error(`Error updating booking ${numericId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cancel: backward compatibility for website
app.put('/api/bookings/:id/cancel', async (req, res) => {
  let { id } = req.params;

  // Try to parse ID as integer if it's numeric (common for SQLite/PG serials)
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : id;

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
    const owner = await pool.query('SELECT userId FROM bookings WHERE id = $1', [numericId]);
    if (owner.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or you don\'t have permission' });
    }
    const row = owner.rows[0];
    const bookingUserId = row.userId ?? row.userid;
    if (bookingUserId !== bodyUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    userId = bodyUserId;
  }

  try {
    console.log(`Attempting to cancel booking. numericId: ${numericId}, userId: ${userId}, typeId: ${typeof numericId}`);
    const result = await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = $1 AND userId = $2", [numericId, userId]);
    
    console.log('Query result:', JSON.stringify(result));

    if (result.rowCount === 0) {
      console.warn(`Cancellation failed: No row matched for id=${numericId} AND userId=${userId}`);
      // Let's check if the booking even exists regardless of userId
      const exists = await pool.query("SELECT id, userId, status FROM bookings WHERE id = $1", [numericId]);
      console.log('Booking existence check:', JSON.stringify(exists.rows));
      
      return res.status(404).json({ 
        error: "Booking not found or you don't have permission",
        details: exists.rows.length > 0 ? `Owned by ${exists.rows[0].userId}` : "ID does not exist"
      });
    }
    
    console.log(`Successfully cancelled booking: ${numericId}`);
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(`Error cancelling booking ${numericId}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// API: Create a new service (Providers only)
app.post('/api/services', authenticateToken, async (req, res) => {

  const { title, categoryId, subtitle, description, price, imageUrl, duration, includes, requirements } = req.body;
  if (!title || !categoryId || !price) {
    return res.status(400).json({ error: "Missing required service details" });
  }

  // Generate a simple ID
  const id = `s${Date.now()}`;
  const providerId = req.user.id;
  const providerName = req.user.fullname;
  const providerAvatar = req.user.avatar_url || '';

  try {
    await pool.query(
      `INSERT INTO services 
      (id, categoryId, title, subtitle, description, price, imageUrl, providerName, providerAvatar, providerRating, providerReviewCount, providerCertified, providerId, duration, includes, requirements) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [id, categoryId, title, subtitle || '', description || '', price, imageUrl || '', providerName, providerAvatar, 0.0, 0, false, providerId, duration || '1 Hour', includes || '', requirements || '']
    );

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
    const result = await pool.query(`
      SELECT b.id, b.totalPrice as totalprice, b.status, b.bookingDate as bookingdate, s.title 
      FROM bookings b 
      JOIN services s ON b.serviceId = s.id 
      WHERE s.providerId = $1 AND b.status = 'COMPLETED'
    `, [providerId]);

    const bookings = result.rows;
    const totalEarned = bookings.reduce((sum, b) => sum + (b.totalprice || 0), 0);
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
        bookings: bookings.map(b => ({
          id: b.id,
          title: b.title,
          amount: b.totalprice,
          date: b.bookingdate
        }))
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get services listed by the logged-in provider
app.get('/api/provider/services', authenticateToken, async (req, res) => {
  const providerId = req.user.id;
  console.log('Fetching services for providerId:', providerId);
  try {
    const result = await pool.query("SELECT * FROM services WHERE LOWER(providerId) = LOWER($1)", [providerId]);
    console.log(`Found ${result.rows.length} services for provider ${providerId}`);
    const pick = (row, camel, lower) => (row[camel] !== undefined ? row[camel] : row[lower]);
    const services = result.rows.map(r => ({
      id: pick(r, 'id', 'id'),
      categoryId: pick(r, 'categoryId', 'categoryid'),
      title: pick(r, 'title', 'title'),
      subtitle: pick(r, 'subtitle', 'subtitle'),
      description: pick(r, 'description', 'description'),
      price: pick(r, 'price', 'price'),
      imageUrl: resolveServiceImageUrl(pick(r, 'title', 'title'), pick(r, 'imageUrl', 'imageurl')),
      provider: {
        id: providerId,
        name: pick(r, 'providerName', 'providername'),
        avatarUrl: pick(r, 'providerAvatar', 'provideravatar'),
        rating: pick(r, 'providerRating', 'providerrating'),
        reviewCount: pick(r, 'providerReviewCount', 'providerreviewcount'),
        isCertified: pick(r, 'providerCertified', 'providercertified')
      },
      duration: pick(r, 'duration', 'duration'),
      includes: pick(r, 'includes', 'includes'),
      requirements: pick(r, 'requirements', 'requirements')
    }));
    res.json({ success: true, data: services });
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
    const check = await pool.query("SELECT providerId FROM services WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Service not found" });
    
    const serviceOwnerId = check.rows[0].providerId || check.rows[0].providerid;
    if (serviceOwnerId !== providerId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this service" });
    }

    await pool.query(
      `UPDATE services SET 
        title = $1, categoryId = $2, subtitle = $3, description = $4, 
        price = $5, imageUrl = $6, duration = $7, includes = $8, requirements = $9 
      WHERE id = $10`,
      [title, categoryId, subtitle, description, price, imageUrl, duration, includes, requirements, id]
    );

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
    const check = await pool.query("SELECT providerId FROM services WHERE id = $1", [id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Service not found" });

    const serviceOwnerId = check.rows[0].providerId || check.rows[0].providerid;
    if (serviceOwnerId !== providerId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this service" });
    }

    await pool.query("DELETE FROM services WHERE id = $1", [id]);
    res.json({ success: true, message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
