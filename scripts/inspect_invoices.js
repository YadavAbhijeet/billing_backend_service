const sequelize = require('../config/database');

(async function(){
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query("PRAGMA table_info('invoices');");
    console.log('invoices table columns:');
    rows.forEach(r => console.log(`- ${r.name} (${r.type})`));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
