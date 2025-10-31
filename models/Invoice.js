const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_number: DataTypes.STRING,
  business_id: DataTypes.INTEGER,
  customer_id: DataTypes.INTEGER,
  billing_address_id: DataTypes.INTEGER,
  shipping_address_id: DataTypes.INTEGER,
  invoice_date: DataTypes.DATE,
  due_date: DataTypes.DATE,
  place_of_supply: DataTypes.STRING,
  subtotal: { type: DataTypes.FLOAT, defaultValue: 0 },
  cgst_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  sgst_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  igst_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_tax: { type: DataTypes.FLOAT, defaultValue: 0 },
  discount_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  amount_in_words: DataTypes.STRING,
  payment_mode: DataTypes.STRING,
  payment_status: DataTypes.STRING,
  notes: DataTypes.TEXT,
  pdf_path: DataTypes.STRING,
  is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'Invoices',
  underscored: true,
});

module.exports = Invoice;
