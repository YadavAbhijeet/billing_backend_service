const http = require('http');

// Configuration
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test',
    method: 'GET',
};

console.log(`Checking backend status at http://${options.hostname}:${options.port}${options.path} ...`);

const req = http.request(options, (res) => {
    let data = '';

    console.log(`STATUS: ${res.statusCode}`);

    // A chunk of data has been received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received.
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(data);
            console.log('RESPONSE:', JSON.stringify(parsedData, null, 2));
            if (parsedData.status === 'success') {
                console.log('\n✅ TEST PASSED: Backend is running and reachable.');
            } else {
                console.log('\n⚠️ TEST FAILED: Backend returned unexpected response.');
            }
        } catch (e) {
            console.log('RESPONSE (Raw):', data);
            console.log('\n⚠️ TEST FAILED: Could not parse JSON response.');
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ CONNECTION ERROR: ${e.message}`);
    console.log('Tip: Make sure the server is running (npm run dev) on port 3000.');
});

req.end();
