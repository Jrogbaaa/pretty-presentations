/**
 * Quick smoke test to verify the application is working
 */

const http = require('http');

async function testEndpoint(path, description) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      console.log(`✓ ${description}: ${res.statusCode}`);
      resolve(res.statusCode);
    }).on('error', (err) => {
      console.log(`✗ ${description}: ${err.message}`);
      resolve(null);
    });
  });
}

async function runTests() {
  console.log('\n🧪 Running Application Smoke Tests\n');
  console.log('━'.repeat(50));
  
  const results = [];
  
  // Test homepage
  results.push(await testEndpoint('/', 'Homepage'));
  
  // Test static assets
  results.push(await testEndpoint('/favicon.ico', 'Favicon'));
  
  console.log('━'.repeat(50));
  
  const passed = results.filter(r => r === 200).length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('✅ All tests passed! Application is running successfully.\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the errors above.\n');
    process.exit(1);
  }
}

runTests();
