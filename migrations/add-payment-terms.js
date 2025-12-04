const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: console.log
});

async function addPaymentTermsColumn() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Check if column exists
        const [results] = await sequelize.query("PRAGMA table_info(customers);");
        const hasPaymentTerms = results.some(col => col.name === 'payment_terms');

        if (hasPaymentTerms) {
            console.log('✅ payment_terms column already exists');
        } else {
            console.log('⚙️ Adding payment_terms column...');
            await sequelize.query("ALTER TABLE customers ADD COLUMN payment_terms INTEGER DEFAULT 0;");
            console.log('✅ payment_terms column added successfully');
        }

        console.log('\n✅ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addPaymentTermsColumn();
