import React from 'react';
import './AuthorizationCard.css';
import LearningIndicator from './LearningIndicator';

const ACTION_DISPLAY_MAP = {
  stop_company_sync: 'Stop CompanySync.exe',
  restart_device: 'Restart Device',
  clear_temp_files: 'Clear Temporary Files',
  reset_network: 'Reset Network',
  restart_outlook: 'Restart Outlook'
};

const ACTION_RISK_MAP = {
  stop_company_sync: 'The process will be temporarily stopped.',
  restart_device: 'Open unsaved files and running user sessions will be closed.',
  clear_temp_files: 'Temporary application cache files will be removed.',
  reset_network: 'Active VPN and network connections will temporarily reset.',
  restart_outlook: 'Outlook application will close and reload Exchange sync.'
};

const AuthorizationCard = ({ data, onAuthorize, onReject }) => {
  const actionKey = data.action || 'stop_company_sync';
  const actionLabel = data.displayName || ACTION_DISPLAY_MAP[actionKey] || actionKey;
  const whyReason = data.reason || 'This action previously resolved the same issue on this device.';
  const riskExplanation = data.risk || ACTION_RISK_MAP[actionKey] || 'The process will be temporarily stopped.';
  const status = data.status || 'pending';

  return (
    <div className={`auth-card ${status}`}>
      <div className="auth-header">
        <div className="auth-title-row">
          <span className="icon">🛡️</span>
          <h4>AI RECOMMENDATION</h4>
        </div>
        <span className={`status-tag ${status}`}>
          {status === 'authorized' ? '✓ Authorization Granted' : status === 'rejected' ? '✗ Authorization Rejected' : '⏳ Awaiting Employee Authorization'}
        </span>
      </div>
      
      <div className="auth-body">
        <div className="auth-field-block">
          <span className="field-label">Action:</span>
          <span className="field-value action-highlight">{actionLabel}</span>
        </div>
        
        <div className="auth-field-block">
          <span className="field-label">Why:</span>
          <span className="field-value">{whyReason}</span>
        </div>

        <div className="auth-field-block risk-block">
          <span className="field-label">Risk:</span>
          <span className="field-value risk-highlight">{riskExplanation}</span>
        </div>

        {/* Explicit Learning from History Indicator */}
        <LearningIndicator
          phase="recommendation"
          actionName={actionLabel}
          previousAttempts={data.previousAttempts ?? 3}
          successfulResolutions={data.successfulResolutions ?? 2}
          historicalSuccessRate={data.confidence ?? 100}
          reason={whyReason}
        />
      </div>
      
      {status === 'pending' && (
        <div className="auth-actions">
          <button className="btn-reject" onClick={onReject}>
            [ REJECT ]
          </button>
          <button className="btn-authorize" onClick={onAuthorize}>
            ✓ [ AUTHORIZE ACTION ]
          </button>
        </div>
      )}

      {status === 'authorized' && (
        <div className="auth-status-msg authorized">
          <span className="spinner-dot">⚡</span> Authorization granted. Executing action safely via backend guard...
        </div>
      )}

      {status === 'rejected' && (
        <div className="auth-status-msg rejected">
          <span>✗ Action was rejected by the employee. Remediation bypassed.</span>
        </div>
      )}
    </div>
  );
};

export default AuthorizationCard;
