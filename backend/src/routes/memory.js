import express from 'express';
import {
  retainIncidentMemory,
  recallRelevantMemories,
  reflectOnIncident,
  getEmployeeMemory,
  getMemories
} from '../memory/hindsight.js';

const router = express.Router();

/**
 * GET /api/memory/test
 * Dedicated test endpoint to verify Hindsight Cloud integration:
 * 1. Retain a test memory
 * 2. Recall the test memory
 * 3. Return results
 */
router.get('/test', async (req, res) => {
  console.log('\n[API] Running Hindsight Cloud Integration Test (/api/memory/test)...');
  const testId = `TEST-${Date.now()}`;
  
  const testIncident = {
    id: testId,
    employeeId: 'E1024',
    employeeName: 'Arjun Rao',
    device: 'Dell Latitude 5440',
    os: 'Windows 11',
    issue: 'severe laptop slowdown during video calls',
    description: 'Automated test incident verification for Hindsight Cloud integration.',
    diagnosticResults: { cpu: 94, ram: 87, disk: 72, problematicProcess: 'CompanySync.exe' },
    troubleshootingAttempts: [
      { action: 'restart_device', result: 'failure' },
      { action: 'clear_temp_files', result: 'failure' },
      { action: 'stop_company_sync', result: 'success' }
    ],
    failedActions: ['restart_device', 'clear_temp_files'],
    successfulActions: ['stop_company_sync'],
    authorization: { authorized: true },
    actionExecuted: 'stop_company_sync',
    beforeMetrics: { cpu: 94, ram: 87 },
    afterMetrics: { cpu: 31, ram: 58 },
    resolution: { resolved: true, resolvedBy: 'stop_company_sync', timestamp: new Date().toISOString() },
    verificationResult: { resolved: true, improvement: { cpu: { before: 94, after: 31, change: 63 } } },
    createdAt: new Date().toISOString()
  };

  const startTime = Date.now();

  try {
    // 1. Retain
    console.log('[API Test] Step 1: Retaining test incident memory in Hindsight...');
    const retainResult = await retainIncidentMemory(testIncident);

    // 2. Recall
    console.log('[API Test] Step 2: Recalling test incident memory from Hindsight...');
    const recallResult = await recallRelevantMemories('E1024', 'laptop slowdown CompanySync.exe');

    // 3. Reflect (optional enhancement)
    console.log('[API Test] Step 3: Testing reflection synthesis...');
    const reflectResult = await reflectOnIncident('E1024', 'laptop slowdown');

    const durationMs = Date.now() - startTime;

    res.json({
      status: retainResult.success && recallResult.success ? 'success' : 'partial_or_offline',
      testId,
      durationMs,
      steps: {
        "step_1_retain": {
          success: retainResult.success,
          retainedContent: retainResult.content,
          metadata: retainResult.metadata,
          raw: retainResult.data || retainResult.error
        },
        "step_2_recall": {
          success: recallResult.success,
          memoriesFound: recallResult.memories?.length || 0,
          memories: recallResult.memories || [],
          raw: recallResult.raw || recallResult.error
        },
        "step_3_reflect": {
          success: reflectResult.success,
          insight: reflectResult.insight || reflectResult.error
        }
      },
      message: retainResult.success
        ? 'Hindsight Cloud communication verified successfully!'
        : 'Hindsight test completed. Note: Check HINDSIGHT_API_KEY if testing live cloud operations.'
    });
  } catch (error) {
    console.error('[API Test] Error during Hindsight test:', error);
    res.status(500).json({
      status: 'error',
      error: error.message || String(error),
      durationMs: Date.now() - startTime
    });
  }
});

/**
 * GET /api/memory
 * Query memories by employeeId or keyword search
 */
router.get('/', async (req, res) => {
  try {
    const { query, employeeId } = req.query;

    if (query) {
      const result = await recallRelevantMemories(employeeId || 'all', query);
      return res.json(result.memories || []);
    } else if (employeeId) {
      const result = await getEmployeeMemory(employeeId);
      return res.json(result.memories || []);
    } else {
      const result = await getMemories();
      return res.json(result.memories || []);
    }
  } catch (error) {
    console.error('Memory endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/memory/reflect
 * Query Hindsight reflect endpoint
 */
router.get('/reflect', async (req, res) => {
  try {
    const { employeeId = 'E1024', issue = 'laptop slowness' } = req.query;
    const result = await reflectOnIncident(employeeId, issue);
    res.json(result);
  } catch (error) {
    console.error('Memory reflect endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
