import express from 'express';
import { applyFix, verifyResolution } from '../tools/itTools.js';
import { retainIncidentMemory } from '../memory/hindsight.js';
import { getEmployeeById } from '../data/employees.js';
import { addIncident } from '../data/incidents.js';

const router = express.Router();
const rejectionsStore = [];

const ACTION_RISKS = {
  stop_company_sync: 'The process will be temporarily stopped.',
  restart_device: 'Active user sessions and open unsaved files will be closed during system reboot.',
  clear_temp_files: 'Temporary application cache files will be deleted from disk.',
  reset_network: 'Active VPN tunnels and video calls will drop for ~5 seconds while adapter resets.',
  restart_outlook: 'Outlook application will close and reload Exchange synchronization.',
  reset_password: 'Active single sign-on sessions will be refreshed and require re-authentication.'
};

/**
 * POST /api/authorize
 * 
 * Strict Authorization Engine:
 * - Requires explicit employee approval.
 * - Rejections are recorded into incident memory without executing fixes.
 * - Approvals execute simulated remediation, run verification, and retain outcomes in Hindsight Cloud.
 */
router.post('/', async (req, res) => {
  try {
    const { employeeId, action, approved, reason, incidentContext } = req.body;

    if (!employeeId || !action) {
      return res.status(400).json({ error: 'Missing required parameters: employeeId and action' });
    }

    const employee = getEmployeeById(employeeId);
    const device = employee?.device || 'Unknown Device';
    const timestamp = new Date().toISOString();
    const risk = ACTION_RISKS[action] || 'The process will be temporarily stopped.';

    // 1. If approved === false (Rejection Flow)
    if (approved === false) {
      console.log(`[Authorization Guard] Action "${action}" was REJECTED by employee ${employeeId}. Remediation HALTED.`);
      
      const rejectionRecord = {
        id: `REJ-${Date.now()}`,
        employeeId,
        employeeName: employee?.name || 'Unknown',
        device,
        action,
        approved: false,
        rejectedAt: timestamp,
        reason: reason || 'Employee declined action authorization',
        risk
      };

      rejectionsStore.push(rejectionRecord);

      // Record rejection memory into Hindsight for adaptive learning
      try {
        await retainIncidentMemory({
          employeeId,
          employeeName: employee?.name,
          device,
          os: employee?.os,
          issue: `Action proposal for ${action} was rejected by employee`,
          description: `Employee explicitly rejected remediation action: ${action}. Reason: ${reason || 'User opted out'}`,
          actionExecuted: 'none_rejected',
          authorization: { authorized: false, status: 'rejected' },
          resolution: { resolved: false, resolvedBy: null },
          createdAt: timestamp
        });
      } catch (e) {
        console.warn('[Authorization] Notice storing rejection memory:', e.message);
      }

      return res.json({
        authorized: false,
        approved: false,
        action,
        risk,
        message: 'Action rejected. No remediation executed.',
        rejectionRecorded: true,
        escalationPrompt: 'Would you like to escalate this issue and create an IT ticket?'
      });
    }

    // 2. If approved === true (Authorized Execution Flow)
    console.log(`[Authorization Guard] Explicit authorization confirmed for "${action}" by employee ${employeeId}. Proceeding with remediation...`);

    // Step 3: Execute simulated action
    const fixResult = applyFix(employeeId, device, action);
    console.log(`[Authorization Guard] applyFix executed. CPU: ${fixResult.before.cpu}% -> ${fixResult.after.cpu}%, RAM: ${fixResult.before.ram}% -> ${fixResult.after.ram}%`);

    // Step 4: Verify resolution
    const verification = verifyResolution(fixResult.before, fixResult.after);
    console.log(`[Authorization Guard] verifyResolution executed. Resolved: ${verification.resolved}`);

    // Step 5: Retain complete outcome in Hindsight Cloud
    const incidentId = `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    const incidentRecord = {
      id: incidentId,
      employeeId,
      employeeName: employee?.name || 'Unknown',
      device,
      os: employee?.os || 'Unknown',
      issue: incidentContext?.issue || `Performance issue on ${device}`,
      description: incidentContext?.description || `Authorized IT remediation: ${action}`,
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
        approved: true,
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

    let memoryStored = false;
    try {
      console.log(`[Authorization Guard] Retaining resolved incident ${incidentId} into Hindsight Cloud...`);
      const retainRes = await retainIncidentMemory(incidentRecord);
      memoryStored = retainRes.success;
    } catch (err) {
      console.warn('[Authorization Guard] Hindsight retention notice:', err.message);
    }

    // Append to local incident state
    addIncident(incidentRecord);

    // Step 6: Return structured response
    res.json({
      authorized: true,
      approved: true,
      action,
      risk,
      before: fixResult.before,
      after: fixResult.after,
      resolved: verification.resolved,
      memoryStored,
      verification,
      details: fixResult.details,
      incidentId
    });

  } catch (error) {
    console.error('[Authorization Guard] Error executing authorization:', error);
    res.status(500).json({
      error: 'Authorization execution failed',
      message: error.message || String(error)
    });
  }
});

export default router;
