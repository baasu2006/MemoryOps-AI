import React, { useState } from 'react';
import './IncidentTimeline.css';
import StatusBadge from './StatusBadge';

const IncidentTimeline = ({ incidents = [] }) => {
  const [expandedDay, setExpandedDay] = useState('day20');

  return (
    <div className="bottom-panel-section timeline-panel">
      <div className="section-header">
        <div className="timeline-header-row">
          <h3>📅 INCIDENT TIMELINE & LEARNING LIFECYCLE</h3>
          <span className="lifecycle-tag">Continuous Memory Evolution</span>
        </div>
        <span className="subtitle">Chronological progression of issues, Hindsight recalls, and verified remediations</span>
      </div>
      
      <div className="timeline-container">
        {/* Day 20 Showcase */}
        <div className={`timeline-day-card ${expandedDay === 'day20' ? 'expanded' : ''}`}>
          <div className="timeline-day-header" onClick={() => setExpandedDay(expandedDay === 'day20' ? null : 'day20')}>
            <div className="day-badge day20-badge">DAY 20</div>
            <div className="day-summary">
              <span className="day-title">Recurring Sluggishness → Hindsight Instant Resolution</span>
              <span className="day-date">September 20, 2026</span>
            </div>
            <span className="day-toggle-arrow">{expandedDay === 'day20' ? '▼' : '▶'}</span>
          </div>

          <div className="timeline-steps-flow">
            <div className="timeline-step">
              <div className="step-node completed">1</div>
              <div className="step-content">
                <span className="step-title">Issue Reported</span>
                <span className="step-desc">Employee Arjun Rao reported: "My laptop is slow again."</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node memory-node completed">2</div>
              <div className="step-content">
                <span className="step-title highlight-purple">Hindsight Memory Recalled</span>
                <span className="step-desc">Recalled Day 1 incident record: CompanySync.exe previously caused high CPU; stopping it had 100% success.</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">3</div>
              <div className="step-content">
                <span className="step-title">Diagnostic</span>
                <span className="step-desc">CPU 94%, RAM 87%, Disk 72% | Problematic process: CompanySync.exe</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">4</div>
              <div className="step-content">
                <span className="step-title">Recommendation</span>
                <span className="step-desc">Recommended action: Stop CompanySync.exe (Confidence: 100% based on memory).</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">5</div>
              <div className="step-content">
                <span className="step-title">Authorization</span>
                <span className="step-desc">Employee explicitly authorized Stop CompanySync.exe remediation.</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">6</div>
              <div className="step-content">
                <span className="step-title">Action</span>
                <span className="step-desc">Executed stop_company_sync process termination safely.</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">7</div>
              <div className="step-content">
                <span className="step-title highlight-green">Verification</span>
                <span className="step-desc">CPU: 94% → 31% | RAM: 87% → 58% | Resolution: SUCCESS</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node memory-node completed">8</div>
              <div className="step-content">
                <span className="step-title highlight-purple">Memory Updated</span>
                <span className="step-desc">Retained verified outcome into Hindsight Cloud (Bank: memoryops-it-support).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Day 1 Showcase */}
        <div className={`timeline-day-card ${expandedDay === 'day1' ? 'expanded' : ''}`}>
          <div className="timeline-day-header" onClick={() => setExpandedDay(expandedDay === 'day1' ? null : 'day1')}>
            <div className="day-badge day1-badge">DAY 1</div>
            <div className="day-summary">
              <span className="day-title">First Incident & Discovery of Root Cause</span>
              <span className="day-date">September 1, 2026</span>
            </div>
            <span className="day-toggle-arrow">{expandedDay === 'day1' ? '▼' : '▶'}</span>
          </div>

          <div className="timeline-steps-flow">
            <div className="timeline-step">
              <div className="step-node completed">1</div>
              <div className="step-content">
                <span className="step-title">Issue Reported</span>
                <span className="step-desc">Severe laptop performance degradation on Dell Latitude 5440.</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node completed">2</div>
              <div className="step-content">
                <span className="step-title">Diagnostic</span>
                <span className="step-desc">CPU 94%, RAM 87%, Disk 72% | Problematic process: CompanySync.exe</span>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node failed-node">3</div>
              <div className="step-content">
                <span className="step-title highlight-red">Failed Actions</span>
                <div className="failed-attempts-tags">
                  <span className="tag-failed">✗ restart_device (CPU rebounded to 92%)</span>
                  <span className="tag-failed">✗ clear_temp_files (CPU stayed at 94%)</span>
                </div>
              </div>
            </div>

            <div className="timeline-step">
              <div className="step-node success-node completed">4</div>
              <div className="step-content">
                <span className="step-title highlight-green">Successful Action</span>
                <span className="step-desc">stop_company_sync authorized → CPU dropped to 31%, issue resolved & saved to Hindsight memory.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Incidents History List */}
        {incidents.slice(0, 5).map((inc, i) => (
          <div key={inc.id || i} className="historical-incident-card">
            <div className="hist-header">
              <span className="hist-id">{inc.id}</span>
              <StatusBadge status={inc.resolution?.resolved ? 'resolved' : 'critical'} />
              <span className="hist-date">{new Date(inc.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="hist-title">{inc.issue}</div>
            <div className="hist-desc">{inc.description}</div>
            {inc.resolution?.resolvedBy && (
              <div className="hist-resolution-tag">
                Resolved by: <strong>{inc.resolution.resolvedBy.replace(/_/g, ' ')}</strong>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentTimeline;
