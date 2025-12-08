const sequelize = require('./config/database');

async function checkAddressSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(addresses);");
        console.log('📊 Columns in addresses table:');
        results.forEach(r => console.log(` - ${r.name} (${r.type})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAddressSchema();
