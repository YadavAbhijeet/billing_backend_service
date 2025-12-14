const { Payment, Invoice, BusinessDetail, Customer } = require('../models');
const sequelize = require('../config/database');

exports.createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { invoice_id, amount, payment_date, payment_mode, notes, reference_number } = req.body;

        if (!invoice_id || !amount) {
            return res.status(400).json({ error: 'Invoice ID and Amount are required' });
        }

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ error: 'Invalid payment amount' });
        }

        // Fetch invoice with locking
        const invoice = await Invoice.findOne({
            where: { id: invoice_id, is_deleted: false },
            transaction,

        });

        if (!invoice) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const totalAmount = parseFloat(invoice.total_amount);
        const currentPaid = parseFloat(invoice.amount_paid || 0);
        const currentRemaining = parseFloat(invoice.amount_remaining || totalAmount);

        if (paymentAmount > currentRemaining) {
            await transaction.rollback();
            return res.status(400).json({
                error: `Payment amount (₹${paymentAmount}) cannot exceed remaining balance (₹${currentRemaining})`
            });
        }

        // Create Payment Record
        const payment = await Payment.create({
            invoice_id,
            amount: paymentAmount,
            payment_date: payment_date || new Date(),
            payment_mode: payment_mode || 'Bank Transfer',
            notes,
            reference_number
        }, { transaction });

        // Update Invoice Totals
        const newPaid = currentPaid + paymentAmount;
        const newRemaining = totalAmount - newPaid;

        let newStatus = 'Partially Paid';
        if (newRemaining <= 0.01) { // Tolerance for floating point errors
            newStatus = 'Paid';
        } else if (newPaid === 0) {
            newStatus = 'Pending';
        }

        await invoice.update({
            amount_paid: newPaid,
            amount_remaining: Math.max(0, newRemaining),
            payment_status: newStatus
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Payment recorded successfully',
            payment,
            invoice: {
                id: invoice.id,
                amount_paid: newPaid,
                amount_remaining: Math.max(0, newRemaining),
                payment_status: newStatus
            }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Create payment error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getInvoicePayments = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const payments = await Payment.findAll({
            where: { invoice_id: invoiceId, is_deleted: false },
            order: [['payment_date', 'DESC'], ['created_at', 'DESC']]
        });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.deletePayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;

        const payment = await Payment.findOne({
            where: { id, is_deleted: false },
            include: [{ model: Invoice, as: 'invoice' }],
            transaction,
        });

        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Payment not found' });
        }

        const invoice = payment.invoice;
        const amountToRevert = parseFloat(payment.amount);

        // Soft delete payment
        await payment.update({ is_deleted: true }, { transaction });

        // Revert invoice totals
        const currentPaid = parseFloat(invoice.amount_paid || 0);
        const totalAmount = parseFloat(invoice.total_amount);

        const newPaid = Math.max(0, currentPaid - amountToRevert);
        const newRemaining = totalAmount - newPaid;

        let newStatus = 'Partially Paid';
        if (newRemaining <= 0.01) {
            newStatus = 'Paid';
        } else if (newPaid === 0) {
            newStatus = 'Pending';
        }

        await invoice.update({
            amount_paid: newPaid,
            amount_remaining: newRemaining,
            payment_status: newStatus
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ message: 'Payment deleted successfully' });

    } catch (error) {
        await transaction.rollback();
        console.error('Delete payment error:', error);
        res.status(500).json({ error: error.message });
    }
};
