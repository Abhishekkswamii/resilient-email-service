import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import EmailForm from './EmailForm';
import ProviderStatus from './ProviderStatus';
import EmailStatusTable from './EmailStatusTable';
import SystemLogs from './SystemLogs';
import '../styles/Dashboard.css';

interface DashboardData {
  metrics: any;
  providers: any[];
  emails: any[];
  logs: any[];
  serviceStatus: string;
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    metrics: {
      totalSent: 0,
      totalFailed: 0,
      queueLength: 0,
      successRate: 100,
      averageResponseTime: 0,
      requestsThisMinute: 0,
      rateLimitedRequests: 0
    },
    providers: [],
    emails: [],
    logs: [],
    serviceStatus: 'Active'
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [rateLimitWarning, setRateLimitWarning] = useState('');

  // Updated API_BASE to use environment variable REACT_APP_API_BASE_URL
  const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [metricsRes, providersRes, emailsRes, logsRes, serviceRes] = await Promise.all([
        fetch(`${API_BASE}/api/metrics`),
        fetch(`${API_BASE}/api/providers/status`),
        fetch(`${API_BASE}/api/emails`),
        fetch(`${API_BASE}/api/logs`),
        fetch(`${API_BASE}/api/service/status`)
      ]);

      // Handle rate limiting gracefully
      const handleResponse = async (response: Response, fallbackData: any) => {
        if (response.status === 429) {
          const errorData = await response.json();
          console.warn('Rate limited:', errorData.message);
          setRateLimitWarning(`Rate limited: ${errorData.message}. Retry in ${errorData.retryAfter}s`);
          setTimeout(() => setRateLimitWarning(''), 5000);
          return { data: fallbackData };
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      };

      const [metrics, providers, emails, logs, service] = await Promise.all([
        handleResponse(metricsRes, data.metrics),
        handleResponse(providersRes, data.providers), // Keep showing last known providers
        handleResponse(emailsRes, data.emails),
        handleResponse(logsRes, data.logs),
        handleResponse(serviceRes, { status: data.serviceStatus })
      ]);

      setData({
        metrics: metrics.data || data.metrics,
        providers: providers.data || data.providers, // Fallback to existing data
        emails: emails.data || data.emails,
        logs: logs.data || data.logs,
        serviceStatus: service.data?.status || data.serviceStatus
      });
      
      setLastRefresh(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleEmailSent = () => {
    // Refresh data after email is sent
    setTimeout(fetchAllData, 1000);
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Resilient Email Service Dashboard</h1>
        <div className="refresh-info">
          <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <button onClick={handleRefresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitWarning && (
        <div className="rate-limit-warning">
          ⚠️ {rateLimitWarning}
        </div>
      )}

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Service Status"
          value={data.serviceStatus}
          type="status"
          icon="🟢"
        />
        <MetricCard
          title="Emails Sent Today"
          value={data.metrics.totalSent}
          type="number"
          icon="📧"
        />
        <MetricCard
          title="Queue Length"
          value={data.metrics.queueLength}
          type="number"
          icon="⏳"
        />
        <MetricCard
          title="Failed Attempts"
          value={data.metrics.totalFailed}
          type="number"
          icon="❌"
        />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Email Form */}
        <div className="card">
          <h2>Send Email</h2>
          <EmailForm onEmailSent={handleEmailSent} />
        </div>

        {/* Provider Status */}
        <div className="card">
          <h2>Provider Status</h2>
          <ProviderStatus providers={data.providers} />
        </div>

        {/* Rate Limiting Metrics */}
        <div className="card">
          <h2>Rate Limiting & Performance</h2>
          <div className="rate-limit-metrics">
            <div className="metric-item">
              <span className="metric-label">Email Requests (10/min limit):</span>
              <span className="metric-value">{data.metrics.requestsThisMinute}/10</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Rate Limited Requests:</span>
              <span className="metric-value">{data.metrics.rateLimitedRequests}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average Response Time:</span>
              <span className="metric-value">{Math.round(data.metrics.averageResponseTime)}ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Success Rate:</span>
              <span className="metric-value">{Math.round(data.metrics.successRate)}%</span>
            </div>
          </div>
        </div>

        {/* Circuit Breaker Status */}
        <div className="card">
          <h2>Circuit Breaker Monitoring</h2>
          <div className="circuit-breaker-status">
            {data.providers.map(provider => (
              <div key={provider.name} className="circuit-item">
                <span className="circuit-provider">{provider.name}:</span>
                <span className={`circuit-state ${provider.circuitState?.toLowerCase()}`}>
                  {provider.circuitState || 'CLOSED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Email Status Table */}
      <div className="card full-width">
        <h2>Email Status Tracking</h2>
        <EmailStatusTable emails={data.emails} onRefresh={handleRefresh} />
      </div>

      {/* System Logs */}
      <div className="card full-width">
        <h2>System Logs</h2>
        <SystemLogs logs={data.logs} />
      </div>
    </div>
  );
};

export default Dashboard;
