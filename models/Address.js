const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Customers',
      key: 'id',
    },
  },
  address_type: {
    type: DataTypes.ENUM('billing', 'shipping'),
    allowNull: false,
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  contact_email: {
    type: DataTypes.STRING(100),
  },
  contact_phone: {
    type: DataTypes.STRING(15),
  },
  company_name: {
    type: DataTypes.STRING(150),
  },
  street_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'India',
  },
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  is_default: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  is_deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

Address.associate = (models) => {
  Address.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer'
  });
};

module.exports = Address;