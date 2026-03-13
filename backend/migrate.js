const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
require('dotenv').config();

// REPLACE THIS with your actual connection string or set it in your environment
const supabaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.ihnchqsimkajzaqkirds.supabase.co:5432/postgres';

const sqliteDb = new sqlite3.Database('./database.sqlite');
const pgClient = new Client({
  connectionString: supabaseUrl,
});

async function migrate() {
  try {
    console.log('Connecting to Supabase...');
    await pgClient.connect();
    console.log('Connected to Supabase!');

    // 1. Create Tables
    console.log('Creating tables in Supabase...');
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        categoryId TEXT,
        title TEXT,
        subtitle TEXT,
        description TEXT,
        price INTEGER,
        imageUrl TEXT,
        providerName TEXT,
        providerAvatar TEXT,
        providerRating REAL,
        providerReviewCount INTEGER,
        providerCertified BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        serviceId TEXT,
        userId TEXT,
        bookingDate TEXT,
        timeSlot TEXT,
        totalPrice REAL,
        status TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT,
        icon TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderName TEXT,
        senderAvatar TEXT,
        lastMessage TEXT,
        timestamp TEXT,
        unreadCount INTEGER,
        isOnline BOOLEAN
      );

      CREATE TABLE IF NOT EXISTS profile (
        id TEXT PRIMARY KEY,
        name TEXT,
        location TEXT,
        avatarUrl TEXT,
        isProvider BOOLEAN
      );
    `);

    // 2. Helper to Migrate a Table
    const migrateTable = (tableName, query) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(query, [], async (err, rows) => {
          if (err) return reject(err);
          console.log(`Migrating ${rows.length} rows for ${tableName}...`);
          
          for (const row of rows) {
            const keys = Object.keys(row);
            const values = Object.values(row);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            const columns = keys.join(', ');
            
            try {
              await pgClient.query(
                `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
                values
              );
            } catch (pgErr) {
              console.error(`Error inserting into ${tableName}:`, pgErr.message);
            }
          }
          resolve();
        });
      });
    };

    // 3. Run Migrations
    await migrateTable('categories', 'SELECT * FROM categories');
    await migrateTable('services', 'SELECT * FROM services');
    await migrateTable('messages', 'SELECT * FROM messages');
    await migrateTable('profile', 'SELECT * FROM profile');
    await migrateTable('bookings', 'SELECT * FROM bookings');

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pgClient.end();
    sqliteDb.close();
  }
}

migrate();
