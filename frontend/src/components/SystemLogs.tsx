import React from 'react';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  service: string;
}

interface SystemLogsProps {
  logs: SystemLog[];
}

const SystemLogs: React.FC<SystemLogsProps> = ({ logs }) => {
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'error': return '❌';
      case 'warn': return '⚠️';
      default: return '📝';
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info': return '#3b82f6';
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div className="system-logs">
      {logs.length === 0 ? (
        <div className="empty-state">
          <p>No system logs available</p>
        </div>
      ) : (
        <div className="logs-container">
          {logs.slice(0, 20).map((log) => (
            <div key={log.id} className="log-entry">
              <div className="log-header">
                <span 
                  className="log-level"
                  style={{ color: getLogColor(log.level) }}
                >
                  {getLogIcon(log.level)} {log.level.toUpperCase()}
                </span>
                <span className="log-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="log-service">{log.service}</span>
              </div>
              <div className="log-message">{log.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
