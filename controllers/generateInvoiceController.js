const generateInvoice = require("../utils/invoiceGenerator");
const path = require("path");

exports.downloadInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findOne({
      where: { id: invoiceId, is_deleted: false },
      include: [{ model: InvoiceItem, as: "items" }, { model: BusinessDetail, as: "business" }, { model: Customer, as: "customer" }],
    });

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const outputPath = path.join(__dirname, `../invoices/invoice_${invoice.invoice_number}.pdf`);
    await generateInvoice(invoice, outputPath);

    res.download(outputPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate invoice PDF" });
  }
};
