const Customer = require('./Customer');
const Address = require('./Address');

// Define the relationship between Customer and Address
Customer.hasMany(Address, {
    foreignKey: 'customerId',
    as: 'addresses'
});

Address.belongsTo(Customer, {
    foreignKey: 'customerId',
    as: 'customer'
});

console.log('✅ Customer-Address associations loaded');
