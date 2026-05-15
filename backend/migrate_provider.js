const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const providerId = "a5aa3e24-dee2-4d7d-8f26-0ee61665078a"; // Jatin's user ID

db.serialize(() => {
  // Add providerId column if it doesn't exist
  db.run("ALTER TABLE services ADD COLUMN providerId TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding column:", err.message);
    } else {
      console.log("Column providerId added or already exists.");
      
      // Update all existing services to be owned by this providerId
      db.run("UPDATE services SET providerId = ?", [providerId], function(err) {
        if (err) {
          console.error("Error updating existing services:", err);
        } else {
          console.log(`Updated ${this.changes} existing services to belong to provider: ${providerId}`);
        }
      });
    }
  });
});

setTimeout(() => db.close(), 1000);
