const express = require('express');
const router = express.Router();
const businessDetailController = require('../controllers/businessDetailController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protect all business detail routes
router.use(authenticateToken);

// Define routes for business details
router.post('/', businessDetailController.createBusinessDetail);
router.get('/', businessDetailController.getAllBusinessDetails);
router.get('/default', businessDetailController.getDefaultBusiness); // Add this before /:id route
router.get('/:id', businessDetailController.getBusinessDetailById);
router.put('/:id', businessDetailController.updateBusinessDetail);
router.delete('/:id', businessDetailController.deleteBusinessDetail);

module.exports = router;
