import { generateSupportDecision } from './src/ai/supportAgent.js';
import { employees } from './src/data/employees.js';
import { runDiagnostic } from './src/tools/diagnostic.js';

console.log('=== Testing Groq AI Support Agent ===');

const arjun = employees.find(e => e.id === 'E1024');
const diag = runDiagnostic('E1024', 'Dell Latitude 5440');

const recalledMemories = [
  "Employee E1024 (Arjun Rao) using Dell Latitude 5440 on Windows 11 reported severe laptop slowdown. Diagnostic showed CPU 94%, RAM 87%, CompanySync.exe consuming excessive CPU. Previous troubleshooting: * restart_device: unsuccessful * clear_temp_files: unsuccessful * stop_company_sync: successful. Employee authorized stopping CompanySync.exe. After the action CPU reduced from 94% to 31%. Resolution verified successfully."
];

const resolutionHistory = [
  { action: 'restart_device', result: 'failure' },
  { action: 'clear_temp_files', result: 'failure' },
  { action: 'stop_company_sync', result: 'success' }
];

console.log('\nInvoking generateSupportDecision...');
const decision = await generateSupportDecision({
  employee: arjun,
  issue: 'My laptop is slow again',
  diagnostic: diag,
  memories: recalledMemories,
  resolutionHistory
});

console.log('\nAI Decision Result:');
console.log(JSON.stringify(decision, null, 2));

// Verify required schema fields
const requiredKeys = [
  'summary',
  'previous_incidents',
  'likely_cause',
  'recommended_action',
  'reason',
  'requires_authorization',
  'escalation_required'
];

for (const key of requiredKeys) {
  if (!(key in decision)) {
    throw new Error(`Missing required key in AI decision: ${key}`);
  }
}

if (decision.recommended_action !== 'stop_company_sync') {
  throw new Error(`Expected recommended_action "stop_company_sync", got "${decision.recommended_action}"`);
}

if (decision.requires_authorization !== true) {
  throw new Error('Expected requires_authorization to be true');
}

console.log('\n✅ ALL AI SUPPORT AGENT TESTS PASSED!');
