const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoiceChallan = sequelize.define('InvoiceChallan', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'invoices',
            key: 'id',
        },
    },
    challan_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    challan_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'invoice_challans',
    timestamps: false,
});

module.exports = InvoiceChallan;
