const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Recreating payments table with correct schema...');

db.serialize(() => {
    // Drop existing table
    db.run(`DROP TABLE IF EXISTS payments`, (err) => {
        if (err) {
            console.error('❌ Error dropping payments table:', err.message);
        } else {
            console.log('✅ Dropped old payments table');
        }
    });

    // Create new table with correct schema
    db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_date DATE NOT NULL,
      payment_mode VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer',
      reference_number VARCHAR(100),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_deleted BOOLEAN DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `, (err) => {
        if (err) {
            console.error('❌ Error creating payments table:', err.message);
        } else {
            console.log('✅ Payments table created successfully with correct schema');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('❌ Error closing database:', err.message);
    } else {
        console.log('✅ Database connection closed');
    }
});
