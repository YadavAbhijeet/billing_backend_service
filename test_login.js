const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            username: 'admin',
            password: 'adminpassword'
        });
        console.log('✅ Login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.log('❌ Login failed!');
        console.log('Error:', error.response?.data || error.message);
        console.log('Status:', error.response?.status);
    }
}

testLogin();
