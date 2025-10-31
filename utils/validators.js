const Joi = require('joi');

// Validation schema for Invoice
const invoiceValidationSchema = Joi.object({
  invoice_number: Joi.string().required(),
  business_id: Joi.number().integer(),  // Made optional since we'll handle default in controller
  customer_id: Joi.number().integer().required(),
  invoice_date: Joi.date().required(),
  due_date: Joi.date().optional(),
  place_of_supply: Joi.string().optional(),
  subtotal: Joi.number().precision(2).optional(),
  cgst_amount: Joi.number().precision(2).optional(),
  sgst_amount: Joi.number().precision(2).optional(),
  igst_amount: Joi.number().precision(2).optional(),
  total_tax: Joi.number().precision(2).optional(),
  discount_amount: Joi.number().precision(2).optional(),
  total_amount: Joi.number().precision(2).required(),
  amount_in_words: Joi.string().optional(),
  payment_mode: Joi.string().optional(),
  payment_status: Joi.string().allow("", null).valid('Pending', 'Paid', 'Partially Paid').default('Pending'),
  notes: Joi.string().optional(),
  template_id: Joi.number().integer().optional(),
  pdf_path: Joi.string().allow("", null).optional(),
  status: Joi.string().optional(),
  discount: Joi.number().precision(2).optional(),
  // tax: Joi.number().precision(2).optional(),
  billing_address_id: Joi.number().integer().optional(),
  shipping_address_id: Joi.number().integer().optional(),
  // contact_person: Joi.string().required(),
  // contact_email: Joi.string().email().allow("", null),
  // contact_phone: Joi.string().allow("", null),
});

// Validation schema for Invoice Items
const invoiceItemValidationSchema = Joi.array().items(
  Joi.object({
    id: Joi.number().integer().allow(null).optional(),
    invoice_id: Joi.number().integer().optional(), // Allow invoice_id as an optional field
    product_id: Joi.number().integer().allow(null),
    product_name: Joi.string().required(),
    quantity: Joi.number().precision(2).required(),
    unit_price: Joi.number().precision(2).required().messages({
      'any.required': 'Unit price is required.',
      'number.base': 'Unit price must be a number.'
    }),
    taxable_value: Joi.number().precision(2).required(),
    cgst_rate: Joi.number().precision(2).optional(),
    sgst_rate: Joi.number().precision(2).optional(),
    igst_rate: Joi.number().precision(2).optional(),
    cgst_amount: Joi.number().precision(2).optional(),
    sgst_amount: Joi.number().precision(2).optional(),
    igst_amount: Joi.number().precision(2).optional(),
    total_amount: Joi.number().precision(2).required(),
    description: Joi.string().optional(),
  // Allow common product/item fields used by frontend
  hsn_sac_code: Joi.string().optional().allow('', null),
  hsn_code: Joi.string().optional().allow('', null),
    unit_type: Joi.string().optional().allow('', null),
    gst_rate: Joi.number().precision(2).optional(),
  })
);

module.exports = {
  invoiceValidationSchema,
  invoiceItemValidationSchema,
};