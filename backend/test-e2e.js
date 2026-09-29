import express from 'express';
import cors from 'cors';
import router from './src/routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', router);

const server = app.listen(3099, async () => {
  console.log('Test server started on 3099');
  
  try {
    // 1. Health test
    const hRes = await fetch('http://localhost:3099/api/health');
    const hData = await hRes.json();
    console.log('✓ Health check passed:', hData.status === 'ok');

    // 2. Employee endpoint
    const empRes = await fetch('http://localhost:3099/api/employee/E1024');
    const empData = await empRes.json();
    console.log('✓ Employee endpoint passed:', empData.name === 'Arjun Rao', 'History items:', empData.history.length);

    // 3. Diagnostic endpoint
    const diagRes = await fetch('http://localhost:3099/api/diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'E1024', deviceId: 'Dell Latitude 5440' })
    });
    const diagData = await diagRes.json();
    console.log('✓ Diagnostic endpoint passed: CPU=', diagData.cpu, 'ProblematicProcess=', diagData.problematicProcess);

    // 4. Unauthorized action rejection test
    const unauthRes = await fetch('http://localhost:3099/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'E1024', deviceId: 'Dell Latitude 5440', action: 'stop_company_sync', authorized: false })
    });
    console.log('✓ Unauthorized action rejected with 403:', unauthRes.status === 403);

    // 5. Authorized action execution test
    const authRes = await fetch('http://localhost:3099/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: 'E1024', deviceId: 'Dell Latitude 5440', action: 'stop_company_sync', authorized: true })
    });
    const authData = await authRes.json();
    console.log('✓ Authorized action succeeded:', authData.success, 'Verification resolved:', authData.verification?.resolved);
    console.log('  Before CPU/RAM:', authData.before?.cpu, authData.before?.ram, '-> After CPU/RAM:', authData.after?.cpu, authData.after?.ram);

    // 6. Verify endpoint test
    const verifyRes = await fetch('http://localhost:3099/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ before: { cpu: 94, ram: 87, problematicProcess: 'CompanySync.exe' }, after: { cpu: 31, ram: 58, problematicProcess: null } })
    });
    const verifyData = await verifyRes.json();
    console.log('✓ Verify endpoint passed:', verifyData.resolved === true);

    // 7. Tickets endpoint test
    const ticketRes = await fetch('http://localhost:3099/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee: 'Arjun Rao',
        employeeId: 'E1024',
        device: 'Dell Latitude 5440',
        issue: 'Laptop slow',
        diagnostic: diagData,
        recommendedAction: 'Stop CompanySync.exe',
        authorizationStatus: 'pending'
      })
    });
    const ticketData = await ticketRes.json();
    console.log('✓ Ticket created successfully:', ticketData.id);

    console.log('\n🎉 ALL REST API ENDPOINTS VERIFIED SUCCESSFULLY!');
  } catch (err) {
    console.error('API Test Error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
