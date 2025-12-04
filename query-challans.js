const sequelize = require('./config/database');

async function queryChallans() {
    try {
        const [results] = await sequelize.query(`
      SELECT id, invoice_id, challan_no, challan_date
      FROM invoice_challans
      ORDER BY invoice_id DESC, id ASC
    `);

        console.log('\n📊 All challans in database:');
        console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

queryChallans();
