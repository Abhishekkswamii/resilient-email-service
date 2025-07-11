import React from 'react';

interface Email {
  id: string;
  status: string;
  provider: string;
  attempts: number;
  lastAttempt: string;
  error?: string;
}

interface EmailStatusTableProps {
  emails: Email[];
  onRefresh: () => void;
}

const EmailStatusTable: React.FC<EmailStatusTableProps> = ({ emails, onRefresh }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'retrying': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent': return '#10b981';
      case 'failed': return '#ef4444';
      case 'pending': return '#f59e0b';
      case 'retrying': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="email-status-table">
      <div className="table-header">
        <button onClick={onRefresh} className="refresh-btn small">
          🔄 Refresh
        </button>
      </div>
      
      {emails.length === 0 ? (
        <div className="empty-state">
          <p>No emails found. Send your first email to see it here!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Attempts</th>
                <th>Last Attempt</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {emails.slice(0, 10).map((email) => (
                <tr key={email.id}>
                  <td className="email-id">
                    {email.id.substring(0, 8)}...
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(email.status),
                        color: 'white'
                      }}
                    >
                      {getStatusIcon(email.status)} {email.status}
                    </span>
                  </td>
                  <td>{email.provider || 'N/A'}</td>
                  <td>{email.attempts}</td>
                  <td>{new Date(email.lastAttempt).toLocaleString()}</td>
                  <td className="error-cell">
                    {email.error ? (
                      <span className="error-text" title={email.error}>
                        {email.error.substring(0, 30)}...
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmailStatusTable;
