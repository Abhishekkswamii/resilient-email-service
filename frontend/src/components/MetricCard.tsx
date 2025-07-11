import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  type: 'status' | 'number';
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, type, icon, trend }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'inactive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-content">
        <div 
          className={`metric-value ${type === 'status' ? 'status-value' : 'number-value'}`}
          style={type === 'status' ? { color: getStatusColor(value as string) } : {}}
        >
          {value}
        </div>
        {trend && (
          <div className={`metric-trend ${trend}`}>
            {trend === 'up' && '↗️'}
            {trend === 'down' && '↘️'}
            {trend === 'stable' && '➡️'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
