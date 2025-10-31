const express = require('express');
const router = express.Router();
const businessDetailController = require('../controllers/businessDetailController');

// Define routes for business details
router.post('/', businessDetailController.createBusinessDetail);
router.get('/', businessDetailController.getAllBusinessDetails);
router.get('/default', businessDetailController.getDefaultBusiness); // Add this before /:id route
router.get('/:id', businessDetailController.getBusinessDetailById);
router.put('/:id', businessDetailController.updateBusinessDetail);
router.delete('/:id', businessDetailController.deleteBusinessDetail);

module.exports = router;
