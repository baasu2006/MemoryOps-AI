import { runDiagnostic, applyFix, verifyResolution, createTicket } from './src/tools/itTools.js';

console.log('=== Testing IT Support Tools Module ===');

// 1. Test runDiagnostic for E1024
console.log('\n1. Testing runDiagnostic for E1024:');
const diag = runDiagnostic('E1024', 'Dell Latitude 5440');
console.log('Diagnostic result:', diag);

if (diag.cpu !== 94 || diag.ram !== 87 || diag.disk !== 72 || diag.problematicProcess !== 'CompanySync.exe') {
  throw new Error('Initial diagnostic for E1024 does not match expected CPU 94, RAM 87, Disk 72, CompanySync.exe');
}

// 2. Test applyFix with stop_company_sync on E1024
console.log('\n2. Testing applyFix (stop_company_sync):');
const fixSuccess = applyFix('E1024', 'Dell Latitude 5440', 'stop_company_sync');
console.log('Before fix:', fixSuccess.before.cpu, '% CPU,', fixSuccess.before.ram, '% RAM');
console.log('After fix:', fixSuccess.after.cpu, '% CPU,', fixSuccess.after.ram, '% RAM');
console.log('Process after fix:', fixSuccess.after.problematicProcess);

if (fixSuccess.before.cpu !== 94 || fixSuccess.before.ram !== 87 || fixSuccess.after.cpu !== 31 || fixSuccess.after.ram !== 58) {
  throw new Error('Before/after metrics mismatch for stop_company_sync on E1024');
}

// 3. Test verifyResolution
console.log('\n3. Testing verifyResolution:');
const verification = verifyResolution(fixSuccess.before, fixSuccess.after);
console.log('Verification output:', verification);

if (verification.resolved !== true) {
  throw new Error('Expected verification.resolved to be true');
}

// 4. Test failed action on E1024 (restart_device fails because CompanySync starts again)
console.log('\n4. Testing unsuccessful action on E1024 (restart_device):');
const fixRestart = applyFix('E1024', 'Dell Latitude 5440', 'restart_device');
console.log('Restart fix success flag:', fixRestart.success);
console.log('CPU after restart:', fixRestart.after.cpu, 'Problematic process:', fixRestart.after.problematicProcess);
const verifyRestart = verifyResolution(fixRestart.before, fixRestart.after);
console.log('Verification for restart:', verifyRestart);

if (verifyRestart.resolved !== false) {
  throw new Error('Expected restart_device on E1024 to result in resolved: false');
}

// 5. Test createTicket
console.log('\n5. Testing createTicket:');
const ticket = createTicket({
  employeeId: 'E1024',
  employeeName: 'Arjun Rao',
  device: 'Dell Latitude 5440',
  issue: 'Severe laptop slowdown',
  diagnostic: diag,
  previousAttempts: ['restart_device', 'clear_temp_files'],
  recommendedAction: 'stop_company_sync',
  authorizationStatus: 'pending'
});
console.log('Created Ticket:', ticket);

if (!ticket.id.startsWith('INC-2026-')) {
  throw new Error('Ticket ID format mismatch');
}

console.log('\n✅ ALL IT SUPPORT TOOLS TESTS PASSED!');
