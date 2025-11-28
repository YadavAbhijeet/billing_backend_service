const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Adding challan_no and po_no columns to invoices table...');

db.serialize(() => {
    // Add challan_no column
    db.run(`ALTER TABLE invoices ADD COLUMN challan_no VARCHAR(50)`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✅ challan_no column already exists');
            } else {
                console.error('❌ Error adding challan_no:', err.message);
            }
        } else {
            console.log('✅ Added challan_no column');
        }
    });

    // Add po_no column
    db.run(`ALTER TABLE invoices ADD COLUMN po_no VARCHAR(50)`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✅ po_no column already exists');
            } else {
                console.error('❌ Error adding po_no:', err.message);
            }
        } else {
            console.log('✅ Added po_no column');
        }

        // Close database after all operations
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('\n✅ Migration completed successfully!');
            }
        });
    });
});
