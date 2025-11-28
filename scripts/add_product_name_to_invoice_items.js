const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adding product_name column to invoice_items table...\n');

db.serialize(() => {
    // Add product_name column
    db.run(`
        ALTER TABLE invoice_items 
        ADD COLUMN product_name VARCHAR(255)
    `, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✅ product_name column already exists');
            } else {
                console.error('❌ Error adding product_name column:', err.message);
            }
        } else {
            console.log('✅ product_name column added successfully');
        }
    });

    // Also add hsn_sac_code if it doesn't exist (hsn_code vs hsn_sac_code mismatch)
    db.run(`
        ALTER TABLE invoice_items 
        ADD COLUMN hsn_sac_code VARCHAR(50)
    `, (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('✅ hsn_sac_code column already exists');
            } else {
                console.error('❌ Error adding hsn_sac_code column:', err.message);
            }
        } else {
            console.log('✅ hsn_sac_code column added successfully');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('❌ Error closing database:', err.message);
    } else {
        console.log('\n✅ Database connection closed');
    }
});
