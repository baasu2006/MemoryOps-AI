import React from 'react';
import './DiagnosticCard.css';

const DiagnosticCard = ({ data }) => {
  if (!data) return null;

  const getSeverityClass = (value) => {
    if (value >= 85) return 'critical';
    if (value >= 60) return 'warning';
    return 'normal';
  };

  const cpu = data.cpu ?? 94;
  const ram = data.ram ?? 87;
  const disk = data.disk ?? 72;
  const process = data.problematicProcess || data.process;

  return (
    <div className="diagnostic-card">
      <div className="diag-header">
        <span className="icon">📊</span>
        <h4>CURRENT DIAGNOSTIC</h4>
        <span className="timestamp">Live Telemetry</span>
      </div>
      
      <div className="diag-metrics">
        <div className="metric-row">
          <div className="metric-labels">
            <span>CPU</span>
            <span className={`metric-value ${getSeverityClass(cpu)}`}>{cpu}%</span>
          </div>
          <div className="progress-bg">
            <div className={`progress-fill ${getSeverityClass(cpu)}`} style={{ width: `${cpu}%` }}></div>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-labels">
            <span>RAM</span>
            <span className={`metric-value ${getSeverityClass(ram)}`}>{ram}%</span>
          </div>
          <div className="progress-bg">
            <div className={`progress-fill ${getSeverityClass(ram)}`} style={{ width: `${ram}%` }}></div>
          </div>
        </div>
        
        <div className="metric-row">
          <div className="metric-labels">
            <span>Disk</span>
            <span className={`metric-value ${getSeverityClass(disk)}`}>{disk}%</span>
          </div>
          <div className="progress-bg">
            <div className={`progress-fill ${getSeverityClass(disk)}`} style={{ width: `${disk}%` }}></div>
          </div>
        </div>
      </div>

      {process && (
        <div className="diag-finding">
          <span className="finding-label">⚠️ Problematic Process:</span>
          <span className="finding-process">{process}</span>
        </div>
      )}
    </div>
  );
};

export default DiagnosticCard;
