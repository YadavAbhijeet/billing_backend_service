const express = require('express');
const router = express.Router();
const invoiceTemplateController = require('../controllers/invoiceTemplateController');

// Create a new invoice template
router.post('/', invoiceTemplateController.createInvoiceTemplate);

// Get all invoice templates
router.get('/', invoiceTemplateController.getAllInvoiceTemplates);

// Get a single invoice template by ID
router.get('/:id', invoiceTemplateController.getInvoiceTemplateById);

// Update an invoice template by ID
router.put('/:id', invoiceTemplateController.updateInvoiceTemplate);

// Delete an invoice template by ID
router.delete('/:id', invoiceTemplateController.deleteInvoiceTemplate);

module.exports = router;