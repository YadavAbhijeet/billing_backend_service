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
  payment_terms: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // 0 means "Due on Receipt" or "Immediate"
  },
}, {
  tableName: 'customers',
  timestamps: false,
});

module.exports = Customer;