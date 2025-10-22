const InvoiceTemplate = require('../models/InvoiceTemplate');

exports.createInvoiceTemplate = async (req, res) => {
  try {
    const invoiceTemplate = await InvoiceTemplate.create(req.body);
    res.status(201).json(invoiceTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllInvoiceTemplates = async (req, res) => {
  try {
    const invoiceTemplates = await InvoiceTemplate.findAll({ where: { is_deleted: false } });
    res.status(200).json(invoiceTemplates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceTemplateById = async (req, res) => {
  try {
    const invoiceTemplate = await InvoiceTemplate.findOne({ where: { id: req.params.id, is_deleted: false } });
    if (!invoiceTemplate) return res.status(404).json({ error: 'Invoice template not found' });
    res.status(200).json(invoiceTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoiceTemplate = async (req, res) => {
  try {
    const [updated] = await InvoiceTemplate.update(req.body, { where: { id: req.params.id, is_deleted: false } });
    if (!updated) return res.status(404).json({ error: 'Invoice template not found' });
    const updatedInvoiceTemplate = await InvoiceTemplate.findByPk(req.params.id, { where: { is_deleted: false } });
    res.status(200).json(updatedInvoiceTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInvoiceTemplate = async (req, res) => {
  try {
    const invoiceTemplate = await InvoiceTemplate.findByPk(req.params.id, { where: { is_deleted: false } });
    if (!invoiceTemplate) return res.status(404).json({ error: 'Invoice template not found' });

    // Set is_deleted flag to true for soft delete
    invoiceTemplate.is_deleted = true;
    await invoiceTemplate.save();

    res.status(200).json({ message: 'Invoice template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};