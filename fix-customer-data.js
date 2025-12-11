const { Customer } = require('./models');
const sequelize = require('./config/database');

async function fixCustomerData() {
    try {
        // Find the incomplete customer (ID 4)
        const badCustomer = await Customer.findByPk(4);
        // Find the good customer (ID 6)
        const goodCustomer = await Customer.findByPk(6);

        if (badCustomer && goodCustomer) {
            console.log('Updating Customer 4 with data from Customer 6...');
            badCustomer.gstin = goodCustomer.gstin;
            badCustomer.pan_no = goodCustomer.pan_no;
            await badCustomer.save();
            console.log('✅ Customer 4 updated successfully.');
            console.log('New GSTIN:', badCustomer.gstin);
            console.log('New PAN:', badCustomer.pan_no);
        } else {
            console.log('Could not find both customers.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

fixCustomerData();
