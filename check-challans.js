const sequelize = require('./config/database');

// Load all models first
require('./models/Invoice');
require('./models/InvoiceChallan');
require('./models/InvoiceItem');

// Load associations
const Invoice = require('./models/Invoice');
const InvoiceChallan = require('./models/InvoiceChallan');

// Setup associations manually
Invoice.hasMany(InvoiceChallan, {
    foreignKey: 'invoice_id',
    as: 'challans'
});

async function checkChallans() {
    try {
        // Get all challans directly
        const allChallans = await InvoiceChallan.findAll({
            order: [['invoice_id', 'DESC'], ['created_at', 'DESC']],
            limit: 20
        });

        console.log('\n📊 All challans in database (last 20):');
        console.log('Total count:', allChallans.length);

        if (allChallans.length === 0) {
            console.log('❌ No challans found in database!');
        } else {
            const groupedByInvoice = {};
            allChallans.forEach(c => {
                if (!groupedByInvoice[c.invoice_id]) {
                    groupedByInvoice[c.invoice_id] = [];
                }
                groupedByInvoice[c.invoice_id].push(c);
            });

            Object.keys(groupedByInvoice).forEach(invoiceId => {
                console.log(`\n  Invoice ID: ${invoiceId}`);
                groupedByInvoice[invoiceId].forEach((c, i) => {
                    console.log(`    ${i + 1}. Challan No: "${c.challan_no}", Date: ${c.challan_date}`);
                });
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkChallans();
