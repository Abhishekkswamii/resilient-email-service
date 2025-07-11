import React, { useState } from 'react';

interface EmailFormProps {
  onEmailSent: () => void;
}

const EmailForm: React.FC<EmailFormProps> = ({ onEmailSent }) => {
  const [formData, setFormData] = useState({
    to: '',
    from: '',
    subject: '',
    body: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

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
        setMessage('Email queued successfully!');
        onEmailSent();
      } else if (response.status === 429) {
        const errorData = await response.json();
        setMessage(`Rate limit exceeded: ${errorData.message}. Please wait ${errorData.retryAfter} seconds.`);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <div className="form-group">
        <label htmlFor="to">To *</label>
        <input
          type="email"
          id="to"
          value={formData.to}
          onChange={(e) => setFormData({ ...formData, to: e.target.value })}
          required
          placeholder="recipient@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="from">From *</label>
        <input
          type="email"
          id="from"
          value={formData.from}
          onChange={(e) => setFormData({ ...formData, from: e.target.value })}
          required
          placeholder="sender@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          placeholder="Email subject"
        />
      </div>

      <div className="form-group">
        <label htmlFor="body">Message *</label>
        <textarea
          id="body"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          required
          placeholder="Email message content"
          rows={4}
        />
      </div>

      <button type="submit" disabled={isSubmitting} className="submit-btn">
        {isSubmitting ? 'Sending...' : 'Send Email'}
      </button>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Rate limit') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </form>
  );
};

export default EmailForm;
