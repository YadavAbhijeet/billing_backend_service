const sequelize = require('./config/database');
const InvoicePO = require('./models/InvoicePO');

async function syncInvoicePOTable() {
    try {
        console.log('🔄 Syncing InvoicePO table...');
        await InvoicePO.sync({ force: true }); // Create table
        console.log('✅ InvoicePO table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

syncInvoicePOTable();
