import express from 'express';
import { generateSupportDecision } from '../ai/supportAgent.js';
import { getEmployeeById } from '../data/employees.js';
import { getIncidentsByEmployeeId, getIncidents } from '../data/incidents.js';
import { recallRelevantMemories, reflectOnIncident } from '../memory/hindsight.js';
import { analyzeResolutions } from '../services/resolution.js';
import { runDiagnostic } from '../tools/diagnostic.js';

const router = express.Router();

const ACTION_DISPLAY_NAMES = {
  stop_company_sync: 'Stop CompanySync.exe',
  restart_device: 'Restart Device',
  clear_temp_files: 'Clear Temporary Files',
  reset_network: 'Reset Network',
  restart_outlook: 'Restart Outlook',
  reset_password: 'Reset Password'
};

/**
 * POST /api/chat
 * 
 * Request:
 * {
 *   "employeeId": "E1024",
 *   "message": "My laptop is slow"
 * }
 * 
 * Workflow:
 * 1. Load employee profile
 * 2. Recall Hindsight memories
 * 3. Run or request diagnostic when appropriate
 * 4. Generate structured AI support decision via Groq
 * 5. Return AI response, recalled memories, diagnostic, recommended action, and authorization requirements.
 */
router.post('/', async (req, res) => {
  try {
    const { message, employeeId } = req.body;

    if (!message || !employeeId) {
      return res.status(400).json({ error: 'Missing required parameters: message and employeeId' });
    }

    // 1. Load employee
    const employee = getEmployeeById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: `Employee ${employeeId} not found` });
    }

    console.log(`\n[POST /api/chat] Processing issue for ${employee.name} (${employee.id}) on ${employee.device}: "${message}"`);

    // 2. Recall Hindsight memories BEFORE generating recommendation
    let memories = [];
    let hindsightInsight = null;
    try {
      const memoryResponse = await recallRelevantMemories(employeeId, message, { maxTokens: 2048 });
      if (memoryResponse.success && Array.isArray(memoryResponse.memories)) {
        memories = memoryResponse.memories;
      }

      const reflectResponse = await reflectOnIncident(employeeId, message);
      if (reflectResponse.success) {
        hindsightInsight = reflectResponse.insight;
      }
    } catch (err) {
      console.warn('[POST /api/chat] Hindsight recall note:', err.message);
    }

    // 3. Run telemetry diagnostic for the reported issue
    console.log(`[POST /api/chat] Running diagnostic for device ${employee.device} (Issue: "${message}")...`);
    const diagnostic = runDiagnostic(employeeId, employee.device, message);
    console.log(`[POST /api/chat] Diagnostic result: CPU=${diagnostic.cpu}%, RAM=${diagnostic.ram}%, Process=${diagnostic.problematicProcess || 'None'}`);

    // 4. Load resolution history & stats
    const employeeIncidents = getIncidentsByEmployeeId(employeeId);
    const allIncidents = getIncidents();
    const resolutionStats = analyzeResolutions(allIncidents);

    // 5. Generate AI recommendation & support decision via Groq
    console.log('[POST /api/chat] Generating AI support decision via Groq support agent...');
    const decision = await generateSupportDecision({
      employee,
      issue: message,
      diagnostic,
      memories,
      resolutionHistory: employeeIncidents
    });

    console.log(`[POST /api/chat] Recommended Action: ${decision.recommended_action} (Requires Authorization: ${decision.requires_authorization})`);

    const actionKey = decision.recommended_action || 'restart_device';
    const actionDisplayName = ACTION_DISPLAY_NAMES[actionKey] || actionKey.replace(/_/g, ' ');

    // Match success rate from resolution statistics
    const matchingStat = resolutionStats.find(s => s.action === actionKey);
    const confidence = matchingStat ? matchingStat.successRate : 90;

    const recommendedActionPayload = {
      action: actionKey,
      displayName: actionDisplayName,
      reason: decision.reason,
      likelyCause: decision.likely_cause,
      confidence,
      basedOn: {
        previousIncidents: employeeIncidents.length,
        hindsightMemories: memories.length
      }
    };

    // Format chat message
    const formattedAiMessage = decision.summary ||
      `I analyzed the diagnostic and historical records for your ${employee.device}. ${decision.reason} I recommend executing: ${actionDisplayName}.`;

    // 6. Return response matching exact required schema
    res.json({
      // AI response object
      response: {
        message: formattedAiMessage,
        role: 'assistant'
      },
      // Structured AI decision
      decision,
      // Recalled memories
      memories,
      recalledMemories: memories,
      // Diagnostic results
      diagnostic,
      diagnostics: diagnostic,
      // Recommended action
      recommendedAction: recommendedActionPayload,
      recommendation: recommendedActionPayload,
      // Authorization requirement
      requiresAuthorization: decision.requires_authorization ?? true,
      requires_authorization: decision.requires_authorization ?? true,
      escalationRequired: decision.escalation_required ?? false,
      // Extended metadata for UI
      metadata: {
        memoriesFound: memories.length,
        memories: memories.slice(0, 5),
        hindsightInsight,
        recommendation: recommendedActionPayload,
        resolutionStats,
        diagnostics: diagnostic,
        employeeIncidentCount: employeeIncidents.length,
        previousIncidents: employeeIncidents.slice(-3).map(inc => ({
          id: inc.id,
          issue: inc.issue,
          resolved: inc.resolution?.resolved,
          resolvedBy: inc.resolution?.resolvedBy,
          date: inc.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('[POST /api/chat] Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || String(error)
    });
  }
});

export default router;
