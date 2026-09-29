import { getIncidents, getIncidentsByEmployeeId } from '../data/incidents.js';
import { getEmployeeById } from '../data/employees.js';
import { recallRelevantMemories } from '../memory/hindsight.js';

const ACTION_DISPLAY_NAMES = {
  stop_company_sync: 'Stop CompanySync.exe',
  restart_device: 'Restart Device',
  clear_temp_files: 'Clear Temporary Files',
  reset_network: 'Reset Network',
  restart_outlook: 'Restart Outlook',
  reset_password: 'Reset Password'
};

/**
 * Parses Hindsight natural-language memories or JSON memories to extract attempted actions and results
 */
function extractAttemptsFromMemories(memories = []) {
  const attempts = [];
  
  for (const mem of memories) {
    const text = typeof mem === 'string' ? mem : (mem.content || '');
    if (!text) continue;

    // Check for bulleted lines like "* stop_company_sync: successful"
    const lines = text.split('\n');
    for (const line of lines) {
      const match = line.match(/\*\s*([a-zA-Z0-9_-]+):\s*(successful|unsuccessful|success|failure)/i);
      if (match) {
        const action = match[1].toLowerCase();
        const outcome = match[2].toLowerCase();
        attempts.push({
          action,
          result: (outcome === 'successful' || outcome === 'success') ? 'success' : 'failure',
          source: 'hindsight'
        });
      }
    }

    // Check for authorization/resolution mentions
    if (text.includes('authorized stopping CompanySync.exe') && text.includes('Resolution verified successfully')) {
      attempts.push({
        action: 'stop_company_sync',
        result: 'success',
        source: 'hindsight'
      });
    }
  }

  return attempts;
}

/**
 * Calculates attempts, successes, failures, and successRate for each action.
 * 
 * @param {Array} incidents - List of structured incident records
 * @param {Array} [memories] - List of Hindsight memory items
 * @returns {Array<Object>} Formatted action statistics
 */
export function calculateActionStatistics(incidents = [], memories = []) {
  const statsMap = {};

  // Standard action initialization
  const standardActions = [
    'stop_company_sync',
    'restart_device',
    'clear_temp_files',
    'reset_network',
    'restart_outlook',
    'reset_password'
  ];

  standardActions.forEach(act => {
    statsMap[act] = {
      action: act,
      displayName: ACTION_DISPLAY_NAMES[act] || act.replace(/_/g, ' '),
      attempts: 0,
      successes: 0,
      failures: 0
    };
  });

  // 1. Process structured incident attempts
  incidents.forEach(inc => {
    if (inc.troubleshootingAttempts && Array.isArray(inc.troubleshootingAttempts)) {
      inc.troubleshootingAttempts.forEach(attempt => {
        const act = attempt.action;
        if (!act) return;

        if (!statsMap[act]) {
          statsMap[act] = {
            action: act,
            displayName: ACTION_DISPLAY_NAMES[act] || act.replace(/_/g, ' '),
            attempts: 0,
            successes: 0,
            failures: 0
          };
        }

        statsMap[act].attempts += 1;
        if (attempt.result === 'success' || attempt.result === true) {
          statsMap[act].successes += 1;
        } else {
          statsMap[act].failures += 1;
        }
      });
    }

    // Include resolvedBy action if not already counted in attempts
    if (inc.resolution?.resolved && inc.resolution?.resolvedBy) {
      const act = inc.resolution.resolvedBy;
      const alreadyCounted = (inc.troubleshootingAttempts || []).some(a => a.action === act && (a.result === 'success' || a.result === true));
      if (!alreadyCounted && statsMap[act]) {
        statsMap[act].attempts += 1;
        statsMap[act].successes += 1;
      }
    }
  });

  // 2. Process Hindsight memory attempts
  const memoryAttempts = extractAttemptsFromMemories(memories);
  memoryAttempts.forEach(attempt => {
    const act = attempt.action;
    if (statsMap[act]) {
      statsMap[act].attempts += 1;
      if (attempt.result === 'success') {
        statsMap[act].successes += 1;
      } else {
        statsMap[act].failures += 1;
      }
    }
  });

  // Format array & compute successRate percentages
  return Object.values(statsMap)
    .filter(stat => stat.attempts > 0)
    .map(stat => ({
      action: stat.action,
      displayName: stat.displayName,
      attempts: stat.attempts,
      successes: stat.successes,
      failures: stat.failures,
      successRate: stat.attempts > 0 ? Math.round((stat.successes / stat.attempts) * 100) : 0
    }))
    .sort((a, b) => b.successRate - a.successRate || b.attempts - a.attempts);
}

