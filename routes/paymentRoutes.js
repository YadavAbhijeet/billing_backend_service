const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create a new payment
router.post('/', paymentController.createPayment);

// Get all payments for a specific invoice
router.get('/invoice/:invoiceId', paymentController.getInvoicePayments);

// Delete a payment
router.delete('/:id', paymentController.deletePayment);

router.post('/', async (req, res, next) => {
    console.log('\n[DEBUG] POST /api/payments called');
    console.log('[DEBUG] Body:', req.body);

    try {
        const { invoiceId, amount, method, paymentDate, reference } = req.body;
        console.log('[DEBUG] Parsed fields:', { invoiceId, amount, method, paymentDate, reference });

        // your existing payment logic...
    } catch (err) {
        console.error('[ERROR] in POST /api/payments:', err);
        next(err);
    }
});


module.exports = router;
