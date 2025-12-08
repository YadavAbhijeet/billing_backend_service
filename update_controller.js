const fs = require('fs');
const path = 'd:\\pravirtan\\invoice_dashboard\\backend_service\\billing_backend_service\\controllers\\invoiceController.js';
let content = fs.readFileSync(path, 'utf8');

// Add Payment to getAllInvoices and getInvoiceById include
// We target the pattern where InvoiceItem is the first included model
// Note: We use a specific indentation pattern to match the existing code style
const replacement = `include: [
        {
          model: Payment,
          as: 'payments'
        },
        {
          model: InvoiceItem,`;

content = content.replace(
    /include: \[\s*\{\s*model: InvoiceItem,/g,
    replacement
);

fs.writeFileSync(path, content);
console.log('Successfully updated invoiceController.js');
