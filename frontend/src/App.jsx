import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { api } from './services/api';
import Header from './components/Header';
import EmployeeProfile from './components/EmployeeProfile';
import ChatPanel from './components/ChatPanel';
import MemoryPanel from './components/MemoryPanel';
import ResolutionIntelligence from './components/ResolutionIntelligence';
import IncidentTimeline from './components/IncidentTimeline';
import TicketModal from './components/TicketModal';

function App() {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [resolutionStats, setResolutionStats] = useState([]);
  const [mostSuccessfulAction, setMostSuccessfulAction] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [actionProposal, setActionProposal] = useState(null);
  const [attemptedActions, setAttemptedActions] = useState([]);
  const [verificationFailures, setVerificationFailures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [bottomExpanded, setBottomExpanded] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [apiHealth, setApiHealth] = useState({ status: 'checking' });
  const [errorState, setErrorState] = useState(null);

  // Check API health
  useEffect(() => {
    api.healthCheck()
      .then(data => {
        setApiHealth({ status: 'ok', ...data });
        setErrorState(null);
      })
      .catch(err => {
        setApiHealth({ status: 'error' });
        setErrorState('Backend API is unreachable on port 3001. Please verify server status.');
      });
  }, []);

  // Load initial data (Employee, Incidents, Memories, Resolution Intelligence)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Load Employee (GET /api/employee/:id)
        const emp = await api.getEmployee('E1024');
        setCurrentEmployee({
          ...emp,
          status: 'online',
          totalIncidents: emp.history?.length || 5,
          openIssues: 1,
          resolved: 4
        });

        // 2. Load Incidents (GET /api/incidents)
        try {
          const incData = await api.getIncidents('E1024');
          setIncidents(Array.isArray(incData) ? incData : []);
        } catch (e) {
          console.warn('Notice loading incidents:', e);
        }

        // 3. Load Resolution Intelligence (GET /api/resolution-intelligence/:employeeId)
        try {
          const intel = await api.getResolutionIntelligence('E1024', 'laptop slow');
          if (intel?.actionStatistics) {
            setResolutionStats(intel.actionStatistics);
          }
          if (intel?.mostSuccessfulAction) {
            setMostSuccessfulAction(intel.mostSuccessfulAction);
          }
        } catch (e) {
          console.warn('Notice loading resolution intelligence:', e);
        }

        // 4. Load Memories (GET /api/memory)
        try {
          const memData = await api.getMemory('laptop slow CompanySync.exe', 'E1024');
          setMemories(Array.isArray(memData) ? memData : []);
        } catch (e) {
          console.warn('Notice loading memories:', e);
        }

        // 5. Initialize Welcome Message
        setMessages([
          {
            id: 'sys-1',
            role: 'system',
            type: 'system',
            content: '⚡ Session initialized. Connected to backend REST APIs & Hindsight Cloud.'
          },
          {
            id: 'welcome',
            role: 'assistant',
            type: 'text',
            content: `Hello ${emp.name || 'Arjun'}. I'm MemoryOps AI, your persistent IT support intelligence agent. I have access to your device profile (${emp.device || 'Dell Latitude 5440'}), historical Hindsight memories, and resolution intelligence. How can I assist you today?`
          }
        ]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setErrorState(`Failed to connect to backend: ${err.message}`);
        setCurrentEmployee({
          id: 'E1024',
          employeeId: 'E1024',
          name: 'Arjun Rao',
          device: 'Dell Latitude 5440',
          os: 'Windows 11',
          department: 'Finance',
          jobTitle: 'Analyst',
          status: 'online',
          totalIncidents: 5,
          openIssues: 1,
          resolved: 4
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Handle user message sending → POST /api/chat
   */
  const handleSendMessage = useCallback(async (text) => {
    const userMsg = { id: `user-${Date.now()}`, role: 'user', type: 'text', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    setErrorState(null);

    try {
      // 1. Call POST /api/chat
      const chatResponse = await api.chat(text, currentEmployee?.id || 'E1024');
      const { response, decision, metadata, diagnostic, recommendedAction, memories: returnedMemories } = chatResponse;

      // 2. Add AI response message
      const aiMsgText = response?.message || decision?.summary || 'Analysis complete.';
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: aiMsgText
      }]);

      // 3. Render Diagnostic Card if diagnostic data returned
      const activeDiag = diagnostic || metadata?.diagnostics;
      if (activeDiag) {
        setDiagnostics(activeDiag);
        setMessages(prev => [...prev, {
          id: `diag-${Date.now()}`,
          role: 'assistant',
          type: 'diagnostic',
          data: activeDiag
        }]);
      }

      // 4. Update Hindsight Memory Panel
      const memList = returnedMemories || metadata?.memories;
      if (memList && memList.length > 0) {
        setMemories(memList.map((m, i) => ({
          id: m.id || `mem-${i}`,
          content: m.content || m,
          score: m.score,
          metadata: m.metadata,
          source: m.source || 'Hindsight',
          bankId: m.bankId || 'memoryops-it-support',
          memoryType: m.memoryType || m.metadata?.memoryType || 'Experience',
          timestamp: m.timestamp || m.metadata?.timestamp || '2026-09-01T09:30:00Z',
          date: m.metadata?.timestamp ? new Date(m.metadata.timestamp).toLocaleDateString() : '20 days ago',
          summary: typeof m.content === 'string' ? (m.content.length > 120 ? m.content.substring(0, 120) + '...' : m.content) : (typeof m === 'string' ? m : 'Memory record'),
          relevance: m.relevance || 'Relevant to current issue',
          status: m.metadata?.resolved ? 'resolved' : 'info'
        })));
      }

      // 5. Update Resolution Intelligence table
      if (metadata?.resolutionStats) {
        setResolutionStats(metadata.resolutionStats);
      }

      // 6. Propose Authorized Action Card
      const rec = recommendedAction || metadata?.recommendation;
      if (rec && activeDiag) {
        setMostSuccessfulAction(rec);
        const currentStats = metadata?.resolutionStats || resolutionStats || [];
        const statForAction = currentStats.find(s => s.action === rec.action);

        setTimeout(() => {
          const proposalMsg = {
            id: `proposal-${Date.now()}`,
            role: 'assistant',
            type: 'action-proposal',
            data: {
              action: rec.action,
              displayName: rec.displayName,
              reason: rec.reason || 'This action previously resolved the same issue on this device.',
              risk: rec.risk || 'The process will be temporarily stopped.',
              confidence: rec.confidence || 100,
              previousAttempts: statForAction?.attempts ?? 3,
              successfulResolutions: statForAction?.successes ?? 2,
              status: 'pending',
              basedOn: rec.basedOn
            }
          };
          setActionProposal(proposalMsg.data);
          setMessages(prev => [...prev, proposalMsg]);
        }, 500);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: `⚠️ API Error: ${err.message}. Please check backend connection.`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [currentEmployee]);

  /**
   * Suggest an alternative action when previous action failed or was rejected
   */
  const handleTryAlternativeAction = useCallback(() => {
    // Find highest rated action that has not yet been attempted in this session
    const nextBest = resolutionStats.find(s => !attemptedActions.includes(s.action)) || resolutionStats[0] || {
      action: 'stop_company_sync',
      displayName: 'Stop CompanySync.exe',
      reason: 'Previously successful on Dell Latitude 5440 with 100% success rate.'
    };

    const altProposal = {
      action: nextBest.action,
      displayName: nextBest.displayName,
      reason: nextBest.action === 'stop_company_sync'
        ? 'A previous incident on this device was resolved by stopping this process.'
        : `Historical success rate: ${nextBest.successRate || 70}% across organizational incidents.`,
      risk: nextBest.action === 'stop_company_sync'
        ? 'The process will be temporarily stopped.'
        : 'Action will run safe simulated remediation.',
      confidence: nextBest.successRate || 90,
      status: 'pending'
    };

    setActionProposal(altProposal);
    setMessages(prev => [...prev, {
      id: `proposal-alt-${Date.now()}`,
      role: 'assistant',
      type: 'action-proposal',
      data: altProposal
    }]);
  }, [resolutionStats, attemptedActions]);

  /**
   * Handle user action authorization → POST /api/authorize (approved: true)
   */
  const handleAuthorize = useCallback(async (actionData) => {
    // Transition proposal card to authorized state
    setMessages(prev => prev.map(m =>
      m.type === 'action-proposal' ? { ...m, data: { ...m.data, status: 'authorized' } } : m
    ));
    setActionProposal(prev => prev ? { ...prev, status: 'authorized' } : null);
    setAttemptedActions(prev => [...prev, actionData.action]);

    // Add executing system log message
    setMessages(prev => [...prev, {
      id: `exec-${Date.now()}`,
      role: 'system',
      type: 'system',
      content: `⚡ Authorization granted. Executing safe remediation: ${actionData.displayName || actionData.action}...`
    }]);

    try {
      // Call POST /api/authorize
      const result = await api.authorizeAction(
        currentEmployee?.id || 'E1024',
        actionData.action,
        true
      );

      // Compute before and after learning statistics for this action
      const matchedStat = resolutionStats.find(s => s.action === actionData.action) || {
        attempts: 4,
        successes: 3
      };
      const beforeStats = {
        successful: matchedStat.successes ?? 3,
        attempts: matchedStat.attempts ?? 4
      };
      const afterStats = {
        successful: result.resolved ? beforeStats.successful + 1 : beforeStats.successful,
        attempts: beforeStats.attempts + 1
      };

      // Render Resolution Card with Learning Progression
      setMessages(prev => [...prev, {
        id: `res-${Date.now()}`,
        role: 'assistant',
        type: 'resolution',
        data: {
          before: result.before,
          after: result.after,
          status: result.resolved ? 'resolved' : 'unresolved',
          resolved: result.resolved,
          reason: result.verification?.reason,
          improvement: result.verification?.improvement,
          details: result.details,
          storedInHindsight: result.memoryStored,
          actionName: actionData.displayName || actionData.action,
          beforeStats,
          afterStats,
          incidentId: result.incidentId
        }
      }]);

      // Update diagnostics state to after-metrics
      if (result.after) {
        setDiagnostics(result.after);
      }

      // Branch on Verification Outcome
      if (result.resolved) {
        // SUCCESS PATH
        setVerificationFailures(0);
        setMessages(prev => [...prev, {
          id: `summary-${Date.now()}`,
          role: 'assistant',
          type: 'text',
          content: `✅ Action completed successfully! ${result.details} Verification passed and memory updated in Hindsight Cloud.`
        }]);
      } else {
        // FAILURE PATH
        const nextFailCount = verificationFailures + 1;
        setVerificationFailures(nextFailCount);

        if (nextFailCount >= 2) {
          // Failure twice → Automatically recommend escalation
          setMessages(prev => [...prev, {
            id: `escalation-${Date.now()}`,
            role: 'assistant',
            type: 'escalation-recommendation',
            content: `Verification has failed on multiple remediation attempts (CPU remains high at ${result.after?.cpu || 92}%). Escalation to an IT engineering technician is strongly recommended.`
          }]);
        } else {
          // Failure once → Render failure recovery card with options
          setMessages(prev => [...prev, {
            id: `fail-recover-${Date.now()}`,
            role: 'assistant',
            type: 'remediation-failure',
            content: `The executed action (${actionData.displayName || actionData.action}) did not resolve the high resource utilization. CPU remains at ${result.after?.cpu || 92}%.`,
            data: actionData
          }]);
        }
      }

      // Refresh Incidents & Resolution Intelligence dynamically
      try {
        const [updatedIncidents, updatedIntel] = await Promise.all([
          api.getIncidents(currentEmployee?.id || 'E1024'),
          api.getResolutionIntelligence(currentEmployee?.id || 'E1024', 'laptop slow')
        ]);
        if (Array.isArray(updatedIncidents)) setIncidents(updatedIncidents);
        if (updatedIntel?.actionStatistics) setResolutionStats(updatedIntel.actionStatistics);
        if (updatedIntel?.mostSuccessfulAction) setMostSuccessfulAction(updatedIntel.mostSuccessfulAction);
      } catch (e) {
        console.warn('Notice refreshing telemetry:', e);
      }
    } catch (err) {
      console.error('Authorization execution error:', err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        type: 'text',
        content: `❌ Remediation execution failed: ${err.message}`
      }]);
    }
  }, [currentEmployee, verificationFailures]);

  /**
   * Handle user action rejection → POST /api/authorize (approved: false)
   */
  const handleReject = useCallback(async (actionData) => {
    // Transition proposal card to rejected state
    setMessages(prev => prev.map(m =>
      m.type === 'action-proposal' ? { ...m, data: { ...m.data, status: 'rejected' } } : m
    ));
    setActionProposal(prev => prev ? { ...prev, status: 'rejected' } : null);

    // Call POST /api/authorize with approved: false
    try {
      await api.authorizeAction(
        currentEmployee?.id || 'E1024',
        actionData.action,
        false,
        'Employee rejected recommended remediation'
      );
    } catch (e) {
      console.warn('Rejection notification notice:', e);
    }

    // Ask whether employee wants to create an IT ticket or try another action
    setMessages(prev => [...prev, {
      id: `reject-${Date.now()}`,
      role: 'assistant',
      type: 'rejection-notice',
      content: `Action was rejected by the employee. The remediation was NOT executed and the rejection has been stored in memory. Would you like to try another approved action or create an IT escalation ticket?`
    }]);
  }, [currentEmployee]);

  /**
   * Handle escalation ticket creation → POST /api/incidents
   */
  const handleCreateTicket = useCallback(async () => {
    try {
      const ticketPayload = {
        employeeId: currentEmployee?.id || 'E1024',
        employeeName: currentEmployee?.name || 'Arjun Rao',
        employee: {
          id: currentEmployee?.id || 'E1024',
          name: currentEmployee?.name || 'Arjun Rao'
        },
        device: currentEmployee?.device || 'Dell Latitude 5440',
        os: currentEmployee?.os || 'Windows 11',
        issue: messages.find(m => m.role === 'user')?.content || 'Severe laptop performance degradation',
        diagnostic: diagnostics || { cpu: 94, ram: 87, disk: 72, problematicProcess: 'CompanySync.exe' },
        previousIncidents: memories.slice(0, 3).map(m => m.summary || m.issue || 'Prior slowdown incident'),
        actionsAttempted: attemptedActions.length > 0 ? attemptedActions : ['stop_company_sync'],
        actionOutcomes: [
          { action: 'restart_device', result: 'failure' },
          { action: 'clear_temp_files', result: 'failure' }
        ],
        authorizationHistory: [
          { status: actionProposal?.status || 'authorized_escalation', timestamp: new Date().toISOString() }
        ],
        currentStatus: 'OPEN_ESCALATED',
        verificationFailures
      };

      const ticket = await api.createTicket(ticketPayload);
      setShowTicketModal(false);

      setMessages(prev => [...prev, {
        id: `ticket-${Date.now()}`,
        role: 'system',
        type: 'system',
        content: `🎫 Escalation Ticket Created: ${ticket.id} (${ticket.ticketId || ticket.id}). Level-2 IT Operations team has been dispatched with full diagnostic and historical telemetry.`
      }]);

      // Refresh incident timeline
      try {
        const updatedIncidents = await api.getIncidents(currentEmployee?.id || 'E1024');
        if (Array.isArray(updatedIncidents)) setIncidents(updatedIncidents);
      } catch (e) {
        // non-critical
      }
    } catch (err) {
      console.error('Ticket creation error:', err);
    }
  }, [currentEmployee, diagnostics, actionProposal, messages, memories, attemptedActions, verificationFailures]);

  return (
    <div className="app-container">
      <Header
        apiHealth={apiHealth}
        onCreateTicket={() => setShowTicketModal(true)}
      />

      {errorState && (
        <div className="global-error-banner">
          <span>⚠️ {errorState}</span>
          <button onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      )}

      <div className="main-content">
        <EmployeeProfile
          employee={currentEmployee}
          isLoading={isLoading}
          incidents={incidents}
        />
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onAuthorize={handleAuthorize}
          onReject={handleReject}
          onTryAlternativeAction={handleTryAlternativeAction}
          onOpenTicketModal={() => setShowTicketModal(true)}
          isLoading={isChatLoading}
        />
        <MemoryPanel memories={memories} />
      </div>

      <div className={`bottom-panel-container ${bottomExpanded ? '' : 'collapsed'}`}>
        <div className="bottom-toggle-bar" onClick={() => setBottomExpanded(!bottomExpanded)}>
          <span>{bottomExpanded ? '▼' : '▲'}</span>
          <span>{bottomExpanded ? 'Hide Intelligence & History' : 'Show Intelligence & History'}</span>
        </div>
        {bottomExpanded && (
          <div className="bottom-content-grid">
            <ResolutionIntelligence
              stats={resolutionStats}
              diagnostics={diagnostics}
              recommendation={actionProposal}
              mostSuccessfulAction={mostSuccessfulAction}
            />
            <IncidentTimeline incidents={incidents} />
          </div>
        )}
      </div>

      {showTicketModal && (
        <TicketModal
          employee={currentEmployee}
          diagnostics={diagnostics}
          actionProposal={actionProposal}
          onSubmit={handleCreateTicket}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
}

export default App;
