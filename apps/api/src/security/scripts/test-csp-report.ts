/**
 * Script para testar o endpoint de relatório CSP
 *
 * Execute com: pnpm ts-node apps/api/src/security/scripts/test-csp-report.ts
 */

// Using fetch instead of axios to avoid dependency
async function httpPost(url: string, data: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

const API_URL = process.env.API_URL || 'http://localhost:3000';

const testCspReport = {
  'csp-report': {
    'document-uri': 'https://app.example.com/page',
    referrer: 'https://app.example.com/',
    'violated-directive': 'script-src',
    'effective-directive': 'script-src',
    'original-policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' http://localhost:* https://*; media-src 'self' data: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; require-trusted-types-for 'script'; trusted-types default;",
    'blocked-uri': 'inline',
    'source-file': 'https://app.example.com/app.js',
    'line-number': '42',
    'column-number': '10',
    'status-code': '200',
    'script-sample': "eval('malicious code')",
  },
};

async function testEndpoint() {
  try {
    console.log('🧪 Testing CSP Report Endpoint...\n');
    console.log('📤 Sending test CSP report to:', `${API_URL}/minc-teams/v1/security/csp-report`);
    console.log('📋 Report data:', JSON.stringify(testCspReport, null, 2));

    const response = await httpPost(`${API_URL}/minc-teams/v1/security/csp-report`, testCspReport);

    console.log('\n✅ Success!');
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 204) {
      console.log('\n✅ Endpoint is working correctly!');
      console.log('💡 Check your API logs to see the CSP violation report.');
    } else {
      const text = await response.text();
      console.error('\n❌ Unexpected status:', response.status);
      console.error('📊 Response:', text);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Test critical violation
const testCriticalViolationData = {
  'csp-report': {
    'document-uri': 'https://app.example.com/page',
    'violated-directive': 'script-src',
    'blocked-uri': 'javascript:alert(1)',
    'source-file': 'https://app.example.com/app.js',
    'line-number': '100',
  },
};

async function testCriticalViolation() {
  try {
    console.log('\n\n🚨 Testing Critical Violation Detection...\n');
    console.log('📤 Sending critical violation report...');

    const response = await httpPost(
      `${API_URL}/minc-teams/v1/security/csp-report`,
      testCriticalViolationData,
    );

    console.log('\n✅ Critical violation report sent!');
    console.log('📊 Response status:', response.status);
    console.log('💡 Check your API logs - this should be logged as ERROR level.');

    if (response.status !== 204) {
      const text = await response.text();
      console.error('📊 Response:', text);
    }
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  await testEndpoint();
  await testCriticalViolation();
  console.log('\n✨ All tests completed!');
}

// Use top-level await if available, otherwise use promise chain
if (typeof process !== 'undefined' && process.versions?.node) {
  main().catch(console.error);
} else {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}
