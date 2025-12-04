const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'invoiceController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Add logging before challan handling
const marker1 = '    // Handle Challans';
const replacement1 = `    // Handle Challans
    console.log('🔍 Challans received:', JSON.stringify(challans, null, 2));`;

content = content.replace(marker1, replacement1);

// Add logging before saving
const marker2 = '        await InvoiceChallan.bulkCreate(challanData, { transaction });';
const replacement2 = `        console.log('💾 Saving challan data:', JSON.stringify(challanData, null, 2));
        await InvoiceChallan.bulkCreate(challanData, { transaction });
        console.log(\`✅ Saved \${challanData.length} challans for invoice \${invoice.id}\`);`;

content = content.replace(marker2, replacement2);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Added debugging logs to invoiceController.js');
