# MemoryOps AI

**Persistent IT Support & Resolution Intelligence Agent**

MemoryOps AI is an enterprise-grade Autonomous IT Support & Resolution Intelligence platform designed to eliminate repetitive troubleshooting in modern organizations. By pairing **Hindsight Cloud** persistent episodic memory with **Groq-powered Llama 3.3 70B** ultra-low-latency reasoning, MemoryOps AI remembers every historical incident, diagnoses live telemetry, prioritizes proven resolutions, and safely executes remediation under strict human-in-the-loop authorization.

---

## 📌 Problem

Traditional enterprise IT support suffers from institutional amnesia:
* **Repetitive Troubleshooting Loops:** Support technicians frequently propose generic, ineffective fixes (e.g., repeatedly restarting devices or clearing temporary caches) for issues already diagnosed and resolved in prior tickets.
* **Siloed & Fragmented Knowledge:** Solutions discovered for one employee or device are lost in closed ticket logs, forcing IT teams to reinvent fixes from scratch.
* **Costly Employee Downtime:** High-resource processes, memory leaks, and network misconfigurations cause recurring productivity loss while waiting for Level-2 technician triage.
* **Lack of Continuous Learning:** Standard conversational AI assistants lack long-term persistent memory across sessions, treating every conversation as a blank slate without learning which remediation actions actually succeeded.

---

## 💡 Solution

MemoryOps AI introduces **Resolution Intelligence** powered by persistent episodic memory:
* **Persistent Episodic Memory (Hindsight Cloud):** Retains natural-language incident telemetry, before/after metrics, attempted troubleshooting steps, and verified resolution outcomes in a dedicated enterprise memory bank (`memoryops-it-support`).
* **Evidence-Based Action Prioritization:** Computes real-time success matrices across historical incidents, prioritizing actions with verified track records (e.g., terminating a specific runaway process with 100% resolution success).
* **Strict Human-in-the-Loop Governance:** AI agents recommend actions with confidence scores and operational risk disclosures, but can *never* execute consequential remediation tools without explicit user authorization.
* **Persistent Memory Adaptation:** Learns and updates institutional success rates after every completed incident without requiring model weight retraining.

---

## 🔄 Cognitive Lifecycle Loop

MemoryOps AI operates on a rigorous 8-stage cognitive lifecycle:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           THE COGNITIVE LOOP                             │
│                                                                          │
│  [1. REMEMBER]    Recall past incident precedents from Hindsight Cloud   │
│         ↓                                                                │
│  [2. DIAGNOSE]    Inspect live system telemetry (CPU, RAM, Processes)    │
│         ↓                                                                │
│  [3. LEARN]       Synthesize historical success rates & failed attempts  │
│         ↓                                                                │
│  [4. RECOMMEND]   Propose highest-confidence action with risk rationale  │
│         ↓                                                                │
│  [5. AUTHORIZE]   Human-in-the-loop explicitly approves or rejects       │
│         ↓                                                                │
│  [6. ACT]         Execute safe, simulated IT remediation tool            │
│         ↓                                                                │
│  [7. VERIFY]      Measure before vs. after metrics (CPU 94% → 31%)       │
│         ↓                                                                │
│  [8. REMEMBER]    Retain completed outcome & metrics in Hindsight Cloud  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Hindsight Cloud Integration

MemoryOps AI uses the official `@vectorize-io/hindsight-client` TypeScript/JavaScript SDK to interface with Hindsight Cloud.

### Functions Implemented (`backend/src/memory/hindsight.js`)

1. **`retainIncidentMemory(incident)` / `retain()`**
   * Formats structured incident data, diagnostic telemetry, authorization history, and verified outcomes into rich natural-language memories.
   * Stores episodic records with metadata (employee ID, device, issue, action executed, timestamp, resolution status) in memory bank `memoryops-it-support`.

2. **`recallRelevantMemories(employeeId, issue)` / `recall()`**
   * Performs semantic and episodic vector searches across past incidents before formulating recommendations.
   * Retrieves relevant memory records, relevance scores, and historical precedents.

3. **`reflectOnIncident(employeeId, issue)` / `reflect()`**
   * Queries Hindsight synthesis engine to generate high-level resolution insights across multi-incident histories.

4. **`getEmployeeMemory(employeeId)`**
   * Lists all historical incident and troubleshooting memories associated with a specific employee profile.

---

## ⚡ Groq Cloud AI Integration

