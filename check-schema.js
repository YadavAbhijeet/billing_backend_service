const sequelize = require('./config/database');

async function checkTableSchema() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(customers);");
        console.log('📊 Columns in customers table:', results.map(r => r.name));

        const [addrResults] = await sequelize.query("PRAGMA table_info(addresses);");
        console.log('📊 Columns in addresses table:', addrResults.map(r => r.name));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkTableSchema();
