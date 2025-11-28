const bcrypt = require('bcryptjs');
const { User } = require('../models');
const sequelize = require('../config/database');

// Import models to ensure they are registered
require('../models/User');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const username = 'admin';
        const password = 'adminpassword';

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username,
            password: hashedPassword,
            role: 'admin'
        });

        console.log(`Admin user created.\nUsername: ${username}\nPassword: ${password}`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
