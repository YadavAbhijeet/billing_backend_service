const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'customerController.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add payment_terms to the destructuring in createCustomer
content = content.replace(
    'gstin,\n      pan_no,\n      addresses',
    'gstin,\n      pan_no,\n      payment_terms,\n      addresses'
);

// 2. Add payment_terms to the Customer.create call
content = content.replace(
    'gstin,\n      pan_no,\n      user_id: req.user.id',
    'gstin,\n      pan_no,\n      payment_terms: payment_terms || 0,\n      user_id: req.user.id'
);

// 3. Add payment_terms to updateCustomer destructuring
content = content.replace(
    'const { company_name, primary_contact_person, primary_email, primary_phone, gstin, pan_no, addresses } = req.body;',
    'const { company_name, primary_contact_person, primary_email, primary_phone, gstin, pan_no, payment_terms, addresses } = req.body;'
);

// 4. Add payment_terms to Customer.update call
content = content.replace(
    'gstin,\n      pan_no\n    }, {',
    'gstin,\n      pan_no,\n      payment_terms: payment_terms !== undefined ? payment_terms : 0\n    }, {'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully added payment_terms support to customerController.js');
