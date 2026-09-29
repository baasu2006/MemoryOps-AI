import React from 'react';
import './EmployeeProfile.css';
import StatusBadge from './StatusBadge';

const EmployeeProfile = ({ employee, isLoading, incidents = [] }) => {
  if (isLoading || !employee) {
    return <div className="panel employee-panel loading">Loading profile...</div>;
  }

  const getInitials = (name) => {
    return (name || 'Arjun Rao').split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalIncidents = employee.totalIncidents || incidents.length || 5;
  const openIssues = employee.openIssues || incidents.filter(i => !i.resolution?.resolved).length || 1;
  const resolved = employee.resolved || incidents.filter(i => i.resolution?.resolved).length || 4;
  const recentIncidents = (incidents || employee.history || []).slice(0, 3);

  return (
    <div className="panel employee-panel">
      <div className="panel-header">
        <h2>👤 EMPLOYEE PROFILE</h2>
      </div>
      
      <div className="profile-content">
        <div className="profile-header-card">
          <div className="avatar">{getInitials(employee.name)}</div>
          <div className="info">
            <h3>{employee.name || 'Arjun Rao'}</h3>
            <span className="emp-id-badge">{employee.id || employee.employeeId || 'E1024'}</span>
          </div>
          <StatusBadge status={employee.status || 'online'} />
        </div>

        <div className="details-section">
          <div className="detail-row">
            <span className="label">Employee ID:</span>
            <span className="value strong-val">{employee.id || employee.employeeId || 'E1024'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Name:</span>
            <span className="value strong-val">{employee.name || 'Arjun Rao'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Department:</span>
            <span className="value">{employee.department || 'Finance'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Job Title:</span>
            <span className="value">{employee.jobTitle || 'Analyst'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Device:</span>
            <span className="value highlight-blue">💻 {employee.device || 'Dell Latitude 5440'}</span>
          </div>
          <div className="detail-row">
            <span className="label">OS:</span>
            <span className="value">🖥️ {employee.os || employee.operatingSystem || 'Windows 11'}</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">{totalIncidents}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-box">
            <span className="stat-value warning">{openIssues}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-box">
            <span className="stat-value success">{resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>

        {recentIncidents.length > 0 && (
          <div className="recent-incidents">
            <h4>Recent Incident History</h4>
            {recentIncidents.map((inc, i) => (
              <div key={inc.id || i} className="recent-incident-card">
                <div className="incident-header">
                  <span className="incident-id">{inc.id}</span>
                  <StatusBadge status={inc.resolution?.resolved ? 'resolved' : 'critical'} />
                </div>
                <span className="incident-issue">{inc.issue}</span>
                <span className="incident-date">{new Date(inc.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