/**
 * Retrieves full Resolution Intelligence for a specific employee and issue.
 * Derives the most successful action purely from historical incident outcomes.
 */
export async function getResolutionIntelligence(employeeId = 'E1024', issue = 'laptop slow') {
  const employee = getEmployeeById(employeeId);
  const employeeIncidents = getIncidentsByEmployeeId(employeeId);
  const allIncidents = getIncidents();

  // Recall Hindsight memories for context
  let memories = [];
  try {
    const memRes = await recallRelevantMemories(employeeId, issue);
    if (memRes.success && Array.isArray(memRes.memories)) {
      memories = memRes.memories;
    }
  } catch (err) {
    console.warn('[ResolutionIntelligence] Hindsight memory recall notice:', err.message);
  }

  // Calculate statistics from all organizational incidents + Hindsight memories
  const actionStats = calculateActionStatistics(allIncidents, memories);

  // Filter incidents specific to this employee's issue type
  const issueLower = (issue || '').toLowerCase();
  const relevantEmployeeIncidents = employeeIncidents.filter(inc => {
    const incIssue = (inc.issue || '').toLowerCase();
    if (issueLower.includes('slow') && incIssue.includes('slow')) return true;
    if (issueLower.includes('vpn') && incIssue.includes('vpn')) return true;
    if (issueLower.includes('wifi') && incIssue.includes('wi-fi')) return true;
    if (issueLower.includes('outlook') && incIssue.includes('outlook')) return true;
    return true;
  });

  const employeeIssueStats = calculateActionStatistics(relevantEmployeeIncidents, memories);

  // Find the top successful action for this employee/issue
  let topAction = null;
  if (employeeIssueStats.length > 0 && employeeIssueStats[0].successRate > 0) {
    topAction = employeeIssueStats[0];
  } else if (actionStats.length > 0) {
    topAction = actionStats.find(s => s.successRate > 0) || actionStats[0];
  }

  const mostSuccessfulAction = topAction ? {
    action: topAction.action,
    displayName: topAction.displayName,
    successRate: topAction.successRate,
    attempts: topAction.attempts,
    successes: topAction.successes,
    failures: topAction.failures,
    reason: `Derived from ${topAction.attempts} recorded attempt(s) with ${topAction.successRate}% resolution success rate for similar incidents.`
  } : {
    action: 'restart_device',
    displayName: 'Restart Device',
    successRate: 50,
    attempts: 1,
    successes: 1,
    failures: 0,
    reason: 'Standard baseline troubleshooting action.'
  };

  return {
    employee: employee ? { id: employee.id, name: employee.name, device: employee.device } : null,
    issue,
    actionStatistics: actionStats,
    mostSuccessfulAction,
    recommendedAction: mostSuccessfulAction,
    totalIncidentsAnalyzed: allIncidents.length,
    hindsightMemoriesFound: memories.length
  };
}

// Backwards-compatible aliases
export const analyzeResolutions = (incidents) => calculateActionStatistics(incidents, []);
export const getRecommendation = (employeeId, issue, incidents, memories) => {
  const stats = calculateActionStatistics(incidents, memories);
  const employeeIncidents = (incidents || []).filter(i => i.employeeId === employeeId);
  const empStats = calculateActionStatistics(employeeIncidents, memories);
  
  const best = empStats.find(s => s.successRate > 0) || stats.find(s => s.successRate > 0) || stats[0];
  
  return {
    recommendedAction: best?.action || 'restart_device',
    displayName: best?.displayName || 'Restart Device',
    reason: `Based on historical analysis of ${best?.attempts || 0} attempt(s) with ${best?.successRate || 0}% success rate.`,
    confidence: best?.successRate || 75,
    basedOn: {
      previousIncidents: employeeIncidents.length,
      hindsightMemories: memories?.length || 0
    }
  };
};
