import React, { useState, useEffect } from 'react';
import './App.css';

interface EmailResponse {
  id: string;
  status: string;
  provider: string;
  attempts: number;
  lastAttempt: string;
  error?: string;
}

interface ProviderStatus {
  name: string;
  healthy: boolean;
  circuitState: string;
}

function App() {
  // Initialize with empty arrays to prevent undefined errors
  const [emails, setEmails] = useState<EmailResponse[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    to: '',
    from: '',
    subject: '',
    body: ''
  });

  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

  useEffect(() => {
    fetchEmails();
    fetchProviderStatus();
    const interval = setInterval(() => {
      fetchEmails();
      fetchProviderStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/emails`);
      const data = await response.json();
      setEmails(data.data || []); // Fallback to empty array
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setEmails([]); // Set to empty array on error
      setLoading(false);
    }
  };

  const fetchProviderStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/providers/status`);
      const data = await response.json();
      setProviders(data.data || []); // Fallback to empty array
    } catch (error) {
      console.error('Error fetching provider status:', error);
      setProviders([]); // Set to empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setFormData({ to: '', from: '', subject: '', body: '' });
        fetchEmails();
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Resilient Email Service</h1>
      </header>
      
      <div className="container">
        <div className="form-section">
          <h2>Send Email</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="To"
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="From"
              value={formData.from}
              onChange={(e) => setFormData({...formData, from: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
            <textarea
              placeholder="Body"
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              required
            />
            <button type="submit">Send Email</button>
          </form>
        </div>

        <div className="status-section">
          <h2>Provider Status</h2>
          <div className="providers">
            {providers.length > 0 ? (
              providers.map((provider) => (
                <div key={provider.name} className={`provider ${provider.healthy ? 'healthy' : 'unhealthy'}`}>
                  <h3>{provider.name}</h3>
                  <p>Status: {provider.healthy ? 'Healthy' : 'Unhealthy'}</p>
                  <p>Circuit: {provider.circuitState}</p>
                </div>
              ))
            ) : (
              <p>Loading provider status...</p>
            )}
          </div>
        </div>

        <div className="emails-section">
          <h2>Email History</h2>
          <div className="emails-list">
            {loading ? (
              <p>Loading emails...</p>
            ) : emails.length > 0 ? (
              emails.map((email) => (
                <div key={email.id} className={`email-item ${email.status}`}>
                  <div className="email-header">
                    <span className="email-id">{email.id.substring(0, 8)}...</span>
                    <span className={`status ${email.status}`}>{email.status}</span>
                  </div>
                  <div className="email-details">
                    <p>Provider: {email.provider || 'N/A'}</p>
                    <p>Attempts: {email.attempts}</p>
                    <p>Last Attempt: {new Date(email.lastAttempt).toLocaleString()}</p>
                    {email.error && <p className="error">Error: {email.error}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p>No emails found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;