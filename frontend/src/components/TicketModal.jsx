import React from 'react';
import './TicketModal.css';

const TicketModal = ({ employee, diagnostics, actionProposal, onSubmit, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎫 Create IT Escalation Ticket</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Employee</label>
              <input type="text" readOnly value={`${employee?.name || ''} (${employee?.id || ''})`} className="readonly" />
            </div>
            <div className="form-group">
              <label>Device</label>
              <input type="text" readOnly value={employee?.device || ''} className="readonly" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Operating System</label>
              <input type="text" readOnly value={employee?.os || ''} className="readonly" />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" readOnly value={employee?.department || ''} className="readonly" />
            </div>
          </div>
          
          {diagnostics && (
            <div className="form-group">
              <label>Diagnostic Summary</label>
              <div className="diagnostic-preview">
                <span>CPU: {diagnostics.cpu}%</span>
                <span>RAM: {diagnostics.ram}%</span>
                <span>Disk: {diagnostics.disk}%</span>
                {diagnostics.problematicProcess && (
                  <span className="process-flag">⚠ {diagnostics.problematicProcess}</span>
                )}
              </div>
            </div>
          )}

          {actionProposal && (
            <div className="form-group">
              <label>Recommended Action</label>
              <input type="text" readOnly value={actionProposal.displayName || actionProposal.action || ''} className="readonly" />
            </div>
          )}
          
          <div className="form-group">
            <label>Authorization Status</label>
            <input type="text" readOnly value={actionProposal?.status || 'No action proposed'} className="readonly" />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea rows={3} placeholder="Add context for the IT team..." />
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-submit" onClick={onSubmit}>Create Ticket</button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
