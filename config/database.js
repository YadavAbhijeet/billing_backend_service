// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('billing_service', 'billing_user1', 'billing_user1', {
//   host: 'localhost',
//   dialect: 'postgres',
// });

// module.exports = sequelize;


const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'), // SQLite file in root directory
  logging: false // disable logging for cleaner console output
});

module.exports = sequelize;
