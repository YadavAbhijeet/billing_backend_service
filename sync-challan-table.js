const sequelize = require('./config/database');
const InvoiceChallan = require('./models/InvoiceChallan');

async function createChallanTable() {
    try {
        console.log('🔄 Syncing InvoiceChallan table...');
        await InvoiceChallan.sync({ alter: true });
        console.log('✅ InvoiceChallan table created/updated successfully');

        // Test query to verify
        const count = await InvoiceChallan.count();
        console.log(`📊 Current challan count: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createChallanTable();
