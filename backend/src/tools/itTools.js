/**
 * Simulated IT Support Tools Module
 * 
 * Provides safe simulated IT diagnostics, fixes, resolution verification, and ticketing.
 * NOTE: All actions are purely simulated in memory and never execute actual OS commands.
 */

let ticketCounter = 1;
const ticketsStore = [];

/**
 * 1. runDiagnostic(employeeId, deviceId, issue)
 * Returns realistic simulated system diagnostic telemetry based on reported issue.
 */
export function runDiagnostic(employeeId, deviceId, issue = '') {
  const issueLower = (issue || '').toLowerCase();
  const timestamp = new Date().toISOString();

  // 1. VPN / Corporate Network / Video Call Latency
  if (issueLower.includes('vpn') || issueLower.includes('latency') || issueLower.includes('teams') || issueLower.includes('packet')) {
    return {
      cpu: 24,
      ram: 52,
      disk: 48,
      problematicProcess: 'Stale VPN Routing Table & Gateway Latency',
      networkLatency: 380,
      uptimeDays: 5,
      tempFilesMB: 420,
      runningProcesses: 98,
      timestamp
    };
  }

  // 2. Wi-Fi & Internet Connectivity
  if (issueLower.includes('wifi') || issueLower.includes('wi-fi') || issueLower.includes('internet') || issueLower.includes('dns')) {
    return {
      cpu: 18,
      ram: 46,
      disk: 42,
      problematicProcess: 'DHCP Lease Expired & DNS Timeout',
      networkLatency: 420,
      uptimeDays: 3,
      tempFilesMB: 280,
      runningProcesses: 88,
      timestamp
    };
  }

  // 3. Outlook & Exchange Synchronization
  if (issueLower.includes('outlook') || issueLower.includes('mail') || issueLower.includes('exchange') || issueLower.includes('inbox')) {
    return {
      cpu: 38,
      ram: 68,
      disk: 52,
      problematicProcess: 'OUTLOOK.EXE (MAPI Sync Thread Hung)',
      networkLatency: 35,
      uptimeDays: 7,
      tempFilesMB: 940,
      runningProcesses: 112,
      timestamp
    };
  }

  // 4. Software Crash / App Freezing / Cache Bloat
  if (issueLower.includes('crash') || issueLower.includes('excel') || issueLower.includes('software') || issueLower.includes('bloat')) {
    return {
      cpu: 58,
      ram: 78,
      disk: 88,
      problematicProcess: 'Corrupted Application Cache (4.8 GB)',
      networkLatency: 28,
      uptimeDays: 9,
      tempFilesMB: 4800,
      runningProcesses: 125,
      timestamp
    };
  }

  // 5. Login / MFA / Authentication / Password
  if (issueLower.includes('login') || issueLower.includes('mfa') || issueLower.includes('password') || issueLower.includes('auth') || issueLower.includes('sso') || issueLower.includes('account')) {
    return {
      cpu: 16,
      ram: 42,
      disk: 38,
      problematicProcess: 'Kerberos Ticket Deadlock & MFA Token Expired',
      networkLatency: 22,
      uptimeDays: 4,
      tempFilesMB: 180,
      runningProcesses: 82,
      timestamp
    };
  }

  // 6. Printer & Print Spooler
  if (issueLower.includes('printer') || issueLower.includes('print') || issueLower.includes('spooler') || issueLower.includes('queue')) {
    return {
      cpu: 26,
      ram: 48,
      disk: 44,
      problematicProcess: 'spoolsv.exe (Print Spooler Jammed)',
      networkLatency: 18,
      uptimeDays: 6,
      tempFilesMB: 310,
      runningProcesses: 92,
      timestamp
    };
  }

  // 7. Browser Memory Leak & Tab Freezing
  if (issueLower.includes('browser') || issueLower.includes('chrome') || issueLower.includes('tab')) {
    return {
      cpu: 64,
      ram: 92,
      disk: 68,
      problematicProcess: 'Browser Memory Leak (3.2 GB Cached)',
      networkLatency: 32,
      uptimeDays: 11,
      tempFilesMB: 3200,
      runningProcesses: 154,
      timestamp
    };
  }

  // 8. Device Sluggishness / Extreme Uptime
  if (issueLower.includes('uptime') || issueLower.includes('sluggish') || issueLower.includes('boot')) {
    return {
      cpu: 72,
      ram: 89,
      disk: 66,
      problematicProcess: 'Zombie Background Threads (34 Days Uptime)',
      networkLatency: 40,
      uptimeDays: 34,
      tempFilesMB: 1600,
      runningProcesses: 218,
      timestamp
    };
  }

  // 9. Default / Laptop Performance / Slow CPU (e.g. E1024 baseline)
  return {
    cpu: 94,
    ram: 87,
    disk: 72,
    problematicProcess: 'CompanySync.exe',
    networkLatency: 45,
    uptimeDays: 14,
    tempFilesMB: 1200,
    runningProcesses: 142,
    timestamp
  };
}

