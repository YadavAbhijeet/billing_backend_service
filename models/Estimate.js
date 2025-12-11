const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BusinessDetail = require('./BusinessDetail');
const Customer = require('./Customer');
const Template = require('./InvoiceTemplate');
const Address = require('./Address');

const Estimate = sequelize.define('Estimate', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    estimate_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
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
    estimate_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    valid_until: {
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
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    amount_in_words: {
        type: DataTypes.STRING(255),
    },
    status: {
        type: DataTypes.ENUM('Draft', 'Sent', 'Accepted', 'Rejected', 'Converted'),
        defaultValue: 'Draft',
    },
    notes: {
        type: DataTypes.TEXT,
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
    tableName: 'estimates',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['estimate_number', 'user_id']
        }
    ],
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
Estimate.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
});

Estimate.belongsTo(BusinessDetail, {
    foreignKey: 'business_id',
    as: 'business',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Estimate.belongsTo(Template, {
    foreignKey: 'template_id',
    as: 'template'
});

Estimate.belongsTo(Address, {
    foreignKey: 'billing_address_id',
    as: 'billingAddress'
});

Estimate.belongsTo(Address, {
    foreignKey: 'shipping_address_id',
    as: 'shippingAddress'
});

// Add hooks to validate business existence
Estimate.beforeCreate(async (estimate, options) => {
    const business = await BusinessDetail.findOne({
        where: { id: estimate.business_id, is_deleted: false }
    });
    if (!business) {
        throw new Error('Business not found or is deleted');
    }
});

Estimate.beforeUpdate(async (estimate, options) => {
    if (estimate.changed('business_id')) {
        const business = await BusinessDetail.findOne({
            where: { id: estimate.business_id, is_deleted: false }
        });
        if (!business) {
            throw new Error('Business not found or is deleted');
        }
    }
});

Estimate.associate = (models) => {
    Estimate.hasMany(models.EstimateItem, {
        foreignKey: 'estimate_id',
        as: 'items',
        onDelete: 'CASCADE',
        hooks: true,
    });
    Estimate.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
    });
};

module.exports = Estimate;
