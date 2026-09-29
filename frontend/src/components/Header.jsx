import React from 'react';
import './Header.css';

const Header = ({ apiHealth = {}, onCreateTicket }) => {
  const services = apiHealth?.services || {};
  
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-icon">🧠</div>
        <h1>MemoryOps AI</h1>
        <span className="subtitle">Persistent IT Support & Resolution Intelligence</span>
      </div>
      
      <div className="header-center">
        <div className="status-indicator">
          <span className={`dot ${apiHealth.status === 'ok' ? 'green' : apiHealth.status === 'error' ? 'red' : 'yellow'}`}></span>
          <span>API</span>
        </div>
        <div className="status-indicator">
          <span className={`dot ${services.hindsight ? 'green' : 'yellow'}`}></span>
          <span>Hindsight</span>
        </div>
        <div className="status-indicator">
          <span className={`dot ${services.groq ? 'green' : 'yellow'}`}></span>
          <span>Groq</span>
        </div>
      </div>
      
      <div className="header-right">
        <button className="ticket-btn" onClick={onCreateTicket} title="Create IT Ticket">
          🎫 Escalate
        </button>
        <span className="date-time">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </header>
  );
};

export default Header;