Groq serves as the high-speed reasoning and decision-making engine:
* **Model:** `llama-3.3-70b-versatile` via `groq-sdk`.
* **Structured Output Schema:** Guarantees strict JSON output conforming to the enterprise decision contract:
  ```json
  {
    "summary": "Clear explanation referencing historical memory and current telemetry",
    "previous_incidents": ["List of relevant past incident summaries from Hindsight"],
    "likely_cause": "Identified root cause (e.g., CompanySync.exe excessive CPU utilization)",
    "recommended_action": "stop_company_sync",
    "displayName": "Stop CompanySync.exe",
    "reason": "Detailed justification citing past resolution success or diagnostic evidence",
    "risk": "The process will be temporarily stopped.",
    "requires_authorization": true,
    "escalation_required": false
  }
  ```
* **Single Source of Truth System Prompt (`backend/src/ai/systemPrompt.js`):** Enforces 15 operational guardrails including historical memory inspection, strict data category separation, prohibition of fabricated telemetry, and mandatory human authorization.

---

## 🏗️ Architecture

```
+-----------------------------------------------------------------------------+
|                          MEMORYOPS AI ARCHITECTURE                          |
+-----------------------------------------------------------------------------+

                      +----------------------------------+
                      |         React 18 + Vite          |
                      |     Enterprise IT Dashboard      |
                      | (Port 5173 - Dark Theme UI)     |
                      +-----------------+----------------+
                                        |
                                        | REST API Calls
                                        | (/api/*)
                                        v
                      +-----------------+----------------+
                      |       Express.js Backend         |
                      |           (Port 3001)            |
                      +----+-------------+-------------+-+
                           |             |             |
            Recalls &      |             | Reasoning   | Runs Live
            Retains        |             | via Llama   | Diagnostics &
            Memories       v             v 70B         v Remediation
          +----------------+--+   +------+-----+   +---+---------------+
          |  Hindsight Cloud  |   | Groq Cloud |   |    IT Support     |
          |  Memory Bank:     |   | LLM Engine |   |    Tools Engine   |
          |  memoryops-       |   | (llama-3.3 |   |  - runDiagnostic  |
          |  it-support       |   |  -70b)     |   |  - applyFix       |
          +-------------------+   +------------+   |  - verifyResolut. |
                                                   |  - createTicket   |
                                                   +---------+---------+
                                                             |
                                                             | Gated by
                                                             v
                                                   +---------+---------+
                                                   |   Authorization   |
                                                   |       Guard       |
                                                   | (approved: true)  |
                                                   +-------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Enterprise IT support dashboard with real-time reactive telemetry |
| **Styling** | Custom Enterprise CSS | High-contrast dark theme with status pills, meters, and modal dialogs |
| **Backend** | Node.js, Express.js (ES Modules) | High-throughput REST API, authorization gateway, tool executor |
| **Episodic Memory** | `@vectorize-io/hindsight-client` | Persistent cloud memory bank (`retain`, `recall`, `reflect`) |
| **Reasoning / LLM** | `groq-sdk` (Llama 3.3 70B) | Real-time diagnostic correlation and structured support decisions |
| **Testing** | Node.js Test Suite | Automated end-to-end verification of memory, AI, and authorization |

---

## 🔒 Security & Human-in-the-Loop Safeguards

1. **Backend Secret Isolation:** All API keys (`GROQ_API_KEY`, `HINDSIGHT_API_KEY`) reside strictly in backend `.env` files. Zero credentials or keys are exposed to the frontend browser client.
2. **Environment Protection:** `.env` files and sensitive configs are strictly ignored in `.gitignore`.
3. **Mandatory Authorization Gateway:** The AI cannot directly execute tools. Consequential actions require explicit human authorization (`approved: true` sent to `/api/authorize`). Rejections are recorded in state without modifying the machine.
4. **Simulated IT Remediation:** All IT support tools (`runDiagnostic`, `applyFix`, `verifyResolution`) operate in deterministic simulated environments without issuing destructive raw OS commands.

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/memoryops-ai.git
cd MemoryOps-AI
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Groq Cloud API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Hindsight Cloud Configuration
HINDSIGHT_API_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BANK_ID=memoryops-it-support
```

> **Note:** If `GROQ_API_KEY` or `HINDSIGHT_API_KEY` are not set, MemoryOps AI automatically operates in offline verification mode using the built-in Resolution Intelligence engine and synthetic incident memory store.

---

## 🏃 Running the Application

### 1. Seed Hindsight Memory Bank
Populate the memory bank with synthetic enterprise incidents:
```bash
cd backend
npm run seed
```

### 2. Start the Backend Server
```bash
cd backend
npm start
# Server starts on http://localhost:3001
```

