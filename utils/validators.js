const Joi = require('joi');

// Validation schema for Invoice
const invoiceValidationSchema = Joi.object({
    id: Joi.number().integer().optional(),
    invoice_number: Joi.string().allow('', null).optional(), // ✅ Made optional
    challan_no: Joi.string().allow('', null).optional(),
    challans: Joi.array().items(Joi.object({
        challan_no: Joi.string().allow('', null).optional(),
        challan_date: Joi.date().allow(null, '').optional(),
    })).optional(),
    po_no: Joi.string().allow('', null).optional(),
    challan_date: Joi.date().allow(null, '').optional(),
    po_date: Joi.date().allow(null, '').optional(),
    business_id: Joi.number().integer().optional(), // can be auto-handled in controller
    customer_id: Joi.number().integer().required(),
    invoice_date: Joi.date().required(),
    due_date: Joi.date().allow(null, '').optional(), // ✅ Allow null
    place_of_supply: Joi.string().allow('', null).optional(),

    subtotal: Joi.number().optional(),
    cgst_amount: Joi.number().allow(0, null).optional(),
    sgst_amount: Joi.number().allow(0, null).optional(),
    igst_amount: Joi.number().allow(0, null).optional(),
    total_tax: Joi.number().optional(),

    discount_amount: Joi.number().optional(),
    discount: Joi.number().allow(null, 0).optional(), // ✅ already correct
    tax: Joi.number().optional(),
    total_amount: Joi.number().required(),
    round_off_amount: Joi.number().optional(),

    amount_in_words: Joi.string().allow('', null).optional(),
    payment_mode: Joi.string().allow("", null).optional(),
    payment_status: Joi.string().allow("", null)
        .valid('Pending', 'Paid', 'Partially Paid', 'Overdue')
        .default('Pending'),
    amount_paid: Joi.number().min(0).optional(),
    amount_remaining: Joi.number().min(0).optional(),
    notes: Joi.string().allow('', null).optional(),
    template_id: Joi.number().integer().allow(null).optional(),
    pdf_path: Joi.string().allow("", null).optional(),
    status: Joi.string().optional(),

    billing_address_id: Joi.number().integer().allow(null).optional(),
    shipping_address_id: Joi.number().integer().allow(null).optional(),

    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
    deleted_at: Joi.date().optional(),
    is_deleted: Joi.boolean().optional(),

    business: Joi.object().optional(),
    customer: Joi.object().optional(),
    items: Joi.array().optional(),
    billingAddress: Joi.object().allow(null).optional(),
    shippingAddress: Joi.object().allow(null).optional(),

    // Additional optional frontend fields
    product_name: Joi.string().optional().allow("", null),
    contact_person: Joi.string().optional(),
    contact_email: Joi.string().email().allow("", null),
    contact_phone: Joi.string().allow("", null),
});

// Validation schema for Invoice Items
const invoiceItemValidationSchema = Joi.array().items(
    Joi.object({
        id: Joi.number().integer().allow(null).optional(),
        invoice_id: Joi.number().integer().optional(), // Allow invoice_id as an optional field
        product_id: Joi.number().integer().allow(null).optional(), // ✅ Made optional
        product_name: Joi.string().required(),
        quantity: Joi.number().required(),
        unit_price: Joi.number().required(),
        taxable_value: Joi.number().required(),
        cgst_rate: Joi.number().allow(0, null).optional(),
        sgst_rate: Joi.number().allow(0, null).optional(),
        igst_rate: Joi.number().allow(0, null).optional(),
        cgst_amount: Joi.number().allow(0, null).optional(),
        sgst_amount: Joi.number().allow(0, null).optional(),
        igst_amount: Joi.number().allow(0, null).optional(),
        total_amount: Joi.number().allow(0).required(),
        description: Joi.string().allow("", null).optional(),

        discount: Joi.number().allow(null, 0).optional(),
        // Allow common product/item fields used by frontend
        hsn_sac_code: Joi.string().optional().allow('', null),
        hsn_code: Joi.string().optional().allow('', null),
        unit_type: Joi.string().optional().allow('', null),
        gst_rate: Joi.number().allow(0, null).optional(),
        is_deleted: Joi.boolean().optional(),
    })
);

module.exports = {
    invoiceValidationSchema,
    invoiceItemValidationSchema,
};