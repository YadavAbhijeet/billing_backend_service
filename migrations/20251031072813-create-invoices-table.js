'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      invoice_number: Sequelize.STRING,
      business_id: Sequelize.INTEGER,
      customer_id: Sequelize.INTEGER,
      billing_address_id: Sequelize.INTEGER,
      shipping_address_id: Sequelize.INTEGER,
      invoice_date: Sequelize.DATE,
      due_date: Sequelize.DATE,
      place_of_supply: Sequelize.STRING,
      subtotal: { type: Sequelize.FLOAT, defaultValue: 0 },
      cgst_amount: { type: Sequelize.FLOAT, defaultValue: 0 },
      sgst_amount: { type: Sequelize.FLOAT, defaultValue: 0 },
      igst_amount: { type: Sequelize.FLOAT, defaultValue: 0 },
      total_tax: { type: Sequelize.FLOAT, defaultValue: 0 },
      discount_amount: { type: Sequelize.FLOAT, defaultValue: 0 },
      total_amount: { type: Sequelize.FLOAT, defaultValue: 0 },
      amount_in_words: Sequelize.STRING,
      payment_mode: Sequelize.STRING,
      payment_status: Sequelize.STRING,
      notes: Sequelize.TEXT,
      pdf_path: Sequelize.STRING,
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Invoices');
  }
};
