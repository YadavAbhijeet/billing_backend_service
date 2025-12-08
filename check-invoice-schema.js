const sequelize = require('./config/database');

async function checkInvoiceSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(invoices);");
        console.log('📊 Columns in invoices table:');
        results.forEach(r => console.log(` - ${r.name} (${r.type})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkInvoiceSchema();
