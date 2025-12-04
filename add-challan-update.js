const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'invoiceController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add challan handling to updateInvoice - after invoice header update
const updateInvoiceMarker = '    // === Update invoice header ===\r\n    await invoice.update(invoiceDetails, { transaction });';

const updateInvoiceReplacement = `    // === Update invoice header ===
    let challans = invoiceDetails.challans;
    if (invoiceDetails.challans) delete invoiceDetails.challans;
    
    await invoice.update(invoiceDetails, { transaction });

    // Handle Challans
    if (challans && Array.isArray(challans)) {
       await InvoiceChallan.destroy({ where: { invoice_id: invoiceId }, transaction });
       if (challans.length > 0) {
        const challanData = challans.map(c => ({
          invoice_id: invoiceId,
          challan_no: c.challan_no,
          challan_date: c.challan_date
        }));
        await InvoiceChallan.bulkCreate(challanData, { transaction });
      }
    }`;

content = content.replace(updateInvoiceMarker, updateInvoiceReplacement);
fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully added challan handling to updateInvoice');
