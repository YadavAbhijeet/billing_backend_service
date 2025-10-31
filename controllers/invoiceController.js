const Invoice = require('../models/Invoice');
const InvoiceItem = require('../models/InvoiceItem');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Customer = require('../models/Customer');
const BusinessDetail = require('../models/BusinessDetail');
const generateInvoice = require('../utils/invoiceGenerator');
const path = require('path');
const { invoiceValidationSchema, invoiceItemValidationSchema } = require('../utils/validators');
const sequelize = require('../config/database');
const { where, Op } = require('sequelize');

// Helper function to get default business details
async function getDefaultBusinessId() {
  const business = await BusinessDetail.findOne({
    where: { is_deleted: false },
    order: [['id', 'ASC']]
  });
  return business ? business.id : null;
}

exports.createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Support two request shapes:
    // 1) { invoiceDetails: {...}, invoiceItems: [...] }
    // 2) flat body where invoice fields are sent at root and invoiceItems is provided
    const body = req.body || {};
    let invoiceDetails = body.invoiceDetails || body;
    let invoiceItems = body.invoiceItems || body.invoice_items || [];

    // Defensive: if invoiceDetails was the whole body but contains invoiceItems/invoice_items key, extract it
    if (invoiceDetails && (invoiceDetails.invoiceItems || invoiceDetails.invoice_items)) {
      invoiceItems = invoiceDetails.invoiceItems || invoiceDetails.invoice_items || invoiceItems;
      delete invoiceDetails.invoiceItems;
      delete invoiceDetails.invoice_items;
    }

    // Log incoming payload shape to help debug validation issues
    console.log('createInvoice - resolved invoiceDetails:', JSON.stringify(invoiceDetails));
    console.log('createInvoice - resolved invoiceItems:', JSON.stringify(invoiceItems));

    if (!invoiceDetails || typeof invoiceDetails !== 'object') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Invalid request body. invoiceDetails missing or malformed.' });
    }

    // Validate business_id if provided
    if (invoiceDetails.business_id) {
      const business = await BusinessDetail.findOne({
        where: { id: invoiceDetails.business_id, is_deleted: false }
      });
      if (!business) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Invalid business_id. Business not found or is deleted.'
        });
      }
    } else {
      // If business_id is not provided, get the default business
      const defaultBusinessId = await getDefaultBusinessId();
      if (!defaultBusinessId) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'No business details found. Please create a business profile first.'
        });
      }
      invoiceDetails.business_id = defaultBusinessId;
    }

    // Validate invoiceDetails
    console.log("🧾 Validating invoiceDetails...");
    const { error: invoiceError } = invoiceValidationSchema.validate(invoiceDetails);
    if (invoiceError) {
      console.error("❌ Invoice validation failed:", invoiceError.details[0].message);
      return res.status(400).json({ error: invoiceError.details[0].message });
    }

    // Validate invoiceItems
    console.log("📦 Validating invoiceItems...");
    const { error: itemsError } = invoiceItemValidationSchema.validate(invoiceItems);
    if (itemsError) {
      console.error("❌ Invoice items validation failed:", itemsError.details[0].message);
      return res.status(400).json({ error: itemsError.details[0].message });
    }


    // Validate that provided billing/shipping addresses (if any) belong to the customer
    const providedAddressIds = [invoiceDetails.billing_address_id, invoiceDetails.shipping_address_id]
      .filter(id => id !== undefined && id !== null);

    if (providedAddressIds.length > 0) {
      const addressValidation = await Address.findAll({
        where: {
          id: { [Op.in]: providedAddressIds },
          customerId: invoiceDetails.customer_id,
          is_deleted: false
        }
      });

      if (addressValidation.length !== providedAddressIds.length) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Invalid address(es). Provided address IDs must belong to the selected customer and not be deleted.'
        });
      }

      // If billing_address_id provided, validate its type
      if (invoiceDetails.billing_address_id) {
        const billingAddress = addressValidation.find(addr => addr.id === invoiceDetails.billing_address_id);
        if (!billingAddress || billingAddress.address_type !== 'billing') {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Selected billing address must be of type "billing" and belong to the customer.'
          });
        }
      }

      // If shipping_address_id provided, validate its type
      if (invoiceDetails.shipping_address_id) {
        const shippingAddress = addressValidation.find(addr => addr.id === invoiceDetails.shipping_address_id);
        if (!shippingAddress || shippingAddress.address_type !== 'shipping') {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Selected shipping address must be of type "shipping" and belong to the customer.'
          });
        }
      }
    }

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

    const processedItems = await Promise.all(
      invoiceItems.map(async (item) => {
        if (!item.product_id) {
          const product = await Product.create(
            {
              name: item.product_name,
              unit_price: parseFloat(item.unit_price) || 0,
              description: item.description || "",
              hsn_sac_code: item.hsn_sac_code || item.hsn_code || "",
              unit_type: item.unit_type || "Nos",
              gst_rate: parseFloat(item.gst_rate) || 0,
            },
            { transaction }
          );
          item.product_id = product.id;
        }

        const taxable_value = parseFloat(item.taxable_value) || 0;
        const gst_rate = parseFloat(item.gst_rate) || 0;

        // ✅ Determine tax type based on place_of_supply
        const placeOfSupply = invoiceDetails.place_of_supply?.toLowerCase() || "";
        let cgst_amount = 0,
          sgst_amount = 0,
          igst_amount = 0;

        if (placeOfSupply === "intrastate") {
          cgst_amount = (taxable_value * gst_rate) / 200;
          sgst_amount = (taxable_value * gst_rate) / 200;
        } else {
          igst_amount = (taxable_value * gst_rate) / 100;
        }

        const total_amount =
          taxable_value + cgst_amount + sgst_amount + igst_amount;

        return {
          ...item,
          invoice_id: invoice.id,
          taxable_value,
          gst_rate,
          cgst_amount,
          sgst_amount,
          igst_amount,
          total_amount,
        };
      })
    );


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
    const invoices = await Invoice.findAll({
      where: { is_deleted: false },
      include: [
         {
          model: InvoiceItem,
          as: 'items', // ✅ Include product line items
        },
        {
          model: Address,
          as: 'billingAddress',
          attributes: ['contact_person', 'contact_email', 'contact_phone', 'street_address', 'city', 'state', 'country', 'pincode']
        },
        {
          model: Address,
          as: 'shippingAddress',
          attributes: ['contact_person', 'contact_email', 'contact_phone', 'street_address', 'city', 'state', 'country', 'pincode']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['company_name', 'primary_contact_person', 'primary_email', 'primary_phone']
        }
      ]
    });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      where: {
        id: req.params.id,
        is_deleted: false
      },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
        },
        {
          model: Address,
          as: 'billingAddress',
          attributes: ['contact_person', 'contact_email', 'contact_phone', 'street_address', 'city', 'state', 'country', 'pincode']
        },
        {
          model: Address,
          as: 'shippingAddress',
          attributes: ['contact_person', 'contact_email', 'contact_phone', 'street_address', 'city', 'state', 'country', 'pincode']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['company_name', 'primary_contact_person', 'primary_email', 'primary_phone']
        }
      ]
    });

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
    const invoiceId = req.params.id;

    console.log("🧾 Updating invoice:", invoiceId);

    // Validate invoice details and items
    const { error: invoiceError } = invoiceValidationSchema.validate(invoiceDetails);
    if (invoiceError)
      return res.status(400).json({ error: invoiceError.details[0].message });

    const { error: itemsError } = invoiceItemValidationSchema.validate(invoiceItems);
    if (itemsError)
      return res.status(400).json({ error: itemsError.details[0].message });

    // Check invoice exists
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, is_deleted: false },
      transaction,
    });
    if (!invoice) {
      await transaction.rollback();
      return res.status(404).json({ error: "Invoice not found" });
    }

    // === Update invoice header ===
    await invoice.update(invoiceDetails, { transaction });

    // === Fetch existing items ===
    const existingItems = await InvoiceItem.findAll({
      where: { invoice_id: invoiceId, is_deleted: false },
      transaction,
    });

    const existingItemIds = existingItems.map((it) => it.id);
    const incomingItemIds = invoiceItems.map((it) => it.id).filter(Boolean);

    // === 1️⃣ Delete items that were removed ===
    const itemsToDelete = existingItemIds.filter(
      (id) => !incomingItemIds.includes(id)
    );
    if (itemsToDelete.length > 0) {
      await InvoiceItem.destroy({
        where: { id: itemsToDelete },
        transaction,
      });
      console.log("🗑 Deleted invoice items:", itemsToDelete);
    }

    // === 2️⃣ Update or create items ===
    for (const item of invoiceItems) {
      let productId = item.product_id;
      if (!productId) {
        const newProduct = await Product.create(
          {
            name: item.product_name,
            unit_price: item.unit_price || 0,
            description: item.description || "",
            hsn_sac_code: item.hsn_sac_code || "",
            unit_type: item.unit_type || "Nos",
            gst_rate: item.gst_rate || 0,
          },
          { transaction }
        );
        productId = newProduct.id;
      }

      const taxBase = parseFloat(item.taxable_value || 0);
      const cgstAmt = (taxBase * (item.cgst_rate || 0)) / 100;
      const sgstAmt = (taxBase * (item.sgst_rate || 0)) / 100;
      const igstAmt = (taxBase * (item.igst_rate || 0)) / 100;
      const totalAmt = taxBase + cgstAmt + sgstAmt + igstAmt;

      if (item.id) {
        // 🟢 Update existing item
        await InvoiceItem.update(
          {
            product_id: productId,
            product_name: item.product_name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable_value: taxBase,
            cgst_rate: item.cgst_rate,
            sgst_rate: item.sgst_rate,
            igst_rate: item.igst_rate,
            cgst_amount: cgstAmt,
            sgst_amount: sgstAmt,
            igst_amount: igstAmt,
            total_amount: totalAmt,
            unit_type: item.unit_type || "Nos",
          },
          { where: { id: item.id }, transaction }
        );
      } else {
        // 🆕 Create new item
        await InvoiceItem.create(
          {
            invoice_id: invoiceId,
            product_id: productId,
            product_name: item.product_name,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            taxable_value: taxBase,
            cgst_rate: item.cgst_rate,
            sgst_rate: item.sgst_rate,
            igst_rate: item.igst_rate,
            cgst_amount: cgstAmt,
            sgst_amount: sgstAmt,
            igst_amount: igstAmt,
            total_amount: totalAmt,
            unit_type: item.unit_type || "Nos",
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    const updatedInvoice = await Invoice.findOne({
      where: { id: invoiceId },
      include: [{ model: InvoiceItem, as: "items" }],
    });

    return res.status(200).json({
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("❌ Update invoice error:", error);
    await transaction.rollback();
    return res.status(500).json({ error: error.message });
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