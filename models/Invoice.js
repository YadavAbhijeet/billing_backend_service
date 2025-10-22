const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BusinessDetail = require('./BusinessDetail');
const Customer = require('./Customer');
const Template = require('./InvoiceTemplate');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_number: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  business_id: {
    type: DataTypes.INTEGER,
    references: {
      model: BusinessDetail,
      key: 'id',
    },
  },
  customer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Customer,
      key: 'id',
    },
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  due_date: {
    type: DataTypes.DATE,
  },
  place_of_supply: {
    type: DataTypes.STRING(100),
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
  },
  cgst_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  sgst_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  igst_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  total_tax: {
    type: DataTypes.DECIMAL(10, 2),
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  amount_in_words: {
    type: DataTypes.STRING(255),
  },
  payment_mode: {
    type: DataTypes.STRING(50),
  },
  payment_status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Partially Paid'),
    defaultValue: 'Pending',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  template_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Template,
      key: 'id',
    },
  },
  pdf_path: {
    type: DataTypes.TEXT,
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
  tableName: 'invoices',
  timestamps: false,
});

module.exports = Invoice;