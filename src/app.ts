import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { EmailService } from './services/emailService';
import { EmailController } from './controllers/emailController';
import { MockProviderA } from './providers/mockProviderA';
import { MockProviderB } from './providers/mockProviderB';
import RateLimiter from './middleware/rateLimiter';
import logger from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Initialize services with renamed providers
const providerA = new MockProviderA();
const providerB = new MockProviderB();

// Override provider names for dashboard
(providerA as any).name = 'Mock Email Provider A';
(providerB as any).name = 'Mock Email Provider B';

const providers = [providerA, providerB];
const emailService = new EmailService(providers);
const emailController = new EmailController(emailService);

// Tiered rate limiting strategy
const emailSendLimiter = new RateLimiter(10, 60 * 1000, emailService); // 10 emails per minute
const statusLimiter = new RateLimiter(60, 60 * 1000); // 60 status checks per minute
const monitoringLimiter = new RateLimiter(120, 60 * 1000); // 120 monitoring requests per minute

// Routes with specific rate limits
app.post('/api/emails', emailSendLimiter.middleware(), emailController.sendEmail);
app.get('/api/emails/:id', statusLimiter.middleware(), emailController.getEmailStatus);
app.get('/api/emails', statusLimiter.middleware(), emailController.getAllEmails);

// Monitoring endpoints with higher limits
app.get('/api/providers/status', monitoringLimiter.middleware(), emailController.getProviderStatus);
app.get('/api/metrics', monitoringLimiter.middleware(), emailController.getMetrics);
app.get('/api/logs', monitoringLimiter.middleware(), emailController.getSystemLogs);
app.get('/api/service/status', monitoringLimiter.middleware(), emailController.getServiceStatus);

// Health check without rate limiting
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    rateLimits: {
      emailSending: '10/minute',
      statusChecks: '60/minute',
      monitoring: '120/minute'
    }
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile('index.html', { root: 'frontend/build' });
  });
}

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
