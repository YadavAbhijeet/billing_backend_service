const { Invoice, Customer } = require('./models');
const sequelize = require('./config/database');

async function checkInvoice() {
    try {
        // Attempt to find the invoice by number 'check-1'
        const invoice = await Invoice.findOne({
            where: { invoice_number: 'check-1' },
            include: [{ model: Customer, as: 'customer' }]
        });

        if (invoice) {
            console.log('Invoice Found ID:', invoice.id);
            console.log('Linked Customer ID:', invoice.customer_id);
            console.log('Customer Data:', JSON.stringify(invoice.customer, null, 2));
        } else {
            console.log('Invoice check-1 NOT FOUND in DB');
            // List recent invoices to see what we have
            const recents = await Invoice.findAll({ limit: 5, order: [['id', 'DESC']] });
            console.log('Recent Invoices:', recents.map(i => `${i.invoice_number} (ID: ${i.id})`));
        }

    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

checkInvoice();
