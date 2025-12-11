const { Estimate, EstimateItem, Invoice, InvoiceItem, Product, Address, BusinessDetail, Customer } = require('../models');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// Helper function to get default business details
async function getDefaultBusinessId(userId) {
    const business = await BusinessDetail.findOne({
        where: { is_deleted: false, user_id: userId },
        order: [['id', 'ASC']]
    });
    return business ? business.id : null;
}

exports.createEstimate = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const body = req.body || {};
        let estimateDetails = body.estimateDetails || body;
        let estimateItems = body.estimateItems || body.estimate_items || [];

        if (req.user) {
            console.log(`[createEstimate] Creating for user: ${req.user.id}`);
            estimateDetails.user_id = req.user.id;
        } else {
            console.warn("[createEstimate] No user found in request!");
        }

        if (estimateDetails && (estimateDetails.estimateItems || estimateDetails.estimate_items)) {
            estimateItems = estimateDetails.estimateItems || estimateDetails.estimate_items || estimateItems;
            delete estimateDetails.estimateItems;
            delete estimateDetails.estimate_items;
        }

        if (!estimateDetails.business_id) {
            const defaultBusinessId = await getDefaultBusinessId(req.user.id);
            if (!defaultBusinessId) {
                await transaction.rollback();
                return res.status(400).json({
                    error: 'No business details found. Please create a business profile first.'
                });
            }
            estimateDetails.business_id = defaultBusinessId;
        }

        // Create Estimate
        let estimate;
        if (estimateDetails.id) {
            await Estimate.update(estimateDetails, { where: { id: estimateDetails.id }, transaction });
            estimate = await Estimate.findByPk(estimateDetails.id, { transaction });
        } else {
            estimate = await Estimate.create(estimateDetails, { transaction });
        }

        // Process Items
        const processedItems = await Promise.all(
            estimateItems.map(async (item) => {
                if (!item.product_id) {
                    const product = await Product.create(
                        {
                            name: item.product_name,
                            unit_price: parseFloat(item.unit_price) || 0,
                            description: item.description || "",
                            hsn_sac_code: item.hsn_sac_code || item.hsn_code || "",
                            unit_type: item.unit_type || "Nos",
                            gst_rate: parseFloat(item.gst_rate) || 0,
                        },
                        { transaction }
                    );
                    item.product_id = product.id;
                }

                const taxable_value = parseFloat(item.taxable_value) || 0;
                const gst_rate = parseFloat(item.gst_rate) || 0;

                const placeOfSupply = estimateDetails.place_of_supply?.toLowerCase() || "";
                let cgst_amount = 0, sgst_amount = 0, igst_amount = 0;

                if (placeOfSupply === "intrastate") {
                    cgst_amount = (taxable_value * gst_rate) / 200;
                    sgst_amount = (taxable_value * gst_rate) / 200;
                } else {
                    igst_amount = (taxable_value * gst_rate) / 100;
                }

                const total_amount = taxable_value + cgst_amount + sgst_amount + igst_amount;

                return {
                    ...item,
                    estimate_id: estimate.id,
                    taxable_value,
                    gst_rate,
                    cgst_amount,
                    sgst_amount,
                    igst_amount,
                    total_amount,
                };
            })
        );

        // Delete existing items if updating
        if (estimateDetails.id) {
            await EstimateItem.destroy({ where: { estimate_id: estimate.id }, transaction });
        }

        await EstimateItem.bulkCreate(processedItems, { transaction });

        await transaction.commit();
        res.status(201).json({ estimate, estimateItems: processedItems });

    } catch (error) {
        console.error("[createEstimate] Error:", error);
        if (error.name === 'SequelizeValidationError') {
            console.error("[createEstimate] Validation Errors:", error.errors.map(e => e.message));
        }
        await transaction.rollback();
        res.status(400).json({ error: error.message, details: error.errors });
    }
};

exports.getAllEstimates = async (req, res) => {
    try {
        console.log(`[getAllEstimates] Fetching estimates for user: ${req.user.id}`);
        const estimates = await Estimate.findAll({
            where: { is_deleted: false, user_id: req.user.id },
            order: [['updatedAt', 'DESC']],
            include: [
                { model: BusinessDetail, as: 'business' },
                { model: Customer, as: 'customer' }
            ]
        });
        console.log(`[getAllEstimates] Found ${estimates.length} estimates`);
        res.status(200).json(estimates);
    } catch (error) {
        console.error(`[getAllEstimates] Error:`, error);
        res.status(500).json({ error: error.message });
    }
};

