const { Sequelize } = require('sequelize');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Helper script to create admin user programmatically
// This bypasses the need for manual SQL and handles passwords correctly

async function createAdmin() {
    console.log('Connecting to database...');

    // Use config from environment directly
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        // Define minimal user model just for insertion
        const User = sequelize.define('User', {
            username: { type: Sequelize.STRING, unique: true },
            password: { type: Sequelize.STRING },
            role: { type: Sequelize.STRING },
            is_active: { type: Sequelize.BOOLEAN },
        }, {
            tableName: 'users',
            timestamps: true
        });

        const hashedPassword = await bcrypt.hash('admin123', 10);
        console.log('generated hash:', hashedPassword);

        // Check if exists
        const existing = await User.findOne({ where: { username: 'admin' } });
        if (existing) {
            console.log('⚠️  User "admin" already exists. Updating password...');
            existing.password = hashedPassword;
            existing.is_active = true;
            await existing.save();
            console.log('✅ Password updated to: admin123');
        } else {
            await User.create({
                username: 'admin',
                password: hashedPassword, // admin123
                role: 'admin',
                is_active: true
            });
            console.log('✅ Admin user created successfully.');
            console.log('   Username: admin');
            console.log('   Password: admin123');
        }

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await sequelize.close();
    }
}

createAdmin();
