import express from 'express';
import { applyFix, verifyResolution } from '../tools/diagnostic.js';
import { retainIncidentMemory } from '../memory/hindsight.js';
import { getEmployeeById } from '../data/employees.js';
import { addIncident } from '../data/incidents.js';

const router = express.Router();

// POST /api/action — Execute an authorized IT action
router.post('/', async (req, res) => {
  try {
    const { employeeId, deviceId, action, authorized, incidentContext } = req.body;

    // CRITICAL: Reject unauthorized actions
    if (authorized !== true) {
      return res.status(403).json({
        error: 'Action not authorized',
        message: 'Employee authorization is required before executing any action.'
      });
    }

    if (!employeeId || !action) {
      return res.status(400).json({ error: 'Missing employeeId or action' });
    }

    const employee = getEmployeeById(employeeId);
    const device = deviceId || employee?.device || 'Unknown';

    // Execute the fix
    const fixResult = applyFix(employeeId, device, action);

    // Verify the resolution
    const verification = verifyResolution(fixResult.before, fixResult.after);

    // Build complete incident record for Hindsight
    const incidentId = `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const incidentRecord = {
      id: incidentId,
      employeeId,
      employeeName: employee?.name || 'Unknown',
      device,
      os: employee?.os || 'Unknown',
      issue: incidentContext?.issue || `Performance issue - ${action.replace(/_/g, ' ')}`,
      description: incidentContext?.description || `Action executed: ${action}`,
      diagnosticResults: fixResult.before,
      beforeMetrics: fixResult.before,
      afterMetrics: fixResult.after,
      troubleshootingAttempts: [
        ...(incidentContext?.previousAttempts || []),
        {
          action,
          result: verification.resolved ? 'success' : 'failure',
          details: fixResult.details
        }
      ],
      failedActions: (incidentContext?.previousAttempts || [])
        .filter(a => a.result === 'failure')
        .map(a => a.action),
      successfulActions: verification.resolved ? [action] : [],
      authorization: {
        authorized: true,
        authorizedAt: timestamp,
        authorizedBy: employeeId
      },
      actionExecuted: action,
      verificationResult: verification,
      resolution: {
        resolved: verification.resolved,
        resolvedBy: verification.resolved ? action : null,
        timestamp: verification.resolved ? timestamp : null
      },
      createdAt: timestamp
    };

    // Store in Hindsight memory
    let hindsightResult = { success: false };
    try {
      console.log(`[Action API] Storing resolved incident ${incidentId} into Hindsight Cloud...`);
      hindsightResult = await retainIncidentMemory(incidentRecord);
    } catch (err) {
      console.warn('[Action API] Failed to store in Hindsight:', err.message);
    }

    // Also store in local repository
    addIncident(incidentRecord);

    res.json({
      success: fixResult.success,
      incidentId,
      action,
      details: fixResult.details,
      before: fixResult.before,
      after: fixResult.after,
      verification,
      storedInHindsight: hindsightResult.success,
      hindsightRetainedContent: hindsightResult.content || null,
      incident: incidentRecord
    });
  } catch (error) {
    console.error('Action execution error:', error);
    res.status(500).json({ error: 'Failed to execute action' });
  }
});

export default router;
