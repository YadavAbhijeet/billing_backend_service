const { Address } = require('./models');
const sequelize = require('./config/database');

async function checkAddress() {
    try {
        await sequelize.authenticate();
        const address = await Address.findByPk(10);
        if (address) {
            console.log('✅ Address 10 found:', JSON.stringify(address, null, 2));
            if (address.customerId === 5) {
                console.log('✅ Address 10 belongs to Customer 5');
            } else {
                console.log(`❌ Address 10 belongs to Customer ${address.customerId}, NOT Customer 5!`);
            }
        } else {
            console.log('❌ Address 10 NOT found!');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkAddress();
