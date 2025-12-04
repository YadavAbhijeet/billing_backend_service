const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'invoiceController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add challan handling to createInvoice - after invoice creation
const createInvoiceMarker = '    // Create or update the invoice\r\n    let invoice;\r\n    if (invoiceDetails.id) {\r\n      // Update existing invoice\r\n      await Invoice.update(invoiceDetails, { where: { id: invoiceDetails.id }, transaction });\r\n      invoice = await Invoice.findByPk(invoiceDetails.id, { transaction });\r\n    } else {\r\n      // Create new invoice\r\n      invoice = await Invoice.create(invoiceDetails, { transaction });\r\n    }';

const createInvoiceReplacement = `    // Create or update the invoice
    let invoice;
    let challans = invoiceDetails.challans || [];
    if (invoiceDetails.challans) delete invoiceDetails.challans;

    if (invoiceDetails.id) {
      // Update existing invoice
      await Invoice.update(invoiceDetails, { where: { id: invoiceDetails.id }, transaction });
      invoice = await Invoice.findByPk(invoiceDetails.id, { transaction });
    } else {
      // Create new invoice
      invoice = await Invoice.create(invoiceDetails, { transaction });
    }

    // Handle Challans
    if (challans && Array.isArray(challans)) {
      // If updating, delete existing challans first (simple sync)
      if (invoiceDetails.id) {
         await InvoiceChallan.destroy({ where: { invoice_id: invoice.id }, transaction });
      }

      if (challans.length > 0) {
        const challanData = challans.map(c => ({
          invoice_id: invoice.id,
          challan_no: c.challan_no,
          challan_date: c.challan_date
        }));
        await InvoiceChallan.bulkCreate(challanData, { transaction });
      }
    }`;

if (content.includes('Handle Challans')) {
    console.log('⚠️  Challan handling already exists in createInvoice');
} else {
    content = content.replace(createInvoiceMarker, createInvoiceReplacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully added challan handling to createInvoice');
}
