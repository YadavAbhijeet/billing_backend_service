const request = require('supertest');
const app = require('../app'); // Assuming app.js initializes the Express app
const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');

// Mock data
const mockInvoice = {
  customer: '635f1a2e5f1b2c001c8e4a2b',
  products: ['635f1a2e5f1b2c001c8e4a2c'],
  totalAmount: 100,
  template: '635f1a2e5f1b2c001c8e4a2d',
  businessDetails: '635f1a2e5f1b2c001c8e4a2e',
};

describe('Invoice Controller', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new invoice', async () => {
    const response = await request(app).post('/api/invoices').send(mockInvoice);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
  });

  it('should fail validation for missing fields', async () => {
    const response = await request(app).post('/api/invoices').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});