/**
 * 2. applyFix(employeeId, deviceId, action, beforeState)
 * Executes a simulated IT remediation action across any of the 10 problem types.
 */
export function applyFix(employeeId, deviceId, action, beforeState = null) {
  const before = beforeState || runDiagnostic(employeeId, deviceId, action);
  const after = JSON.parse(JSON.stringify(before));
  let success = false;
  let details = '';

  switch (action) {
    case 'stop_company_sync':
      after.cpu = 31;
      after.ram = 58;
      after.problematicProcess = null;
      success = true;
      details = 'Successfully terminated CompanySync.exe background process. System CPU dropped from 94% to 31% and RAM from 87% to 58%.';
      break;

    case 'reset_network':
      after.networkLatency = 14;
      after.problematicProcess = null;
      success = true;
      details = 'Network interface reset, DNS cache flushed, DHCP lease renewed, and corporate routing table restored.';
      break;

    case 'restart_outlook':
      after.cpu = Math.min(22, before.cpu);
      after.ram = Math.min(48, before.ram);
      after.problematicProcess = null;
      success = true;
      details = 'Outlook background process restarted. MAPI Exchange synchronization thread re-established successfully.';
      break;

    case 'clear_temp_files':
      after.tempFilesMB = 0;
      after.disk = Math.max(45, before.disk - 26);
      after.ram = Math.max(48, before.ram - 24);
      after.problematicProcess = null;
      success = true;
      details = `Purged ${before.tempFilesMB || 4800} MB of corrupted temporary cache files. Application memory and disk normalized.`;
      break;

    case 'reset_password':
    case 'reset_auth':
      after.problematicProcess = null;
      success = true;
      details = 'Kerberos authentication ticket refreshed, SSO session cleared, and MFA authentication token reissued.';
      break;

    case 'restart_device':
      if (employeeId === 'E1024' && before.problematicProcess === 'CompanySync.exe') {
        after.uptimeDays = 0;
        after.cpu = 92;
        after.ram = 85;
        after.problematicProcess = 'CompanySync.exe';
        success = false;
        details = 'Device restarted. However, CompanySync.exe launched on startup and CPU usage immediately rebounded to 92%.';
      } else {
        after.uptimeDays = 0;
        after.cpu = Math.max(18, Math.floor(before.cpu * 0.35));
        after.ram = Math.max(38, Math.floor(before.ram * 0.5));
        after.problematicProcess = null;
        success = true;
        details = 'Device restarted successfully. System uptime reset to 0 days, zombie processes cleared, and memory freed.';
      }
      break;

    default:
      after.problematicProcess = null;
      success = true;
      details = `Executed simulated remediation action "${action}" successfully.`;
      break;
  }

  return {
    success,
    action,
    employeeId,
    deviceId,
    before,
    after,
    details,
    executedAt: new Date().toISOString()
  };
}

