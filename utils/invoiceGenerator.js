const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "../fonts/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "../fonts/Roboto-Bold.ttf"),
    italics: path.join(__dirname, "../fonts/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "../fonts/Roboto-BoldItalic.ttf"),
  },
};

const printer = new PdfPrinter(fonts);

async function generateInvoice(invoice, outputPath) {
  const business = invoice.business || {};
  const customer = invoice.customer || {};
  const billing = invoice.billingAddress || {};
  const shipping = invoice.shippingAddress || {};
  const items = invoice.items || [];

  // 🏢 Business Header
  const headerSection = {
    columns: [
      business.logo_url
        ? { image: business.logo_url, width: 100, height: 50, margin: [0, 0, 20, 0] }
        : { text: "" },
      {
        stack: [
          { text: business.business_name || "Business Name", style: "header" },
          { text: business.legal_name || "", style: "subHeader" },
          { text: `GSTIN: ${business.gstin || "-"}`, style: "small" },
          { text: `${business.address_line1 || ""}, ${business.city || ""}`, style: "small" },
          { text: `State: ${business.state || ""}, Pincode: ${business.pincode || ""}`, style: "small" },
          { text: `Phone: ${business.phone || ""} | Email: ${business.email || ""}`, style: "small" },
        ],
      },
      {
        alignment: "right",
        stack: [
          { text: "TAX INVOICE", style: "invoiceTitle" },
          { text: `Invoice No: ${invoice.invoice_number}`, style: "small" },
          { text: `Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, style: "small" },
          { text: `Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, style: "small" },
          { text: `Place of Supply: ${invoice.place_of_supply || "-"}`, style: "small" },
        ],
      },
    ],
  };

  // 👤 Customer, Billing & Shipping Info
  const addressSection = {
    columns: [
      {
        width: "50%",
        stack: [
          { text: "Customer Details", style: "sectionHeader" },
          { text: customer.company_name || "-", style: "subHeader" },
          { text: `Contact: ${customer.primary_contact_person || "-"}`, style: "small" },
          { text: `Email: ${customer.primary_email || "-"}`, style: "small" },
          { text: `Phone: ${customer.primary_phone || "-"}`, style: "small" },
          { text: `GSTIN: ${customer.gstin || "-"}`, style: "small" },
        ],
      },
      {
        width: "50%",
        stack: [
          { text: "Billing Address", style: "sectionHeader" },
          { text: `${billing.street_address || ""}, ${billing.city || ""}`, style: "small" },
          { text: `${billing.state || ""} - ${billing.pincode || ""}`, style: "small" },
          { text: `${billing.country || ""}`, style: "small" },
          { text: "", margin: [0, 4] },
          { text: "Shipping Address", style: "sectionHeader" },
          { text: `${shipping.street_address || ""}, ${shipping.city || ""}`, style: "small" },
          { text: `${shipping.state || ""} - ${shipping.pincode || ""}`, style: "small" },
          { text: `${shipping.country || ""}`, style: "small" },
        ],
      },
    ],
    margin: [0, 15, 0, 10],
  };

  // 📦 Product Items Table
  const itemTableBody = [
    [
      { text: "S.No", style: "tableHeader" },
      { text: "Description", style: "tableHeader" },
      { text: "HSN/SAC", style: "tableHeader" },
      { text: "Qty", style: "tableHeader" },
      { text: "Unit Price", style: "tableHeader" },
      { text: "Taxable Value", style: "tableHeader" },
      { text: "CGST", style: "tableHeader" },
      { text: "SGST", style: "tableHeader" },
      { text: "IGST", style: "tableHeader" },
      { text: "Total", style: "tableHeader" },
    ],
  ];

  items.forEach((item, index) => {
    itemTableBody.push([
      { text: `${index + 1}`, alignment: "center" },
      { text: item.description || item.product_name || "", alignment: "left" },
      { text: item.hsn_code || "-", alignment: "center" },
      { text: item.quantity?.toFixed(2) || "0", alignment: "center" },
      { text: item.unit_price?.toFixed(2) || "0", alignment: "right" },
      { text: item.taxable_value?.toFixed(2) || "0", alignment: "right" },
      { text: `${item.cgst_rate || 0}%\n₹${item.cgst_amount?.toFixed(2) || "0"}`, alignment: "right" },
      { text: `${item.sgst_rate || 0}%\n₹${item.sgst_amount?.toFixed(2) || "0"}`, alignment: "right" },
      { text: `${item.igst_rate || 0}%\n₹${item.igst_amount?.toFixed(2) || "0"}`, alignment: "right" },
      { text: `₹${item.total_amount?.toFixed(2) || "0"}`, alignment: "right" },
    ]);
  });

  const itemsTable = {
    table: {
      headerRows: 1,
      widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
      body: itemTableBody,
    },
    layout: {
      fillColor: (rowIndex) => (rowIndex === 0 ? "#f3f3f3" : null),
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => "#ccc",
      vLineColor: () => "#ccc",
    },
  };

  // 🏦 Bank Details
  const bankDetails = {
    stack: [
      { text: "Bank Details", style: "sectionHeader", margin: [0, 10, 0, 4] },
      { text: `Bank: ${business.bank_name || "-"}`, style: "small" },
      { text: `A/C No: ${business.account_number || "-"}`, style: "small" },
      { text: `IFSC: ${business.ifsc_code || "-"}`, style: "small" },
      { text: `UPI: ${business.upi_id || "-"}`, style: "small" },
    ],
  };

  // 💰 Totals Section
  const totalsSection = {
    stack: [
      { text: `Subtotal: ₹${invoice.subtotal?.toFixed(2) || "0"}`, alignment: "right" },
      { text: `Total Tax: ₹${invoice.total_tax?.toFixed(2) || "0"}`, alignment: "right" },
      { text: `Grand Total: ₹${invoice.total_amount?.toFixed(2) || "0"}`, style: "grandTotal" },
      { text: `Amount in Words: ${invoice.amount_in_words || "-"}`, style: "small", margin: [0, 2, 0, 0], alignment: "right" },
    ],
    margin: [0, 10, 0, 10],
  };

  // ✍️ Footer Signature
  const signatureSection = {
    columns: [
      [
        { text: "Terms & Conditions", style: "sectionHeader", margin: [0, 5, 0, 2] },
        { text: invoice.notes || "Goods once sold will not be taken back.", style: "small" },
      ],
      [
        {
          text: business.business_name || "",
          alignment: "right",
          bold: true,
        },
        business.signature_url
          ? {
            image: business.signature_url,
            width: 80,
            height: 40,
            alignment: "right",
            margin: [0, 5, 0, 0],
          }
          : {},
        { text: "Authorized Signatory", alignment: "right", style: "small" },
      ],
    ],
    margin: [0, 10, 0, 0],
  };

  // 🧾 Document Definition
  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 50, 40, 60],
    content: [
      headerSection,
      { text: "", margin: [0, 10] },
      addressSection,
      { text: "", margin: [0, 10] },
      itemsTable,
      bankDetails,
      totalsSection,
      signatureSection,
    ],
    styles: {
      header: { fontSize: 14, bold: true },
      subHeader: { fontSize: 10, color: "#555" },
      sectionHeader: { fontSize: 11, bold: true, color: "#333", margin: [0, 5, 0, 2] },
      small: { fontSize: 9 },
      tableHeader: { bold: true, fontSize: 9, fillColor: "#f3f3f3" },
      invoiceTitle: { fontSize: 16, bold: true, color: "#222" },
      grandTotal: { fontSize: 12, bold: true, color: "#000", margin: [0, 3, 0, 0] },
    },
  };

  // ✅ Write PDF file
  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const stream = fs.createWriteStream(outputPath);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = generateInvoice;
