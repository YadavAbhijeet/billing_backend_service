'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check if user exists first to match robust migration style
        const users = await queryInterface.sequelize.query(
            `SELECT id FROM users WHERE username = 'admin'`,
            { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        if (users.length === 0) {
            await queryInterface.bulkInsert('users', [{
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }]);
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('users', { username: 'admin' }, {});
    }
};
