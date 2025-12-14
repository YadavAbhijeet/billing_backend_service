const http = require('http');
const https = require('https');

// Get URL from command line arg or default to localhost
const targetUrl = process.argv[2] || 'http://localhost:3000/api/test';
const url = new URL(targetUrl);

const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'GET',
};

const client = url.protocol === 'https:' ? https : http;

console.log(`Checking backend status at ${targetUrl} ...`);

const req = client.request(options, (res) => {
    let data = '';
    console.log(`STATUS: ${res.statusCode}`);

    res.on('data', (chunk) => { data += chunk; });

    res.on('end', () => {
        try {
            const parsedData = JSON.parse(data);
            console.log('RESPONSE:', JSON.stringify(parsedData, null, 2));
            if (res.statusCode === 200) {
                console.log('\n✅ TEST PASSED: Server is UP and responding.');
            } else {
                console.log('\n⚠️ TEST COMPLETED: Server responded but with error code.');
            }
        } catch (e) {
            console.log('RESPONSE (Raw):', data);
            console.log('\n⚠️ TEST FAILED: Response was not JSON.');
        }
    });
});

req.on('error', (e) => {
    console.error(`\n❌ CONNECTION ERROR: ${e.message}`);
});

req.end();
