const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const columns = [
  { name: 'duration', type: 'TEXT' },
  { name: 'includes', type: 'TEXT' },
  { name: 'requirements', type: 'TEXT' }
];

db.serialize(() => {
  columns.forEach(col => {
    db.run(`ALTER TABLE services ADD COLUMN ${col.name} ${col.type}`, (err) => {
      if (err) {
        if (err.message.includes('duplicate column name')) {
          console.log(`Column ${col.name} already exists.`);
        } else {
          console.error(`Error adding ${col.name}:`, err.message);
        }
      } else {
        console.log(`Column ${col.name} added successfully.`);
      }
    });
  });
});

db.close();
