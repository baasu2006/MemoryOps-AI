import express from 'express';
import { getIncidents, getIncidentsByEmployeeId, addIncident } from '../data/incidents.js';
import { retainIncidentMemory } from '../memory/hindsight.js';

const router = express.Router();
let ticketSequence = 31;

router.get('/', (req, res) => {
  try {
    const { employeeId } = req.query;
    if (employeeId) {
      res.json(getIncidentsByEmployeeId(employeeId));
    } else {
      res.json(getIncidents());
    }
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/incidents
 * Creates a formal IT Escalation Ticket:
 * - Generates INC-2026-XXXX
 * - Captures employee, device, issue, diagnostic, previous incidents,
 *   actions attempted, action outcomes, authorization history, and current status.
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const ticketNumber = String(ticketSequence++).padStart(4, '0');
    const incidentId = `INC-2026-${ticketNumber}`;
    const timestamp = new Date().toISOString();

    const employeeId = data.employeeId || data.employee?.id || 'E1024';
    const employeeName = data.employeeName || data.employee?.name || data.employee || 'Arjun Rao';
    const device = data.device || 'Dell Latitude 5440';
    const os = data.os || data.operatingSystem || 'Windows 11';
    const issue = data.issue || data.description || 'Unresolved IT performance issue';

    const newTicket = {
      id: incidentId,
      ticketId: incidentId,
      employee: {
        id: employeeId,
        name: employeeName
      },
      employeeId,
      employeeName,
      device,
      os,
      issue,
      description: data.description || `IT Escalation Ticket: ${issue}`,
      diagnostic: data.diagnostic || data.diagnosticResults || null,
      diagnosticResults: data.diagnostic || data.diagnosticResults || null,
      previousIncidents: data.previousIncidents || data.previous_incidents || [],
      actionsAttempted: data.actionsAttempted || data.previousAttempts || (data.action ? [data.action] : []),
      actionOutcomes: data.actionOutcomes || data.troubleshootingAttempts || [],
      authorizationHistory: data.authorizationHistory || [
        {
          authorized: Boolean(data.authorizationStatus === 'authorized' || data.authorized),
          status: data.authorizationStatus || 'escalated',
          timestamp
        }
      ],
      currentStatus: data.currentStatus || data.status || 'OPEN_ESCALATED',
      priority: (data.diagnostic?.cpu > 90 || data.verificationFailures >= 2) ? 'HIGH' : 'MEDIUM',
      resolution: {
        resolved: false,
        resolvedBy: null,
        escalatedTo: 'Level-2 IT Engineering'
      },
      createdAt: timestamp
    };

    // Store in application incidents array
    addIncident(newTicket);

    // Retain escalation ticket in Hindsight Cloud
    try {
      console.log(`[Incidents API] Retaining escalation ticket ${incidentId} in Hindsight Cloud...`);
      await retainIncidentMemory({
        employeeId,
        employeeName,
        device,
        os,
        issue: `ESCALATION TICKET: ${issue}`,
        description: `Escalated to IT Engineering. Actions attempted: ${JSON.stringify(newTicket.actionsAttempted)}`,
        diagnosticResults: newTicket.diagnostic,
        troubleshootingAttempts: newTicket.actionOutcomes,
        authorization: { status: 'escalated' },
        resolution: { resolved: false },
        createdAt: timestamp
      });
    } catch (err) {
      console.warn('[Incidents API] Notice retaining escalation in Hindsight:', err.message);
    }

    console.log(`[Incidents API] Successfully created escalation ticket ${incidentId}`);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Create incident/ticket error:', error);
    res.status(500).json({ error: 'Failed to create IT escalation ticket', message: error.message });
  }
});

export default router;
