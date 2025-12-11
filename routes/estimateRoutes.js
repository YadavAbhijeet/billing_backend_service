const express = require('express');
const router = express.Router();
const estimateController = require('../controllers/estimateController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', estimateController.createEstimate);
router.get('/', estimateController.getAllEstimates);
router.get('/:id', estimateController.getEstimateById);
router.put('/:id', estimateController.updateEstimate);
router.delete('/:id', estimateController.deleteEstimate);
router.post('/:id/convert', estimateController.convertToInvoice);

module.exports = router;
