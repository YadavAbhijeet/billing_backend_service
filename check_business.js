const { BusinessDetail } = require('./models');
const sequelize = require('./config/database');

async function checkBusiness() {
    try {
        await sequelize.authenticate();
        const business = await BusinessDetail.findByPk(1);
        if (business) {
            console.log('✅ Business ID 1 found:', JSON.stringify(business, null, 2));
        } else {
            console.log('❌ Business ID 1 NOT found!');
            const allBusinesses = await BusinessDetail.findAll();
            console.log('Available Businesses:', JSON.stringify(allBusinesses, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkBusiness();
