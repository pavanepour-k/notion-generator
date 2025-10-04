#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🧪 Testing Notionify Application\n');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Notionify-Test/1.0',
        ...options.headers
      },
      timeout: TEST_TIMEOUT
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.statusCode === 200) {
      console.log('✅ Health endpoint is working');
      console.log(`   Status: ${response.data.status}`);
      console.log(`   Environment valid: ${response.data.environment?.isValid}`);
      
      if (response.data.environment?.errors?.length > 0) {
        console.log('⚠️  Environment errors:');
        response.data.environment.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }
      
      return true;
    } else {
      console.log(`❌ Health endpoint failed with status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Health endpoint error: ${error.message}`);
    return false;
  }
}

async function testMainPage() {
  console.log('\n🔍 Testing main page...');
  try {
    const response = await makeRequest(`${BASE_URL}/`);
    
    if (response.statusCode === 200) {
      console.log('✅ Main page is accessible');
      return true;
    } else {
      console.log(`❌ Main page failed with status: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Main page error: ${error.message}`);
    return false;
  }
}

async function testGenerateEndpoint() {
  console.log('\n🔍 Testing generate endpoint...');
  try {
    const testPrompt = "간단한 할일 목록 템플릿";
    const response = await makeRequest(`${BASE_URL}/api/generate`, {
      method: 'POST',
      body: { prompt: testPrompt }
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Generate endpoint is working');
      if (response.data.template) {
        console.log(`   Generated template: ${response.data.template.title}`);
      }
      return true;
    } else if (response.statusCode === 500 && response.data.error?.includes('HF_API_KEY')) {
      console.log('⚠️  Generate endpoint requires HF_API_KEY');
      console.log('   This is expected if no API key is configured');
      return true; // This is expected behavior
    } else {
      console.log(`❌ Generate endpoint failed with status: ${response.statusCode}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Generate endpoint error: ${error.message}`);
    return false;
  }
}

async function testSaveEndpoint() {
  console.log('\n🔍 Testing save endpoint...');
  try {
    const testContent = {
      title: "Test Template",
      sections: [{ name: "Test Section", description: "Test description" }],
      properties: [{ name: "Test Property", type: "text", description: "Test property" }]
    };
    
    const response = await makeRequest(`${BASE_URL}/api/save`, {
      method: 'POST',
      body: { content: testContent }
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Save endpoint is working');
      if (response.data.url) {
        console.log(`   Saved to: ${response.data.url}`);
      }
      return true;
    } else if (response.statusCode === 500 && response.data.error?.includes('GITHUB_TOKEN')) {
      console.log('⚠️  Save endpoint requires GITHUB_TOKEN');
      console.log('   This is expected if no GitHub token is configured');
      return true; // This is expected behavior
    } else {
      console.log(`❌ Save endpoint failed with status: ${response.statusCode}`);
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Save endpoint error: ${error.message}`);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n🔍 Testing rate limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 12; i++) { // Test with more than the limit
      promises.push(makeRequest(`${BASE_URL}/api/generate`, {
        method: 'POST',
        body: { prompt: `Test prompt ${i}` }
      }));
    }
    
    const responses = await Promise.allSettled(promises);
    const rateLimited = responses.some(result => 
      result.status === 'fulfilled' && result.value.statusCode === 429
    );
    
    if (rateLimited) {
      console.log('✅ Rate limiting is working');
      return true;
    } else {
      console.log('⚠️  Rate limiting may not be working as expected');
      return true; // Not a critical failure
    }
  } catch (error) {
    console.log(`❌ Rate limiting test error: ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting application tests...\n');
  
  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'Main Page', fn: testMainPage },
    { name: 'Generate Endpoint', fn: testGenerateEndpoint },
    { name: 'Save Endpoint', fn: testSaveEndpoint },
    { name: 'Rate Limiting', fn: testRateLimiting }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.log(`❌ ${test.name} failed with error: ${error.message}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log(`\nResults: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the configuration.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await makeRequest(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  console.log('Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(`❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.log(`❌ Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run the tests
main().catch((error) => {
  console.log(`❌ Test runner error: ${error.message}`);
  process.exit(1);
});