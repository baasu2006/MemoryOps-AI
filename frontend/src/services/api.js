const API_BASE = '/api';

/**
 * Robust fetch wrapper with structured error parsing
 */
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Client] Request error for ${url}:`, error.message);
    throw error;
  }
}

/**
 * Pure backend API client for MemoryOps AI.
 * Note: Groq and Hindsight API keys are kept strictly on the backend.
 */
export const api = {
  // 1. Chat → POST /api/chat
  chat: (message, employeeId = 'E1024') =>
    request(`${API_BASE}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, employeeId })
    }),

  // 2. Employee Profile → GET /api/employee/:id
  getEmployee: (id = 'E1024') =>
    request(`${API_BASE}/employee/${encodeURIComponent(id)}`),

  // 3. Memory Panel → GET /api/memory
  getMemory: (query = '', employeeId = '') => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (employeeId) params.append('employeeId', employeeId);
    const queryString = params.toString();
    return request(`${API_BASE}/memory${queryString ? `?${queryString}` : ''}`);
  },

  // 4. Diagnostic → POST /api/diagnostic
  getDiagnostic: (employeeId = 'E1024', deviceId = 'Dell Latitude 5440') =>
    request(`${API_BASE}/diagnostic`, {
      method: 'POST',
      body: JSON.stringify({ employeeId, deviceId })
    }),

  // 5. Authorize Action → POST /api/authorize
  authorizeAction: (employeeId, action, approved = true, reason = '') =>
    request(`${API_BASE}/authorize`, {
      method: 'POST',
      body: JSON.stringify({ employeeId, action, approved, reason })
    }),

  // 6. Resolution Intelligence → GET /api/resolution-intelligence/:employeeId
  getResolutionIntelligence: (employeeId = 'E1024', issue = 'laptop slow') => {
    const params = new URLSearchParams();
    if (issue) params.append('issue', issue);
    const queryString = params.toString();
    return request(`${API_BASE}/resolution-intelligence/${encodeURIComponent(employeeId)}${queryString ? `?${queryString}` : ''}`);
  },

  // 7. Incidents → GET /api/incidents
  getIncidents: (employeeId = '') => {
    const url = employeeId
      ? `${API_BASE}/incidents?employeeId=${encodeURIComponent(employeeId)}`
      : `${API_BASE}/incidents`;
    return request(url);
  },

  // Health check
  healthCheck: () => request(`${API_BASE}/health`),

  // 8. Create Escalation Ticket → POST /api/incidents
  createTicket: (data) =>
    request(`${API_BASE}/incidents`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Verification helper
  verifyAction: (before, after) =>
    request(`${API_BASE}/verify`, {
      method: 'POST',
      body: JSON.stringify({ before, after })
    }),

  // Aliases for backwards compatibility
  fetchEmployee: (id) => api.getEmployee(id),
  sendChat: (message, employeeId) => api.chat(message, employeeId),
  runDiagnostic: (employeeId, deviceId) => api.getDiagnostic(employeeId, deviceId),
  fetchIncidents: (employeeId) => api.getIncidents(employeeId),
  fetchMemories: (query, employeeId) => api.getMemory(query, employeeId),
  fetchResolutionIntelligence: (employeeId, issue) => api.getResolutionIntelligence(employeeId, issue),
  executeAction: (employeeId, deviceId, action) => api.authorizeAction(employeeId, action, true)
};

export default api;
