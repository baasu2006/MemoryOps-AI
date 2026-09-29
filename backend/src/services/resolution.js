/**
 * Resolution Intelligence Service
 * Analyzes historical incident data to compute action success rates
 * and generate data-driven recommendations.
 */

const ACTION_DISPLAY_NAMES = {
  restart_device: 'Restart Device',
  clear_temp_files: 'Clear Temporary Files',
  stop_company_sync: 'Stop CompanySync.exe',
  reset_network: 'Reset Network',
  restart_outlook: 'Restart Outlook',
  reset_password: 'Reset Password'
};

export function analyzeResolutions(incidents) {
  const stats = {};

  incidents.forEach(inc => {
    if (inc.troubleshootingAttempts && inc.troubleshootingAttempts.length > 0) {
      inc.troubleshootingAttempts.forEach(attempt => {
        const key = attempt.action;
        if (!stats[key]) {
          stats[key] = {
            action: key,
            displayName: ACTION_DISPLAY_NAMES[key] || key.replace(/_/g, ' '),
            attempts: 0,
            successes: 0,
            failures: 0
          };
        }
        stats[key].attempts += 1;
        if (attempt.result === 'success') {
          stats[key].successes += 1;
        } else {
          stats[key].failures += 1;
        }
      });
    }
  });

  return Object.values(stats)
    .map(stat => ({
      ...stat,
      successRate: stat.attempts > 0 ? Math.round((stat.successes / stat.attempts) * 100) : 0
    }))
    .sort((a, b) => b.successRate - a.successRate);
}

export function getRecommendation(employeeId, issue, incidents, hindsightMemories) {
  const issueLower = (issue || '').toLowerCase();
  
  // Filter incidents relevant to this type of issue
  const relevantIncidents = incidents.filter(inc => {
    const incIssueLower = (inc.issue || '').toLowerCase();
    // Match by similar issue keywords
    if (issueLower.includes('slow') && incIssueLower.includes('slow')) return true;
    if (issueLower.includes('vpn') && incIssueLower.includes('vpn')) return true;
    if (issueLower.includes('wifi') || issueLower.includes('wi-fi')) {
      return incIssueLower.includes('wi-fi') || incIssueLower.includes('wifi') || incIssueLower.includes('disconnected');
    }
    if (issueLower.includes('outlook') && incIssueLower.includes('outlook')) return true;
    if (issueLower.includes('crash') && incIssueLower.includes('crash')) return true;
    if (issueLower.includes('printer') && incIssueLower.includes('printer')) return true;
    if (issueLower.includes('password') || issueLower.includes('login')) {
      return incIssueLower.includes('password') || incIssueLower.includes('login');
    }
    return false;
  });

  // Get employee-specific resolved incidents
  const employeeResolved = incidents.filter(
    inc => inc.employeeId === employeeId && inc.resolution?.resolved
  );

  // Analyze what worked for this specific issue type
  const issueStats = analyzeResolutions(relevantIncidents);
  
  // Analyze what worked for this specific employee
  const employeeStats = analyzeResolutions(employeeResolved);

  // Find successful actions from Hindsight memories
  let hindsightRecommendation = null;
  if (hindsightMemories && hindsightMemories.length > 0) {
    for (const memory of hindsightMemories) {
      try {
        const memContent = typeof memory.content === 'string' ? JSON.parse(memory.content) : memory.content;
        if (memContent?.resolution?.resolved && memContent?.resolution?.resolvedBy) {
          hindsightRecommendation = memContent.resolution.resolvedBy;
          break;
        }
      } catch (e) {
        // Memory content not parseable, skip
      }
    }
  }

  // Priority 1: If hindsight recalls a specific successful fix for this employee + issue
  if (hindsightRecommendation) {
    const matchingStat = issueStats.find(s => s.action === hindsightRecommendation);
    return {
      recommendedAction: hindsightRecommendation,
      displayName: ACTION_DISPLAY_NAMES[hindsightRecommendation] || hindsightRecommendation.replace(/_/g, ' '),
      reason: `This action successfully resolved a similar previous incident for this employee. Hindsight memory confirms prior success.`,
      confidence: matchingStat ? Math.min(98, matchingStat.successRate + 10) : 90,
      basedOn: {
        previousIncidents: relevantIncidents.length,
        hindsightMemories: hindsightMemories?.length || 0,
        source: 'hindsight_memory'
      },
      resolutionStats: issueStats
    };
  }

  // Priority 2: Best action from employee's history for this issue type
  const employeeIssueHistory = incidents.filter(
    inc => inc.employeeId === employeeId && 
    inc.issue?.toLowerCase().includes(issueLower.includes('slow') ? 'slow' : issueLower.split(' ')[0])
  );
  
  if (employeeIssueHistory.length > 0) {
    const empIssueStats = analyzeResolutions(employeeIssueHistory);
    const bestEmpAction = empIssueStats.find(s => s.successRate > 0);
    if (bestEmpAction) {
      return {
        recommendedAction: bestEmpAction.action,
        displayName: bestEmpAction.displayName,
        reason: `This action has a ${bestEmpAction.successRate}% success rate for similar issues on this employee's device. Based on ${bestEmpAction.attempts} previous attempt(s).`,
        confidence: bestEmpAction.successRate,
        basedOn: {
          previousIncidents: employeeIssueHistory.length,
          hindsightMemories: hindsightMemories?.length || 0,
          source: 'employee_history'
        },
        resolutionStats: issueStats
      };
    }
  }

  // Priority 3: Best action from all similar issues across the org
  if (issueStats.length > 0) {
    const bestOrgAction = issueStats[0]; // Already sorted by success rate
    return {
      recommendedAction: bestOrgAction.action,
      displayName: bestOrgAction.displayName,
      reason: `Based on ${bestOrgAction.attempts} cases across the organization, this action has a ${bestOrgAction.successRate}% success rate for similar issues.`,
      confidence: Math.max(60, bestOrgAction.successRate - 10),
      basedOn: {
        previousIncidents: relevantIncidents.length,
        hindsightMemories: hindsightMemories?.length || 0,
        source: 'organization_data'
      },
      resolutionStats: issueStats
    };
  }

  // Fallback
  return {
    recommendedAction: 'restart_device',
    displayName: 'Restart Device',
    reason: 'No historical data available for this issue type. Restart is the general first-line resolution.',
    confidence: 50,
    basedOn: {
      previousIncidents: 0,
      hindsightMemories: hindsightMemories?.length || 0,
      source: 'default_fallback'
    },
    resolutionStats: analyzeResolutions(incidents)
  };
}
