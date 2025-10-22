const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  contact_person: {
    type: DataTypes.STRING(100),
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  billing_address: {
    type: DataTypes.TEXT,
  },
  shipping_address: {
    type: DataTypes.TEXT,
  },
  gstin: {
    type: DataTypes.STRING(20),
  },
  pan_no: {
    type: DataTypes.STRING(15),
  },
  state: {
    type: DataTypes.STRING(100),
  },
  pincode: {
    type: DataTypes.STRING(10),
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

module.exports = Customer;