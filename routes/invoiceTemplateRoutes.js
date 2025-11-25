const express = require('express');
const router = express.Router();
const invoiceTemplateController = require('../controllers/invoiceTemplateController');

// Only for invoice PDF download
router.get('/:id/download', invoiceTemplateController.downloadInvoice);

module.exports = router;