/**
 * 3. verifyResolution(before, after)
 * Evaluates whether system metrics and operational state have normalized.
 */
export function verifyResolution(before, after) {
  if (!before || !after) {
    return {
      resolved: false,
      reason: 'Incomplete metric data for verification.',
      improvement: null
    };
  }

  const cpuBefore = before.cpu ?? 0;
  const cpuAfter = after.cpu ?? 0;
  const ramBefore = before.ram ?? 0;
  const ramAfter = after.ram ?? 0;

  const cpuChange = cpuBefore - cpuAfter;
  const ramChange = ramBefore - ramAfter;

  const processEliminated = before.problematicProcess && !after.problematicProcess;
  const latencyImproved = (before.networkLatency || 0) > 100 && (after.networkLatency || 0) <= 50;
  const tempFilesPurged = (before.tempFilesMB || 0) > 1000 && (after.tempFilesMB || 0) === 0;
  const uptimeReset = (before.uptimeDays || 0) > 14 && (after.uptimeDays || 0) === 0;
  const significantImprovement = cpuChange >= 25 || ramChange >= 20 || latencyImproved || tempFilesPurged || uptimeReset;

  let resolved = false;
  let reason = '';

  if (processEliminated) {
    resolved = true;
    reason = `Problematic process/state (${before.problematicProcess}) eliminated and system state verified normal.`;
  } else if (latencyImproved) {
    resolved = true;
    reason = `Network latency decreased from ${before.networkLatency}ms to ${after.networkLatency}ms. Interface verified online.`;
  } else if (tempFilesPurged) {
    resolved = true;
    reason = `Purged corrupted cache files. Disk utilization reduced from ${before.disk}% to ${after.disk}%.`;
  } else if (uptimeReset && cpuAfter <= 60) {
    resolved = true;
    reason = `System reboot completed. Uptime reset and memory utilization normalized.`;
  } else if (significantImprovement) {
    resolved = true;
    reason = `Resource metrics significantly improved (CPU: ${cpuBefore}% -> ${cpuAfter}%, RAM: ${ramBefore}% -> ${ramAfter}%).`;
  } else if (after.problematicProcess) {
    resolved = false;
    reason = `Problematic state (${after.problematicProcess}) is still active.`;
  } else {
    resolved = true;
    reason = 'System metrics verified within normal enterprise operating parameters.';
  }

  return {
    resolved,
    reason,
    improvement: {
      cpu: { before: cpuBefore, after: cpuAfter, change: cpuChange },
      ram: { before: ramBefore, after: ramAfter, change: ramChange }
    }
  };
}

/**
 * 4. createTicket(incident)
 * Creates a structured escalation ticket with an INC-2026-XXXX identifier.
 */
export function createTicket(incident = {}) {
  const ticketId = `INC-2026-${String(ticketCounter++).padStart(4, '0')}`;
  const timestamp = new Date().toISOString();

  const ticket = {
    id: ticketId,
    employeeId: incident.employeeId || 'E1024',
    employeeName: incident.employeeName || incident.employee || 'Unknown',
    device: incident.device || 'Unknown',
    os: incident.os || 'Unknown',
    issue: incident.issue || incident.description || 'Unresolved IT Issue',
    diagnostic: incident.diagnostic || incident.diagnosticResults || null,
    previousAttempts: incident.previousAttempts || [],
    recommendedAction: incident.recommendedAction || incident.action || null,
    authorizationStatus: incident.authorizationStatus || (incident.approved === false ? 'rejected' : 'pending'),
    status: 'OPEN',
    priority: incident.diagnostic?.cpu > 90 ? 'HIGH' : 'MEDIUM',
    createdAt: timestamp
  };

  ticketsStore.push(ticket);
  console.log(`[Ticket Tool] Created ticket ${ticket.id} for employee ${ticket.employeeId}`);
  return ticket;
}

export function listTickets() {
  return ticketsStore;
}
