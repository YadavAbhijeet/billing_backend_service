const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function addChallanAndPoDates() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Check if columns already exist
        const tableDescription = await queryInterface.describeTable('invoices');

        if (!tableDescription.challan_date) {
            await queryInterface.addColumn('invoices', 'challan_date', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('✅ Added challan_date column');
        } else {
            console.log('⏭️  challan_date column already exists');
        }

        if (!tableDescription.po_date) {
            await queryInterface.addColumn('invoices', 'po_date', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('✅ Added po_date column');
        } else {
            console.log('⏭️  po_date column already exists');
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addChallanAndPoDates();
