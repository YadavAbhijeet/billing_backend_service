const Joi = require('joi');

// Validation schema for Invoice
const invoiceValidationSchema = Joi.object({
  invoice_number: Joi.string().required(),
  business_id: Joi.number().integer().required(),
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
  payment_status: Joi.string().valid('Pending', 'Paid', 'Partially Paid').default('Pending'),
  notes: Joi.string().optional(),
  template_id: Joi.number().integer().optional(),
  pdf_path: Joi.string().optional(),
  status: Joi.string().optional(),
  discount: Joi.number().precision(2).optional(),
  tax: Joi.number().precision(2).optional(),
});

// Validation schema for Invoice Items
const invoiceItemValidationSchema = Joi.array().items(
  Joi.object({
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
  })
);

module.exports = {
  invoiceValidationSchema,
  invoiceItemValidationSchema,
};