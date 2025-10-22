const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('billing_service', 'billing_user1', 'billing_user1', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;