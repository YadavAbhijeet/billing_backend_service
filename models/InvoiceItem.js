const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Invoice = require('./Invoice');
const Product = require('./Product');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // ✅ required — every item must belong to an invoice
    references: {
      model: 'invoices', // ✅ use table name (not imported model to prevent circular dependency)
      key: 'id',
    },
    onDelete: 'CASCADE', // ✅ when invoice is deleted, delete its items
    onUpdate: 'CASCADE',
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id',
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  hsn_code: {
    type: DataTypes.STRING(50),
  },
  unit_type: {
    type: DataTypes.STRING(50),
  },
  gst_rate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  taxable_value: {
    type: DataTypes.DECIMAL(10, 2),
  },
  cgst_rate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  sgst_rate: {
    type: DataTypes.DECIMAL(5, 2),
  },
  igst_rate: {
    type: DataTypes.DECIMAL(5, 2),
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
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, 

{
  tableName: 'invoice_items',
  timestamps: false,
});


InvoiceItem.associate = (models) => {
  InvoiceItem.belongsTo(models.Invoice, {
    foreignKey: 'invoice_id',
    as: 'invoice',
  });
};

module.exports = InvoiceItem;