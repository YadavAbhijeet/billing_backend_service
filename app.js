require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');

// Import all models
// Import all models and setup associations
const db = require('./models');



// Import routes
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const businessDetailRoutes = require('./routes/businessDetailRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplateRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const estimateRoutes = require('./routes/estimateRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in the explicitly defined allowed list
    const allowedOrigins = corsOrigin ? corsOrigin.split(',') : [];

    // Allow any localhost origin for development convenience
    const isLocalhost = origin.startsWith('http://localhost');

    if (allowedOrigins.indexOf(origin) !== -1 || isLocalhost || corsOrigin === '*') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log('\n========== NEW REQUEST ==========');
  console.log('Time   :', new Date().toISOString());
  console.log('Method :', req.method);
  console.log('URL    :', req.originalUrl);
  console.log('Params :', req.params);
  console.log('Query  :', req.query);
  console.log('Body   :', req.body);
  console.log('=================================');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
console.log('✅ Registered /api/auth routes');
app.use('/api/users', userRoutes);
console.log('✅ Registered /api/users routes');
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/business-details', businessDetailRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/invoices', invoiceTemplateRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/estimates', estimateRoutes);

// Test Route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend is running correctly!',
    timestamp: new Date().toISOString()
  });
});

// 🔥 GLOBAL ERROR HANDLER – catches thrown errors and logs stack traces
app.use((err, req, res, next) => {
  console.error('\n🚨 GLOBAL ERROR HANDLER TRIGGERED 🚨');
  console.error('Request:', req.method, req.originalUrl);
  console.error('Error stack:\n', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


// Database connection
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
