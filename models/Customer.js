const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Address = require('./Address');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  company_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  primary_contact_person: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  primary_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  primary_phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  gstin: {
    type: DataTypes.STRING(20),
  },
  pan_no: {
    type: DataTypes.STRING(15),
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'customers',
  timestamps: false,
});

// Define the relationship with Address model
Customer.hasMany(Address, {
  foreignKey: 'customerId',
  as: 'addresses'
});

Address.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer'
});

module.exports = Customer;