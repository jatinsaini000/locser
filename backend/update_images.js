const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const res = await pool.query('SELECT id, title, "imageUrl" FROM services WHERE title ILIKE $1 OR title ILIKE $2', ['%plumb%', '%lawn%']);
    
    for (const row of res.rows) {
      let newUrl = row.imageUrl;
      if (row.title.toLowerCase().includes('plumb')) {
        newUrl = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=1200&auto=format&fit=crop';
      } else if (row.title.toLowerCase().includes('lawn')) {
        newUrl = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&h=600&q=80';
      }
      
      console.log(`Updating ${row.title} with image: ${newUrl}`);
      await pool.query('UPDATE services SET "imageUrl" = $1 WHERE id = $2', [newUrl, row.id]);
    }
    console.log('Update complete');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

run();
