const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DATABASE_URL) {
  // Production / PostgreSQL configuration
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for some cloud providers like Heroku/Render
      }
    }
  });
} else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
  // Custom PostgreSQL configuration
  sequelize = new Sequelize(
    process.env.DB_NAME || 'billing_service',
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
    }
  );
} else {
  // Local SQLite configuration (default)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