### 3. Start the Frontend Dashboard
```bash
cd frontend
npm run dev
# Dashboard launches on http://localhost:5173
```

### 4. Run Backend Automated Tests
```bash
cd backend
node test-ai-agent.js
node test-it-tools.js
node test-authorize-endpoint.js
node test-resolution-intelligence.js
```

---

## 📊 Synthetic Enterprise Dataset

MemoryOps AI includes realistic synthetic datasets for enterprise simulation:
* **10 Enterprise Employees (`data/employees.json`):** Diverse departments (Finance, Engineering, Product, HR, Legal) with distinct hardware profiles (Dell Latitude 5440, ThinkPad X1 Carbon, MacBook Pro M3, Surface Laptop 5).
* **30 Historical Incidents (`data/incidents.json`):** Spans 10 IT issue categories:
  1. Laptop Performance Degradation
  2. Corporate VPN Timeout
  3. Wi-Fi & DNS Connectivity
  4. Microsoft Outlook Synchronization
  5. Application Crash & Cache Bloat
  6. Login & Multi-Factor Authentication
  7. Enterprise Network Printer
  8. Subnet Gateway Latency
  9. Database Tool Performance
  10. System Boot & Background Services

---

## 📖 Example Workflow (Employee E1024)

1. **Employee Reports Issue:** Arjun Rao (E1024, Dell Latitude 5440, Windows 11) reports:  
   *`"My laptop is very slow."`*
2. **Hindsight Memory Recall:** MemoryOps AI queries Hindsight Bank `memoryops-it-support` and discovers a 20-day-old incident on this specific laptop where `CompanySync.exe` caused high CPU.
3. **Live Diagnostic:** System runs diagnostic telemetry: `CPU: 94%`, `RAM: 87%`, Problematic Process: `CompanySync.exe`.
4. **Resolution Intelligence:** Analyzes past attempts:
   * `restart_device`: 0% success (process restarts on boot)
   * `clear_temp_files`: 0% success (cache purge has no effect)
   * `stop_company_sync`: 100% success rate across 3 attempts
5. **AI Recommendation Card:** MemoryOps AI presents:
   * **Recommended Action:** `Stop CompanySync.exe`
   * **Why:** Prior incident on this device was resolved by stopping this runaway process.
   * **Risk:** The process will be temporarily stopped.
   * **Learning Indicator:** `3 previous attempts / 2 successful resolutions (100% success rate)`.
6. **Human Authorization:** Employee reviews the card and clicks **`[ AUTHORIZE ACTION ]`**.
7. **Action Execution & Verification:** Backend applies fix and verifies:
   * **Before:** CPU 94%, RAM 87%
   * **After:** CPU 31%, RAM 58%
   * **Status:** Verified Resolved (`CPU -63%`, `RAM -29%`).
8. **Learning Update & Hindsight Retention:** Updates Resolution Intelligence from `3/4 attempts` to `4/5 attempts` and retains the new incident verification in Hindsight Cloud.

---

## 🔁 Hindsight Memory Flow

```
+-----------------------------------------------------------------------------+
|                           HINDSIGHT MEMORY FLOW                             |
+-----------------------------------------------------------------------------+

 [Incident Completed] ───────────► retain() ──────────► [ Hindsight Bank ]
                                                              │
                                                              │
 [New Employee Issue] ───────────► recall() ◄─────────────────┤
                                      │                       │
                                      ▼                       │
 [Correlate & Reflect] ──────────► reflect() ◄────────────────┘
                                      │
                                      ▼
 [AI Recommendation] ──► [Authorize] ──► [Verify] ──► retain()
```

---

## 🔮 Future Roadmap

* **ServiceNow & Jira Service Management Integration:** Two-way ticket synchronization and CMDB asset binding.
* **Live Operating System Telemetry:** Integration with `osquery`, Microsoft Intune, and Windows Management Instrumentation (WMI).
* **Enterprise Identity & SSO:** SAML 2.0 and OIDC support for Okta, Azure Active Directory, and PingFederate.
* **Production Kubernetes Deployment:** Helm charts, multi-replica clustering, and Redis rate-limiting sidecars.
* **Mobile & Responsive Progressive Web App (PWA):** Mobile device diagnostic capture and on-call technician dashboard.
* **Real-Time Voice AI:** Low-latency WebRTC and telephony voice agent for phone-in enterprise IT helpdesks.
* **Extended Remediation Action Catalog:** Active Directory account unlock, SSL certificate rotation, driver reinstallation, and printer spooler reset.

---

## 📄 License

MIT License &copy; 2026 MemoryOps AI. All rights reserved.
