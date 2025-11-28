const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking invoice_items table structure...\n');

db.all("PRAGMA table_info(invoice_items)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('✅ invoice_items table columns:');
        rows.forEach(row => {
            console.log(`  - ${row.name} (${row.type})`);
        });
    }

    db.close();
});
