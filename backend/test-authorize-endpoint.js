import express from 'express';
import cors from 'cors';
import router from './src/routes/index.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);

const server = app.listen(3098, async () => {
  console.log('Test server started on 3098 for Authorization testing');

  try {
    // 1. Test Rejection (approved: false)
    console.log('\n--- 1. Testing Rejection (approved: false) ---');
    const rejRes = await fetch('http://localhost:3098/api/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'E1024',
        action: 'stop_company_sync',
        approved: false,
        reason: 'Employee wanted to keep CompanySync running'
      })
    });
    const rejData = await rejRes.json();
    console.log('Rejection response:', rejData);
    if (rejData.authorized !== false || rejData.rejectionRecorded !== true) {
      throw new Error('Rejection handling failed');
    }

    // 2. Test Approval & Execution (approved: true)
    console.log('\n--- 2. Testing Approval (approved: true) ---');
    const appRes = await fetch('http://localhost:3098/api/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'E1024',
        action: 'stop_company_sync',
        approved: true
      })
    });
    const appData = await appRes.json();
    console.log('Approval response:', JSON.stringify(appData, null, 2));

    // Verify response schema
    if (appData.authorized !== true || appData.action !== 'stop_company_sync') {
      throw new Error('Authorization response fields mismatch');
    }

    if (appData.before?.cpu !== 94 || appData.before?.ram !== 87 || appData.after?.cpu !== 31 || appData.after?.ram !== 58) {
      throw new Error('Before/after metrics mismatch on authorization execution');
    }

    if (appData.resolved !== true) {
      throw new Error('Expected resolved: true');
    }

    if (!('memoryStored' in appData)) {
      throw new Error('Missing memoryStored flag in response');
    }

    console.log('\n✅ ALL AUTHORIZATION API TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
