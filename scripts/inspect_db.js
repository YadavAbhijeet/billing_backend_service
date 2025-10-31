const sequelize = require('../config/database');
const Address = require('../models/Address');
const Customer = require('../models/Customer');

(async () => {
  try {
    const addrs = await Address.findAll({ raw: true });
    const custs = await Customer.findAll({ include: [{ model: Address, as: 'addresses', required: false }], raw: false });
    console.log('ADDRESSES:', JSON.stringify(addrs, null, 2));
    console.log('CUSTOMERS:', JSON.stringify(custs.map(c=>c.toJSON()), null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();