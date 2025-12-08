const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InvoicePO = sequelize.define('InvoicePO', {
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
    po_no: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    po_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'invoice_pos',
    timestamps: false,
});

module.exports = InvoicePO;
