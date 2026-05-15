const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fullname TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'consumer',
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Also update existing tables if they need foreign keys or updates for user linking
    // For now, bookings has userId TEXT. We'll leave it as TEXT since we might use UUID strings.
    // Ensure the users table is created.
    console.log('Users table created or already exists.');
  } catch (err) {
    console.error('Error setting up DB:', err);
  } finally {
    pool.end();
  }
}

setup();
