require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = require('./models');

async function verifySchema() {
    console.log('🔍 Verifying Database Schema...');

    try {
        // 1. Connection Test
        await db.sequelize.authenticate();
        console.log('✅ Database Connection Successful.');

        // 2. Migration Status
        // We can't easily check migration table programmatically without using the CLI internal functions, 
        // but we can check the actual existing tables.

        const queryInterface = db.sequelize.getQueryInterface();
        const allTables = await queryInterface.showAllTables();

        console.log(`\n📊 Found ${allTables.length} tables in database:`);
        allTables.forEach(t => console.log(` - ${t}`));

        // 3. Model vs Table Verification
        console.log('\n🕵️  Checking Models against Tables...');

        // Get all model names
        const modelNames = Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize');

        for (const modelName of modelNames) {
            const model = db[modelName];
            const tableName = model.getTableName();

            // Sequelize tableName might return an object {schema, tableName} in Postgres sometimes
            const actualTableName = (typeof tableName === 'object') ? tableName.tableName : tableName;

            if (allTables.includes(actualTableName)) {
                // Table exists, check columns
                const tableDesc = await queryInterface.describeTable(actualTableName);
                const dbColumns = Object.keys(tableDesc);
                const modelAttributes = Object.keys(model.rawAttributes);

                console.log(`\n✅ Model: ${modelName} -> Table: ${actualTableName}`);
                console.log(`   Columns in DB: ${dbColumns.length} | Defined in Model: ${modelAttributes.length}`);

                // Optional: Check strictly for missing columns
                const missingInDb = modelAttributes.filter(col => !dbColumns.includes(col));
                if (missingInDb.length > 0) {
                    console.warn(`   ⚠️  WARNING: Columns defined in model but MISSING in DB: ${missingInDb.join(', ')}`);
                } else {
                    // Check if payment_terms exists specifically for Customers since we just migrated it
                    if (modelName === 'Customer') {
                        if (dbColumns.includes('payment_terms')) {
                            console.log(`   ✨ Verified 'payment_terms' column exists.`);
                        } else {
                            console.error(`   ❌ ERROR: 'payment_terms' column MISSING in Customers table!`);
                        }
                    }
                }

            } else {
                console.error(`❌ Model: ${modelName} defined but Table '${actualTableName}' NOT FOUND in DB.`);
            }
        }

        console.log('\n🏁 Verification Complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    }
}

verifySchema();
