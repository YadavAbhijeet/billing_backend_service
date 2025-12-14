const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create a new payment
router.post('/', paymentController.createPayment);

// Get all payments for a specific invoice
router.get('/invoice/:invoiceId', paymentController.getInvoicePayments);

// Delete a payment
router.delete('/:id', paymentController.deletePayment);




module.exports = router;
