'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.addColumn('customers', 'payment_terms', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: true
            });
        } catch (error) {
            // Ignore if column already exists
            if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
                console.log('⚠️  Column payment_terms already exists. Skipping.');
            }
            // If table doesn't exist, try capitalized 'Customers'
            else if (error.message.includes('relation "customers" does not exist')) {
                console.log('⚠️  Table "customers" not found. Trying "Customers"...');
                try {
                    await queryInterface.addColumn('Customers', 'payment_terms', {
                        type: Sequelize.INTEGER,
                        defaultValue: 0,
                        allowNull: true
                    });
                } catch (innerError) {
                    if (innerError.message.includes('already exists') || innerError.message.includes('duplicate column')) {
                        console.log('⚠️  Column payment_terms already exists in Customers. Skipping.');
                    } else {
                        throw innerError;
                    }
                }
            } else {
                console.error('Migration Error:', error);
                throw error;
            }
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDefinition = await queryInterface.describeTable('customers');

        if (tableDefinition.payment_terms) {
            await queryInterface.removeColumn('customers', 'payment_terms');
        }
    }
};
