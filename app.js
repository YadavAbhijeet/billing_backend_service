const express = require('express');
const sequelize = require('./config/database');
const customerRoutes = require('./routes/customerRoutes');
const businessDetailRoutes = require('./routes/businessDetailRoutes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplateRoutes');
const invoice = require('./routes/invoiceRoutes');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/business-details', businessDetailRoutes);
app.use('/api/invoices', invoice);
app.use('/api/invoice-templates', invoiceTemplateRoutes);

// Test database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('Database synchronized...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection failed:', err));