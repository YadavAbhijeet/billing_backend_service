const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Invoice = require('./Invoice');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Invoice,
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    payment_mode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Bank Transfer',
    },
    reference_number: { // Transaction ID, Cheque No, etc.
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Define relationships
Payment.belongsTo(Invoice, {
    foreignKey: 'invoice_id',
    as: 'invoice'
});

module.exports = Payment;
