const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'customerController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the Customer.update object in updateCustomer function
const oldUpdate = `    const [updated] = await Customer.update({
      company_name,
      primary_contact_person,
      primary_email,
      primary_phone,
      gstin,
      pan_no
    }, {`;

const newUpdate = `    const [updated] = await Customer.update({
      company_name,
      primary_contact_person,
      primary_email,
      primary_phone,
      gstin,
      pan_no,
      payment_terms: payment_terms !== undefined ? payment_terms : 0
    }, {`;

if (content.includes(oldUpdate)) {
    content = content.replace(oldUpdate, newUpdate);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully added payment_terms to Customer.update');
} else {
    console.log('❌ Could not find the pattern to replace');
    console.log('Looking for this pattern:');
    console.log(oldUpdate);
}
