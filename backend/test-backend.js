import express from 'express';
import router from './src/routes/index.js';
import { runDiagnostic, applyFix, verifyResolution } from './src/tools/diagnostic.js';
import { analyzeResolutions, getRecommendation } from './src/services/resolution.js';
import { employees } from './src/data/employees.js';
import { incidents } from './src/data/incidents.js';

console.log('--- Testing MemoryOps AI Backend Components ---');

// 1. Employee verification
console.log('\n1. Verifying Employee E1024:');
const arjun = employees.find(e => e.id === 'E1024');
console.log('Found:', arjun);
if (!arjun || arjun.name !== 'Arjun Rao' || arjun.device !== 'Dell Latitude 5440') {
  throw new Error('E1024 employee data mismatch');
}

// 2. Diagnostics verification
console.log('\n2. Testing Diagnostics for E1024:');
const diag = runDiagnostic('E1024', 'Dell Latitude 5440');
console.log('Diagnostic result:', diag);
if (diag.cpu !== 94 || diag.ram !== 87 || diag.disk !== 72 || diag.problematicProcess !== 'CompanySync.exe') {
  throw new Error('Diagnostic output mismatch for E1024');
}

// 3. Simulated Fix & Verification
console.log('\n3. Testing Simulated Fix (stop_company_sync):');
const fix = applyFix('E1024', 'Dell Latitude 5440', 'stop_company_sync');
console.log('Fix Before:', fix.before.cpu, '% CPU,', fix.before.ram, '% RAM');
console.log('Fix After:', fix.after.cpu, '% CPU,', fix.after.ram, '% RAM');
const verification = verifyResolution(fix.before, fix.after);
console.log('Verification:', verification);
if (!verification.resolved || fix.after.cpu !== 31 || fix.after.ram !== 58) {
  throw new Error('Fix or verification failed');
}

// 4. Resolution Intelligence
console.log('\n4. Testing Resolution Intelligence:');
const stats = analyzeResolutions(incidents);
console.log('Resolution stats count:', stats.length);
console.log('Top resolution action:', stats[0]);

const rec = getRecommendation('E1024', 'My laptop is slow again', incidents, []);
console.log('Recommendation for E1024 laptop slowness:', rec);
if (rec.recommendedAction !== 'stop_company_sync') {
  throw new Error('Expected recommendation stop_company_sync');
}

// 5. Test Hindsight Natural-Language Memory Formatting
console.log('\n5. Testing Natural-Language Memory Formatting:');
import('./src/memory/hindsight.js').then(({ formatIncidentToNaturalLanguage }) => {
  const sampleIncident = {
    employeeId: 'E1024',
    employeeName: 'Arjun Rao',
    device: 'Dell Latitude 5440',
    os: 'Windows 11',
    issue: 'severe laptop slowdown',
    diagnosticResults: { cpu: 94, ram: 87, problematicProcess: 'CompanySync.exe' },
    troubleshootingAttempts: [
      { action: 'restart_device', result: 'failure' },
      { action: 'clear_temp_files', result: 'failure' },
      { action: 'stop_company_sync', result: 'success' }
    ],
    authorization: { authorized: true },
    actionExecuted: 'stopping CompanySync.exe',
    beforeMetrics: { cpu: 94 },
    afterMetrics: { cpu: 31 },
    resolution: { resolved: true }
  };
  const formatted = formatIncidentToNaturalLanguage(sampleIncident);
  console.log('Formatted Memory:\n---\n' + formatted + '\n---');
  console.log('\n✅ ALL BACKEND & HINDSIGHT FORMATTING TESTS PASSED!');
});

