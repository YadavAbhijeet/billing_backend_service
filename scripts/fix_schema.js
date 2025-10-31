const sequelize = require('../config/database');

async function ensureInvoiceColumns() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const [results] = await sequelize.query("PRAGMA table_info('invoices');");
    const existingInvoiceCols = results.map(r => r.name);

    const invoiceToAdd = [];
    if (!existingInvoiceCols.includes('billing_address_id')) invoiceToAdd.push("billing_address_id INTEGER");
    if (!existingInvoiceCols.includes('shipping_address_id')) invoiceToAdd.push("shipping_address_id INTEGER");
    if (!existingInvoiceCols.includes('contact_person')) invoiceToAdd.push("contact_person VARCHAR(100)");
    if (!existingInvoiceCols.includes('contact_email')) invoiceToAdd.push("contact_email VARCHAR(100)");
    if (!existingInvoiceCols.includes('contact_phone')) invoiceToAdd.push("contact_phone VARCHAR(15)");
    if (!existingInvoiceCols.includes('billing_address')) invoiceToAdd.push("billing_address TEXT");
    if (!existingInvoiceCols.includes('shipping_address')) invoiceToAdd.push("shipping_address TEXT");
    if (!existingInvoiceCols.includes('discount')) invoiceToAdd.push("discount DECIMAL(10,2)");
    if (!existingInvoiceCols.includes('tax')) invoiceToAdd.push("tax DECIMAL(10,2)");

    // Invoice items table
    const [itemResults] = await sequelize.query("PRAGMA table_info('invoice_items');");
    const existingItemCols = itemResults.map(r => r.name);
    const itemToAdd = [];
    if (!existingItemCols.includes('hsn_code')) itemToAdd.push({ table: 'invoice_items', def: "hsn_code VARCHAR(50)" });
    if (!existingItemCols.includes('unit_type')) itemToAdd.push({ table: 'invoice_items', def: "unit_type VARCHAR(50)" });
    if (!existingItemCols.includes('gst_rate')) itemToAdd.push({ table: 'invoice_items', def: "gst_rate DECIMAL(5,2)" });

    if (invoiceToAdd.length === 0 && itemToAdd.length === 0) {
      console.log('No schema changes needed.');
      process.exit(0);
    }

    for (const colDef of invoiceToAdd) {
      const sql = `ALTER TABLE invoices ADD COLUMN ${colDef};`;
      console.log('Running:', sql);
      await sequelize.query(sql);
    }

    for (const it of itemToAdd) {
      const sql = `ALTER TABLE ${it.table} ADD COLUMN ${it.def};`;
      console.log('Running:', sql);
      await sequelize.query(sql);
    }

    console.log('Done. Added invoice columns:', invoiceToAdd.join(', '));
    if (itemToAdd.length) console.log('Done. Added invoice_items columns:', itemToAdd.map(i=>i.def).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Error while fixing schema:', err);
    process.exit(1);
  }
}

ensureInvoiceColumns();
