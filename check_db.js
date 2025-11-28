const { BusinessDetail, Customer } = require('./models');
const sequelize = require('./config/database');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const businesses = await BusinessDetail.findAll();
        console.log('🏢 Businesses:', JSON.stringify(businesses, null, 2));

        const customers = await Customer.findAll();
        console.log('👥 Customers:', JSON.stringify(customers, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
