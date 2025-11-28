const { Address } = require('./models');
const sequelize = require('./config/database');

async function checkAddress() {
    try {
        await sequelize.authenticate();
        const address = await Address.findByPk(18);
        if (address) {
            console.log('✅ Address 18 found:', JSON.stringify(address, null, 2));
            if (address.customerId === 9) {
                console.log('✅ Address 18 belongs to Customer 9');
            } else {
                console.log(`❌ Address 18 belongs to Customer ${address.customerId}, NOT Customer 9!`);
            }
        } else {
            console.log('❌ Address 18 NOT found!');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkAddress();
