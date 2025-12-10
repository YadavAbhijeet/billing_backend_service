const { Customer } = require('./models');
const sequelize = require('./config/database');

async function checkCustomer() {
    try {
        const customers = await Customer.findAll({
            where: { company_name: 'Pillai clg' }
        });
        console.log(JSON.stringify(customers, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkCustomer();
