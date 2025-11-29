const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BusinessDetail = require('./BusinessDetail');
const Customer = require('./Customer');
const Template = require('./InvoiceTemplate');
const Address = require('./Address');

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
  challan_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  po_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BusinessDetail,
      key: 'id',
    },
    validate: {
      async isValidBusiness(value) {
        if (!value) throw new Error('Business ID is required');
        const business = await BusinessDetail.findOne({
          where: { id: value, is_deleted: false }
        });
        if (!business) throw new Error('Invalid Business ID');
      }
    }
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
  amount_paid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  amount_remaining: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  billing_address_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Address,
      key: 'id',
    },
    allowNull: true,
  },
  shipping_address_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Address,
      key: 'id',
    },
    allowNull: true,
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'invoices',
  timestamps: false,
  defaultScope: {
    include: [
      {
        model: BusinessDetail,
        as: 'business',
        attributes: [
          'id',
          'business_name',
          'legal_name',
          'gstin',
          'pan_no',
          'cin',
          'email',
          'phone',
          'address_line1',
          'address_line2',
          'city',
          'state',
          'pincode',
          'bank_name',
          'account_number',
          'ifsc_code',
          'upi_id',
          'logo_url',
          'signature_url'
        ]
      }
    ]
  }
});

// Define relationships
Invoice.belongsTo(Customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

Invoice.belongsTo(BusinessDetail, {
  foreignKey: 'business_id',
  as: 'business',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

Invoice.belongsTo(Template, {
  foreignKey: 'template_id',
  as: 'template'
});

Invoice.belongsTo(Address, {
  foreignKey: 'billing_address_id',
  as: 'billingAddress'
});

Invoice.belongsTo(Address, {
  foreignKey: 'shipping_address_id',
  as: 'shippingAddress'
});

// Add hooks to validate business existence
Invoice.beforeCreate(async (invoice, options) => {
  const business = await BusinessDetail.findOne({
    where: { id: invoice.business_id, is_deleted: false }
  });
  if (!business) {
    throw new Error('Business not found or is deleted');
  }
});

Invoice.beforeUpdate(async (invoice, options) => {
  if (invoice.changed('business_id')) {
    const business = await BusinessDetail.findOne({
      where: { id: invoice.business_id, is_deleted: false }
    });
    if (!business) {
      throw new Error('Business not found or is deleted');
    }
  }
});

Invoice.associate = (models) => {
  Invoice.hasMany(models.InvoiceItem, {
    foreignKey: 'invoice_id',
    as: 'items',
    onDelete: 'CASCADE',
    hooks: true,
  });
  Invoice.hasMany(models.Payment, {
    foreignKey: 'invoice_id',
    as: 'payments',
    onDelete: 'CASCADE',
  });
  Invoice.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

module.exports = Invoice;