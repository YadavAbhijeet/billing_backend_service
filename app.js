const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import all models to ensure they are registered
require('./models/Customer');
require('./models/Address');
require('./models/BusinessDetail');
require('./models/Invoice');
require('./models/InvoiceTemplate');
require('./models/Product');

// Import routes
const customerRoutes = require('./routes/customerRoutes');
const businessDetailRoutes = require('./routes/businessDetailRoutes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplateRoutes');
const invoice = require('./routes/invoiceRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/business-details', businessDetailRoutes);
app.use('/api/invoices', invoice);
app.use('/api/invoice-templates', invoiceTemplateRoutes);

// Test database connection and sync
sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
  // Use sync() without alter to avoid Sequelize trying to rebuild/alter tables automatically.
  // Schema changes should be applied via migrations or a controlled script.
  return sequelize.sync();
  })
  .then(() => {
    console.log('Database synchronized...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection failed:', err));