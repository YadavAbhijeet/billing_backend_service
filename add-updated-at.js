const sequelize = require('./config/database');

async function addUpdatedAtColumn() {
    try {
        console.log('🔄 Adding updated_at column to customers table...');
        await sequelize.query("ALTER TABLE customers ADD COLUMN updated_at DATETIME;");
        console.log('✅ Column updated_at added successfully');

        // Initialize updated_at with created_at values
        await sequelize.query("UPDATE customers SET updated_at = created_at WHERE updated_at IS NULL;");
        console.log('✅ Initialized updated_at with created_at values');

        process.exit(0);
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('⚠️ Column updated_at already exists');
            process.exit(0);
        }
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

addUpdatedAtColumn();
