const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Estimate = require('./Estimate');
const Product = require('./Product');

const EstimateItem = sequelize.define('EstimateItem', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    estimate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'estimates',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
        },
    },
    product_name: {
        type: DataTypes.STRING(255),
    },
    description: {
        type: DataTypes.TEXT,
    },
    hsn_code: {
        type: DataTypes.STRING(50),
    },
    hsn_sac_code: {
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
        tableName: 'estimate_items',
        timestamps: false,
    });


EstimateItem.associate = (models) => {
    EstimateItem.belongsTo(models.Estimate, {
        foreignKey: 'estimate_id',
        as: 'estimate',
    });
};

module.exports = EstimateItem;
