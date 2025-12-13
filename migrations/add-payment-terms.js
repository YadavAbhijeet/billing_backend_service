'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Check if column exists first to be safe, though usually migrations track state
        // For standard migrations, we just define the change.
        // However, if the table structure is uncertain, describing table is useful.
        // But standard practice: describeTable, then check if key exists.

        const tableDefinition = await queryInterface.describeTable('Customers');

        if (!tableDefinition.payment_terms) {
            await queryInterface.addColumn('Customers', 'payment_terms', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const tableDefinition = await queryInterface.describeTable('Customers');

        if (tableDefinition.payment_terms) {
            await queryInterface.removeColumn('Customers', 'payment_terms');
        }
    }
};
