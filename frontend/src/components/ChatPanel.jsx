import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';
import DiagnosticCard from './DiagnosticCard';
import AuthorizationCard from './AuthorizationCard';
import ResolutionCard from './ResolutionCard';

const QUICK_PROMPTS = [
  'My laptop is slow.',
  'Corporate VPN timeout error.',
  'Wi-Fi connected but no internet.',
  'Outlook not syncing mail.',
  'Application keeps crashing.',
  'Cannot login / MFA token expired.',
  'Network printer is offline.',
  'High network latency in Teams calls.',
  'Browser freezing with high RAM usage.',
  'System unresponsive after 30 days uptime.'
];

const ChatPanel = ({
  messages,
  onSendMessage,
  onAuthorize,
  onReject,
  onTryAlternativeAction,
  onOpenTicketModal,
  isLoading
}) => {
  const [input, setInput] = useState('');
  const messagesContainerRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case 'text':
        return <div className="text-content">{msg.content}</div>;

      case 'system':
        return <div className="system-content">{msg.content}</div>;

      case 'diagnostic':
        return <DiagnosticCard data={msg.data} />;

      case 'action-proposal':
        return (
          <AuthorizationCard
            data={msg.data}
            onAuthorize={() => onAuthorize(msg.data)}
            onReject={() => onReject(msg.data)}
          />
        );

      case 'resolution':
        return <ResolutionCard data={msg.data} />;

      case 'remediation-failure':
        return (
          <div className="failure-recovery-card">
            <div className="failure-header">
              <span className="fail-icon">⚠️</span>
              <h4>Previous remediation did not resolve the issue.</h4>
            </div>
            <p className="failure-desc">{msg.content}</p>
            <div className="failure-actions">
              <button
                className="btn-alt-action"
                onClick={() => onTryAlternativeAction ? onTryAlternativeAction(msg.data) : onSendMessage('Suggest an alternative troubleshooting action')}
              >
                🔄 [ Try another approved action ]
              </button>
              <button
                className="btn-create-ticket"
                onClick={onOpenTicketModal}
              >
                🎫 [ Create IT Ticket ]
              </button>
            </div>
          </div>
        );

      case 'escalation-recommendation':
        return (
          <div className="escalation-recommendation-card">
            <div className="escalation-header">
              <span className="escalate-icon">🚨</span>
              <h4>Escalation Recommended</h4>
            </div>
            <p className="escalation-text">{msg.content}</p>
            <div className="escalation-note">
              <span>Note: A ticket will NOT be created without your explicit authorization.</span>
            </div>
            <div className="escalation-actions">
              <button className="btn-auth-ticket" onClick={onOpenTicketModal}>
                🎫 [ Authorize IT Ticket Escalation ]
              </button>
              <button className="btn-alt-action" onClick={() => onSendMessage('Let me retry one more action')}>
                🔄 [ Try one more action ]
              </button>
            </div>
          </div>
        );

      case 'rejection-notice':
        return (
          <div className="rejection-notice-box">
            <p className="rejection-text">{msg.content}</p>
            <div className="failure-actions">
              <button
                className="btn-alt-action"
                onClick={() => onSendMessage('What other actions are available?')}
              >
                🔄 [ Try another approved action ]
              </button>
              <button className="btn-create-ticket" onClick={onOpenTicketModal}>
                🎫 [ Create IT Ticket ]
              </button>
            </div>
          </div>
        );

      default:
        return <div className="text-content">{msg.content || 'Unknown message type'}</div>;
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title-group">
          <span className="chat-title">💬 AI SUPPORT CHAT</span>
          <span className="chat-agent-badge">Agentic Resolution Engine</span>
        </div>
        {isLoading && <span className="typing-indicator">Analyzing Telemetry & Memories...</span>}
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.role} ${msg.type === 'system' ? 'system-msg' : ''}`}>
            {msg.role === 'assistant' && msg.type !== 'system' && (
              <div className="ai-avatar">🧠</div>
            )}
            <div className={`message-bubble ${msg.type !== 'text' && msg.type !== 'system' ? 'special-card-bubble' : ''}`}>
              {renderMessageContent(msg)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper assistant">
            <div className="ai-avatar">🧠</div>
            <div className="message-bubble">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      <div className="chat-input-area">
        <div className="quick-prompts-bar">
          <span className="quick-label">Quick Prompts:</span>
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              className="quick-prompt-btn"
              onClick={() => handleQuickPrompt(p)}
              disabled={isLoading}
            >
              "{p}"
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your issue (e.g., 'My laptop is slow.')..."
            className="chat-input"
            disabled={isLoading}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isLoading}>
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
