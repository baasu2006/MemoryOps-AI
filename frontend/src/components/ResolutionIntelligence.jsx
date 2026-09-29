import React from 'react';
import './ResolutionIntelligence.css';

const ResolutionIntelligence = ({ stats = [], diagnostics, recommendation, mostSuccessfulAction }) => {
  const topAction = mostSuccessfulAction || (recommendation ? {
    action: recommendation.action,
    displayName: recommendation.displayName || recommendation.action,
    successRate: recommendation.confidence || 100,
    reason: recommendation.reason
  } : (stats.length > 0 ? stats[0] : null));

  return (
    <div className="bottom-panel-section res-intel">
      <div className="section-header">
        <div className="header-badge-row">
          <h3>📊 RESOLUTION INTELLIGENCE</h3>
          <span className="intel-live-badge">⚡ Live Incident Learning</span>
        </div>
        <span className="subtitle">Historical troubleshooting success rates derived from Hindsight memory</span>
      </div>

      {/* Top Action Recommendation Highlight */}
      {topAction && (
        <div className="top-recommendation-banner">
          <div className="banner-icon">🎯</div>
          <div className="banner-content">
            <span className="banner-label">Most Successful Action:</span>
            <span className="banner-action-name">{topAction.displayName || topAction.action}</span>
            <span className="banner-rate-badge">{topAction.successRate}% Success Rate</span>
            {topAction.reason && <p className="banner-reason">{topAction.reason}</p>}
          </div>
        </div>
      )}

      {/* Resolution Intelligence Table */}
      <div className="table-container">
        <table className="intel-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Attempts</th>
              <th>Success</th>
              <th>Failure</th>
              <th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.length > 0 ? (
              stats.map((row, i) => {
                const isTop = (topAction?.action === row.action);
                const rate = row.successRate ?? (row.attempts > 0 ? Math.round((row.successes / row.attempts) * 100) : 0);
                const rateColor = rate >= 80 ? 'green' : rate >= 50 ? 'orange' : 'red';

                return (
                  <tr key={row.action || i} className={isTop ? 'highlight-row' : ''}>
                    <td className="action-cell">
                      <div className="action-label-wrapper">
                        <span className="action-name-text">{row.displayName || row.action?.replace(/_/g, ' ')}</span>
                        {isTop && (
                          <span className="recommended-pill">★ Recommended</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="count-badge attempts-badge">{row.attempts}</span>
                    </td>
                    <td>
                      <span className="count-badge success-badge">{row.successes}</span>
                    </td>
                    <td>
                      <span className="count-badge failure-badge">{row.failures}</span>
                    </td>
                    <td>
                      <div className="rate-cell">
                        <span className={`rate-badge rate-${rateColor}`}>{rate}%</span>
                        <div className="rate-bar-bg">
                          <div
                            className={`rate-bar-fill fill-${rateColor}`}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Loading resolution intelligence metrics...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="intel-footer-learning-note">
        <span className="info-icon">🧠</span>
        <span className="note-text">
          <strong>Learning Mechanism:</strong> Resolution Intelligence dynamically updates through Hindsight persistent memory and verified incident outcomes after every remediation — without retraining model weights.
        </span>
      </div>
    </div>
  );
};

export default ResolutionIntelligence;
