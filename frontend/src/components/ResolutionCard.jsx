import React from 'react';
import './ResolutionCard.css';
import LearningIndicator from './LearningIndicator';

const ResolutionCard = ({ data }) => {
  if (!data) return null;

  const before = data.before || { cpu: 94, ram: 87, disk: 72 };
  const after = data.after || { cpu: 31, ram: 58, disk: 72 };
  
  const isResolved = data.resolved ?? (data.status === 'resolved');

  // Before vs After statistics
  const beforeStats = data.beforeStats || { successful: 3, attempts: 4 };
  const afterStats = data.afterStats || (isResolved
    ? { successful: (beforeStats.successful || 3) + 1, attempts: (beforeStats.attempts || 4) + 1 }
    : { successful: beforeStats.successful || 3, attempts: (beforeStats.attempts || 4) + 1 }
  );

  return (
    <div className={`res-card ${isResolved ? 'resolved' : 'unresolved'}`}>
      <div className="res-header">
        <span className="icon">{isResolved ? '✅' : '⚠️'}</span>
        <div className="res-title-group">
          <h4>Action completed</h4>
          <span className="res-subtitle">Remediation successfully applied</span>
        </div>
        <span className="resolution-success-pill">
          {isResolved ? 'Resolution: SUCCESS' : 'Resolution: FAILED'}
        </span>
      </div>
      
      <div className="verification-section">
        <div className="verification-label">VERIFICATION RESULTS:</div>
        
        <div className="comparison-container">
          <div className="comp-side before">
            <span className="stage-tag before-tag">BEFORE</span>
            <div className="metric">
              <span className="lbl">CPU</span>
              <span className="val critical">{before.cpu || 94}%</span>
            </div>
            <div className="metric">
              <span className="lbl">RAM</span>
              <span className="val critical">{before.ram || 87}%</span>
            </div>
            {before.disk != null && (
              <div className="metric">
                <span className="lbl">Disk</span>
                <span className="val">{before.disk}%</span>
              </div>
            )}
            {before.problematicProcess && (
              <div className="process-badge danger">⚠ {before.problematicProcess}</div>
            )}
          </div>
          
          <div className="comp-divider">
            <span className="arrow">→</span>
            <div className="delta-stats">
              <span className="delta-item">CPU: {before.cpu}% → {after.cpu}%</span>
              <span className="delta-item">RAM: {before.ram}% → {after.ram}%</span>
            </div>
          </div>
          
          <div className="comp-side after">
            <span className="stage-tag after-tag">AFTER</span>
            <div className="metric">
              <span className="lbl">CPU</span>
              <span className="val good">{after.cpu || 31}%</span>
            </div>
            <div className="metric">
              <span className="lbl">RAM</span>
              <span className="val good">{after.ram || 58}%</span>
            </div>
            {after.disk != null && (
              <div className="metric">
                <span className="lbl">Disk</span>
                <span className="val">{after.disk}%</span>
              </div>
            )}
            <div className="process-badge resolved">✓ Normal Operation</div>
          </div>
        </div>
      </div>

      {/* Explicit Learning Indicator comparing Before vs After */}
      <LearningIndicator
        phase="resolved"
        actionName={data.actionName || 'Stop CompanySync.exe'}
        beforeStats={beforeStats}
        afterStats={afterStats}
        incidentId={data.incidentId}
      />
      
      <div className="res-footer">
        {data.details && <p className="details-text">{data.details}</p>}
        <div className="memory-updated-badge">
          <span className="mem-icon">🧠</span>
          <span>Memory updated — Stored new incident & verification in Hindsight Cloud</span>
        </div>
      </div>
    </div>
  );
};

export default ResolutionCard;
