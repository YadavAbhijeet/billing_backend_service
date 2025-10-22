const PDFDocument = require('pdfkit');
const fs = require('fs');

/**
 * Generates a PDF invoice based on the provided data and template.
 * @param {Object} invoiceData - The data for the invoice.
 * @param {String} templateContent - The HTML or text content of the template.
 * @param {String} outputPath - The file path to save the generated PDF.
 */
function generateInvoice(invoiceData, templateContent, outputPath) {
  const doc = new PDFDocument();

  // Pipe the PDF to a file
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Add content to the PDF (this is a placeholder, customize as needed)
  doc.fontSize(20).text('Invoice', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Customer: ${invoiceData.customer.name}`);
  doc.text(`Date: ${new Date(invoiceData.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text('Products:');
  invoiceData.products.forEach((product, index) => {
    doc.text(`${index + 1}. ${product.name} - $${product.price}`);
  });

  doc.moveDown();
  doc.text(`Total Amount: $${invoiceData.totalAmount}`, { align: 'right' });

  // Finalize the PDF
  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = generateInvoice;