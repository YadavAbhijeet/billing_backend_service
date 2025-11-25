const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import all models
require('./models/Customer');
require('./models/Address');
require('./models/BusinessDetail');
require('./models/Invoice');
require('./models/InvoiceTemplate');
require('./models/Product');

// Import routes
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const businessDetailRoutes = require('./routes/businessDetailRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplateRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/business-details', businessDetailRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoices', invoiceTemplateRoutes);


// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection failed:', err));
