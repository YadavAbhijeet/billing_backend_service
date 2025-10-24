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
  storage: path.join(__dirname, 'database.sqlite'), // SQLite file
  logging: console.log, // optional
});

module.exports = sequelize;
