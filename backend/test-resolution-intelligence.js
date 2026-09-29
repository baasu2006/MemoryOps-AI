import { calculateActionStatistics, getResolutionIntelligence } from './src/services/resolutionIntelligence.js';
import { incidents } from './src/data/incidents.js';

console.log('=== Testing Resolution Intelligence Service ===');

// 1. Calculate action statistics
console.log('\n1. Testing calculateActionStatistics:');
const stats = calculateActionStatistics(incidents);
console.log('Statistics Output:');
console.log(JSON.stringify(stats, null, 2));

// Verify keys in statistics
for (const row of stats) {
  if (!('action' in row) || !('attempts' in row) || !('successes' in row) || !('failures' in row) || !('successRate' in row)) {
    throw new Error(`Invalid row schema in action statistics: ${JSON.stringify(row)}`);
  }
}

// 2. Test getResolutionIntelligence for E1024
console.log('\n2. Testing getResolutionIntelligence for E1024:');
const intel = await getResolutionIntelligence('E1024', 'laptop slow');
console.log('Resolution Intelligence Output:');
console.log(JSON.stringify(intel, null, 2));

if (intel.mostSuccessfulAction?.action !== 'stop_company_sync') {
  throw new Error(`Expected mostSuccessfulAction "stop_company_sync", got "${intel.mostSuccessfulAction?.action}"`);
}

if (intel.mostSuccessfulAction?.successRate !== 100) {
  throw new Error(`Expected 100% success rate for stop_company_sync, got ${intel.mostSuccessfulAction?.successRate}`);
}

console.log('\n✅ ALL RESOLUTION INTELLIGENCE SERVICE TESTS PASSED!');