exports.getEstimateById = async (req, res) => {
    try {
        const estimate = await Estimate.findOne({
            where: { id: req.params.id, is_deleted: false, user_id: req.user.id },
            include: [
                { model: EstimateItem, as: 'items' },
                { model: Address, as: 'billingAddress' },
                { model: Address, as: 'shippingAddress' },
                { model: Customer, as: 'customer' },
                { model: BusinessDetail, as: 'business' }
            ]
        });
        if (!estimate) return res.status(404).json({ error: 'Estimate not found' });
        res.status(200).json(estimate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateEstimate = async (req, res) => {
    // Ensure ID from params is present in the body for createEstimate to recognize it as an update
    if (req.params.id) {
        req.body.id = req.params.id;
        if (req.body.estimateDetails) {
            req.body.estimateDetails.id = req.params.id;
        }
    }
    return exports.createEstimate(req, res);
};

exports.deleteEstimate = async (req, res) => {
    try {
        const estimate = await Estimate.findOne({ where: { id: req.params.id, is_deleted: false, user_id: req.user.id } });
        if (!estimate) return res.status(404).json({ error: 'Estimate not found' });

        estimate.is_deleted = true;
        await estimate.save();
        res.status(200).json({ message: 'Estimate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.convertToInvoice = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const estimate = await Estimate.findOne({
            where: { id, is_deleted: false, user_id: req.user.id },
            include: [{ model: EstimateItem, as: 'items' }],
            transaction
        });

        if (!estimate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Estimate not found' });
        }

        // Verify Business Exists
        const business = await BusinessDetail.findOne({
            where: { id: estimate.business_id, is_deleted: false },
            transaction
        });

        if (!business) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Business details not found or deleted. Cannot create invoice.' });
        }

        // Generate next invoice number
        const lastInvoice = await Invoice.findOne({
            where: { user_id: req.user.id },
            order: [['createdAt', 'DESC']],
            attributes: ['invoice_number'],
            transaction
        });

        let nextInvoiceNum = 'INV-001'; // Default to INV-001 if no prior invoices
        if (lastInvoice && lastInvoice.invoice_number) {
            const match = lastInvoice.invoice_number.match(/(\d+)$/);
            if (match) {
                const number = parseInt(match[1], 10) + 1;
                const prefix = lastInvoice.invoice_number.replace(match[0], '');
                // Ensure we don't end up with just numbers if prefix is empty
                const safePrefix = prefix || 'INV-';
                nextInvoiceNum = `${safePrefix}${String(number).padStart(match[1].length, '0')}`;
            }
        }

        // Double check uniqueness (simple check)
        const existingInv = await Invoice.findOne({
            where: { invoice_number: nextInvoiceNum, user_id: req.user.id },
            transaction
        });
        if (existingInv) {
            nextInvoiceNum = `${nextInvoiceNum}-${Math.floor(Math.random() * 1000)}`;
        }

        // Create Invoice
        const invoiceData = {
            invoice_number: nextInvoiceNum,
            invoice_date: new Date(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            business_id: estimate.business_id,
            customer_id: estimate.customer_id,
            billing_address_id: estimate.billing_address_id,
            shipping_address_id: estimate.shipping_address_id,
            place_of_supply: estimate.place_of_supply,
            subtotal: parseFloat(estimate.subtotal) || 0,
            cgst_amount: parseFloat(estimate.cgst_amount) || 0,
            sgst_amount: parseFloat(estimate.sgst_amount) || 0,
            igst_amount: parseFloat(estimate.igst_amount) || 0,
            total_tax: parseFloat(estimate.total_tax) || 0,
            total_amount: parseFloat(estimate.total_amount) || 0,
            amount_in_words: estimate.amount_in_words,
            notes: `Converted from Estimate #${estimate.estimate_number}`,
            user_id: estimate.user_id,
            payment_status: 'Pending',
            amount_remaining: parseFloat(estimate.total_amount) || 0
        };

        const invoice = await Invoice.create(invoiceData, { transaction });

        // Create Invoice Items
        if (estimate.items && estimate.items.length > 0) {
            const invoiceItemsData = estimate.items.map(item => ({
                invoice_id: invoice.id,
                product_id: item.product_id,
                product_name: item.product_name,
                description: item.description,
                hsn_sac_code: item.hsn_sac_code,
                unit_type: item.unit_type,
                quantity: parseFloat(item.quantity) || 0,
                unit_price: parseFloat(item.unit_price) || 0,
                gst_rate: parseFloat(item.gst_rate) || 0,
                taxable_value: parseFloat(item.taxable_value) || 0,
                cgst_rate: parseFloat(item.cgst_rate) || 0,
                sgst_rate: parseFloat(item.sgst_rate) || 0,
                igst_rate: parseFloat(item.igst_rate) || 0,
                cgst_amount: parseFloat(item.cgst_amount) || 0,
                sgst_amount: parseFloat(item.sgst_amount) || 0,
                igst_amount: parseFloat(item.igst_amount) || 0,
                total_amount: parseFloat(item.total_amount) || 0
            }));

            await InvoiceItem.bulkCreate(invoiceItemsData, { transaction });
        }

        // Update Estimate Status
        estimate.status = 'Converted';
        await estimate.save({ transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Estimate converted to Invoice successfully', invoiceId: invoice.id });
    } catch (error) {
        console.error("[convertToInvoice] Error:", error);
        if (error.errors) {
            console.error("[convertToInvoice] Validation Errors:", error.errors.map(e => e.message));
        }
        await transaction.rollback();
        // Return 500 but with error message
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
