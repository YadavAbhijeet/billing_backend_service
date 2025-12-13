'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if column exists first to be safe, though usually migrations track state

        // Note: Table name must match exactly what is in DB. Usually strictly lowercase 'customers'.
        const tableDefinition = await queryInterface.describeTable('customers');

        if (!tableDefinition.payment_terms) {
            await queryInterface.addColumn('customers', 'payment_terms', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDefinition = await queryInterface.describeTable('customers');

        if (tableDefinition.payment_terms) {
            await queryInterface.removeColumn('customers', 'payment_terms');
        }
    }
};
