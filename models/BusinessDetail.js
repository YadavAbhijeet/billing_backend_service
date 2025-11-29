const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessDetail = sequelize.define('BusinessDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  business_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  legal_name: {
    type: DataTypes.STRING(150),
  },
  gstin: {
    type: DataTypes.STRING(20),
  },
  pan_no: {
    type: DataTypes.STRING(15),
  },
  cin: {
    type: DataTypes.STRING(30),
  },
  address_line1: {
    type: DataTypes.STRING(255),
  },
  address_line2: {
    type: DataTypes.STRING(255),
  },
  city: {
    type: DataTypes.STRING(100),
  },
  state: {
    type: DataTypes.STRING(100),
  },
  pincode: {
    type: DataTypes.STRING(10),
  },
  email: {
    type: DataTypes.STRING(100),
  },
  phone: {
    type: DataTypes.STRING(15),
  },
  bank_name: {
    type: DataTypes.STRING(100),
  },
  account_number: {
    type: DataTypes.STRING(30),
  },
  ifsc_code: {
    type: DataTypes.STRING(15),
  },
  upi_id: {
    type: DataTypes.STRING(100),
  },
  logo_url: {
    type: DataTypes.TEXT,
  },
  signature_url: {
    type: DataTypes.TEXT,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
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
  tableName: 'business_details',
  timestamps: false,
});

module.exports = BusinessDetail;