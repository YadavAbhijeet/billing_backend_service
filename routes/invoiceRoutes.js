const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Define routes for invoices
router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);
router.get('/:id/download', invoiceController.downloadInvoice);

module.exports = router;