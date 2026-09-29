import React from 'react';
import './LearningIndicator.css';

/**
 * LearningIndicator Component
 * 
 * Visibly demonstrates how MemoryOps AI learns through persistent memory
 * and historical resolution outcomes without claiming model weight retraining.
 */
const LearningIndicator = ({
  phase = 'recommendation', // 'recommendation' | 'resolved'
  actionName = 'Stop CompanySync.exe',
  previousAttempts = 3,
  successfulResolutions = 2,
  historicalSuccessRate = 100,
  reason = 'This action previously resolved the same issue on this device.',
  beforeStats = { successful: 3, attempts: 4 },
  afterStats = { successful: 4, attempts: 5 },
  incidentId
}) => {
  const isResolved = phase === 'resolved';

  const beforeRate = beforeStats.attempts > 0
    ? Math.round((beforeStats.successful / beforeStats.attempts) * 100)
    : historicalSuccessRate;

  const afterRate = afterStats.attempts > 0
    ? Math.round((afterStats.successful / afterStats.attempts) * 100)
    : 100;

  return (
    <div className={`learning-indicator-card ${isResolved ? 'is-resolved' : 'is-recommendation'}`}>
      <div className="learning-header">
        <div className="learning-title-row">
          <span className="learning-icon">{isResolved ? '📈' : '🧠'}</span>
          <span className="learning-title">LEARNING FROM HISTORY</span>
          <span className={`learning-badge ${isResolved ? 'updated' : 'active'}`}>
            {isResolved ? 'Memory Updated' : 'Historical Precedent'}
          </span>
        </div>
        <span className="learning-subtitle">
          {isResolved
            ? 'Resolution intelligence updated in persistent memory'
            : 'Evidence-based decision derived from Hindsight memories'}
        </span>
      </div>

      <div className="learning-body">
        {!isResolved ? (
          /* Recommendation / Pre-Execution Phase */
          <div className="learning-stats-grid">
            <div className="stat-box">
              <span className="stat-label">Previous attempts:</span>
              <span className="stat-value">{previousAttempts}</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Successful resolutions:</span>
              <span className="stat-value success">{successfulResolutions}</span>
            </div>

            <div className="stat-box full-width">
              <span className="stat-label">Current recommended action:</span>
              <span className="stat-value action-highlight">{actionName}</span>
            </div>

            <div className="stat-box full-width">
              <span className="stat-label">Historical success rate:</span>
              <div className="rate-container">
                <span className="stat-value rate-value">{historicalSuccessRate}%</span>
                <div className="learning-progress-bar">
                  <div
                    className="learning-progress-fill"
                    style={{ width: `${historicalSuccessRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {reason && (
              <div className="stat-box full-width reason-box">
                <span className="stat-label">Reason:</span>
                <span className="stat-value reason-text">{reason}</span>
              </div>
            )}
          </div>
        ) : (
          /* Post-Execution / Resolved Phase */
          <div className="learning-progression-view">
            <div className="progression-comparison">
              <div className="progression-card before">
                <span className="prog-label">Before this incident:</span>
                <div className="prog-numbers">
                  <span className="prog-val">{beforeStats.successful} successful / {beforeStats.attempts} attempts</span>
                  <span className="prog-rate">{beforeRate}% success</span>
                </div>
              </div>

              <div className="progression-arrow">➔</div>

              <div className="progression-card after">
                <span className="prog-label">After this incident:</span>
                <div className="prog-numbers">
                  <span className="prog-val good">{afterStats.successful} successful / {afterStats.attempts} attempts</span>
                  <span className="prog-rate good">{afterRate}% success</span>
                </div>
              </div>
            </div>

            <div className="resolution-action-summary">
              <div className="summary-field">
                <span className="field-name">Action verified:</span>
                <span className="field-content action-highlight">{actionName}</span>
              </div>
              <div className="summary-field">
                <span className="field-name">Hindsight update:</span>
                <span className="field-content h-bank-link">Bank: memoryops-it-support</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="learning-footer">
        <div className="learning-mechanism-disclaimer">
          <span className="info-glyph">ℹ️</span>
          <span className="disclaimer-text">
            <strong>Persistent Memory Adaptation:</strong> System learns through persistent memory and historical resolution outcomes — not AI model weight retraining.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LearningIndicator;
