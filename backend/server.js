const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Pool (Supabase)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Supabase in many environments
  }
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to Supabase:', err.message);
  } else {
    console.log('Connected to Supabase PostgreSQL at:', res.rows[0].now);
  }
});

// API: Get Categories
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
    const services = result.rows.map(r => ({
      id: r.id,
      categoryId: r.categoryId,
      title: r.title,
      subtitle: r.subtitle,
      description: r.description,
      price: r.price,
      imageUrl: r.imageUrl,
      provider: {
        id: `p-${r.id}`,
        name: r.providerName,
        avatarUrl: r.providerAvatar,
        rating: r.providerRating,
        reviewCount: r.providerReviewCount,
        isCertified: r.providerCertified
      }
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
    const service = {
      id: row.id,
      categoryId: row.categoryId,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      price: row.price,
      imageUrl: row.imageUrl,
      provider: {
        id: `p-${row.id}`,
        name: row.providerName,
        avatarUrl: row.providerAvatar,
        rating: row.providerRating,
        reviewCount: row.providerReviewCount,
        isCertified: row.providerCertified
      }
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
    res.json({ success: true, bookedSlots: result.rows.map(r => r.timeslot) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create Booking
app.post('/api/bookings', async (req, res) => {
  const { serviceId, userId, bookingDate, timeSlot, totalPrice } = req.body;
  if (!serviceId || !totalPrice || !bookingDate || !timeSlot) {
    return res.status(400).json({ error: "Missing required booking details" });
  }

  try {
    const check = await pool.query(
      "SELECT id FROM bookings WHERE serviceId = $1 AND bookingDate = $2 AND timeSlot = $3 AND status != 'CANCELLED'",
      [serviceId, bookingDate, timeSlot]
    );
    
    if (check.rows.length > 0) return res.status(409).json({ error: "This time slot has already been booked." });

    const result = await pool.query(
      "INSERT INTO bookings (serviceId, userId, bookingDate, timeSlot, totalPrice, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [serviceId, userId || 'guest', bookingDate, timeSlot, totalPrice, 'CONFIRMED']
    );

    res.json({
      success: true,
      data: {
        bookingId: result.rows[0].id,
        status: 'CONFIRMED',
        message: 'Booking confirmed.',
        date: bookingDate,
        time: timeSlot
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Bookings
app.get('/api/bookings', async (req, res) => {
  const targetId = req.query.userId || 'u1';
  try {
    const result = await pool.query(`
      SELECT b.*, s.title, s.providerName, s.imageUrl, s.price 
      FROM bookings b
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE b.userId = $1
      ORDER BY b.createdAt DESC
    `, [targetId]);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Single Booking
app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT b.*, s.title, s.providerName, s.imageUrl, s.price 
      FROM bookings b
      LEFT JOIN services s ON b.serviceId = s.id
      WHERE b.id = $1
    `, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cancel booking
app.put('/api/bookings/:id/cancel', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = $1", [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Booking not found" });
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
