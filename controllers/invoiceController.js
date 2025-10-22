const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem'); // Import InvoiceItem model
const Product = require('../models/Product'); // Import Product model
const generateInvoice = require('../utils/invoiceGenerator');
const path = require('path');
const { invoiceValidationSchema, invoiceItemValidationSchema } = require('../utils/validators');
const sequelize = require('../config/database'); // Remove destructuring
const { where } = require('sequelize');

exports.createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { invoiceDetails, invoiceItems } = req.body;

    // Validate invoiceDetails
    const { error: invoiceError } = invoiceValidationSchema.validate(invoiceDetails);
    if (invoiceError) return res.status(400).json({ error: invoiceError.details[0].message });

    // Validate invoiceItems
    const { error: itemsError } = invoiceItemValidationSchema.validate(invoiceItems);
    if (itemsError) return res.status(400).json({ error: itemsError.details[0].message });

    // Create or update the invoice
    let invoice;
    if (invoiceDetails.id) {
      // Update existing invoice
      await Invoice.update(invoiceDetails, { where: { id: invoiceDetails.id }, transaction });
      invoice = await Invoice.findByPk(invoiceDetails.id, { transaction });
    } else {
      // Create new invoice
      invoice = await Invoice.create(invoiceDetails, { transaction });
    }

    // Process invoice items
    const processedItems = await Promise.all(invoiceItems.map(async (item) => {
      if (!item.product_id) {
        // Create the product if product_id is missing
        const product = await Product.create({
          name: item.product_name,
          unit_price: item.unit_price,
          description: item.description || '',
          hsn_sac_code: item.hsn_sac_code || '',
          unit_type: item.unit_type || 'Nos',
          gst_rate: item.gst_rate || 0,
        }, { transaction });
        item.product_id = product.id; // Assign the new product ID
      }
      return {
        ...item,
        invoice_id: invoice.id,
        cgst_amount: (item.taxable_value * item.cgst_rate) / 100,
        sgst_amount: (item.taxable_value * item.sgst_rate) / 100,
        igst_amount: (item.taxable_value * item.igst_rate) / 100,
        total_amount: item.taxable_value + (item.taxable_value * item.cgst_rate) / 100 + (item.taxable_value * item.sgst_rate) / 100 + (item.taxable_value * item.igst_rate) / 100,
      };
    }));

    // Delete existing items if updating
    if (invoiceDetails.id) {
      await InvoiceItem.destroy({ where: { invoice_id: invoice.id }, transaction });
    }

    // Create new invoice items
    await InvoiceItem.bulkCreate(processedItems, { transaction });

    await transaction.commit();
    res.status(201).json({ invoice, invoiceItems: processedItems });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ where: { is_deleted: false } });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: InvoiceItem,
          as: 'items',
        },
      ],
    }, { where: { is_deleted: false } });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { invoiceDetails, invoiceItems } = req.body;
    console.log('Updating invoice with details:', invoiceDetails);
    console.log('Updating invoice with items:', invoiceItems);
    console.log('Invoice ID from params:', req.params.id);


    // Validate invoiceDetails
    const { error: invoiceError } = invoiceValidationSchema.validate(invoiceDetails);
    if (invoiceError) return res.status(400).json({ error: invoiceError.details[0].message });

    // Validate invoiceItems
    const { error: itemsError } = invoiceItemValidationSchema.validate(invoiceItems);
    if (itemsError) return res.status(400).json({ error: itemsError.details[0].message });

    // Update the invoice
    const [updated] = await Invoice.update(invoiceDetails, { where: { id: req.params.id, is_deleted: false }, transaction });
    if (!updated) return res.status(404).json({ error: 'Invoice not found' });

    // Delete existing invoice items
    await InvoiceItem.destroy({ where: { invoice_id: req.params.id, is_deleted: false }, transaction });

    // Process and create new invoice items
    const processedItems = await Promise.all(invoiceItems.map(async (item) => {
      if (!item.product_id) { 
        // Create the product if product_id is missing
        const product = await Product.create({
          name: item.product_name,
          unit_price: item.unit_price,
          description: item.description || '',
          hsn_sac_code: item.hsn_sac_code || '',
          unit_type: item.unit_type || 'Nos',
          gst_rate: item.gst_rate || 0,
        }, { transaction });
        item.product_id = product.id; // Assign the new product ID
      }
      return {
        ...item,
        invoice_id: req.params.id,
        cgst_amount: (item.taxable_value * item.cgst_rate) / 100,
        sgst_amount: (item.taxable_value * item.sgst_rate) / 100,
        igst_amount: (item.taxable_value * item.igst_rate) / 100,
        total_amount: item.taxable_value + (item.taxable_value * item.cgst_rate) / 100 + (item.taxable_value * item.sgst_rate) / 100 + (item.taxable_value * item.igst_rate) / 100,
      };
    }));

    await InvoiceItem.bulkCreate(processedItems, { transaction });

    await transaction.commit();
    const updatedInvoice = await Invoice.findByPk(req.params.id, { where: { is_deleted: false } });
    res.status(200).json({ invoice: updatedInvoice, invoiceItems: processedItems });
  } catch (error) {
    console.error(error);
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, { where: { is_deleted: false } });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Set is_deleted flag to true for soft delete
    invoice.is_deleted = true;
    await invoice.save();

    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id, { where: { is_deleted: false } }).populate('customer products template businessDetails');
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const outputPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generateInvoice(invoice, invoice.template.content, outputPath);

    res.download(outputPath, `invoice_${invoice._id}.pdf`, (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to download invoice' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};