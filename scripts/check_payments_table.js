const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking payments table structure...\n');

db.all("SELECT sql FROM sqlite_master WHERE type='table' AND name='payments'", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else if (rows.length === 0) {
        console.log('❌ Payments table does NOT exist!');
    } else {
        console.log('✅ Payments table exists:');
        console.log(rows[0].sql);
    }

    db.close();
});
