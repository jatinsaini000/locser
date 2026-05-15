const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run("ALTER TABLE bookings ADD COLUMN location TEXT", (err) => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        console.log("Column 'location' already exists.");
      } else {
        console.error("Error adding column:", err.message);
      }
    } else {
      console.log("Column 'location' added successfully to bookings table.");
    }
  });
});

db.close();
