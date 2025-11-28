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

router.post('/', async (req, res, next) => {
  console.log('\n[DEBUG] POST /api/invoices called');
  console.log('[DEBUG] Body:', req.body);

  try {
    const { customerId, invoiceDate, dueDate, items, notes } = req.body;
    console.log('[DEBUG] Parsed fields:', { customerId, invoiceDate, dueDate, items, notes });

    // your existing validation + create logic...
  } catch (err) {
    console.error('[ERROR] in POST /api/invoices:', err);
    next(err); // will be caught by the global error handler above
  }
});



module.exports = router;