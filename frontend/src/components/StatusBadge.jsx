import React from 'react';
import './StatusBadge.css';

const LABELS = {
  resolved: '✓ Resolved',
  critical: '✗ Critical',
  warning: '⚠ Warning',
  pending: '⏳ Pending',
  info: 'ℹ Info',
  online: '● Online',
  offline: '○ Offline',
  issue: '⚠ Issue'
};

const StatusBadge = ({ status }) => {
  const normalized = (status || 'info').toLowerCase();
  return (
    <span className={`status-badge ${normalized}`}>
      {LABELS[normalized] || status}
    </span>
  );
};

export default StatusBadge;
