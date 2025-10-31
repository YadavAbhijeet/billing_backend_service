const BusinessDetail = require('../models/BusinessDetail');

exports.createBusinessDetail = async (req, res) => {
  try {
    const businessDetail = await BusinessDetail.create(req.body);
    res.status(201).json(businessDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllBusinessDetails = async (req, res) => {
  try {
    const businessDetails = await BusinessDetail.findAll({ where: { is_deleted: false } });
    res.status(200).json(businessDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBusinessDetailById = async (req, res) => {
  try {
    const businessDetail = await BusinessDetail.findOne({ where: { id: req.params.id, is_deleted: false } });
    if (!businessDetail) return res.status(404).json({ error: 'Business detail not found' });
    res.status(200).json(businessDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBusinessDetail = async (req, res) => {
  try {
    const [updated] = await BusinessDetail.update(req.body, { where: { id: req.params.id, is_deleted: false } });
    if (!updated) return res.status(404).json({ error: 'Business detail not found' });
    const updatedBusinessDetail = await BusinessDetail.findByPk(req.params.id, { where: { is_deleted: false } });
    res.status(200).json(updatedBusinessDetail);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBusinessDetail = async (req, res) => {
  try {
    const business = await BusinessDetail.findByPk(req.params.id, { where: { is_deleted: false } });
    if (!business) return res.status(404).json({ error: 'Business detail not found' });

    // Set is_deleted flag to true for soft delete
    business.is_deleted = true;
    await business.save();
    res.status(200).json({ message: 'Business detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get default business details
exports.getDefaultBusiness = async (req, res) => {
  try {
    const business = await BusinessDetail.findOne({
      where: { is_deleted: false },
      order: [['id', 'ASC']]
    });
    
    if (!business) {
      return res.status(404).json({ 
        error: 'No business details found. Please create a business profile first.' 
      });
    }
    
    res.status(200).json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};