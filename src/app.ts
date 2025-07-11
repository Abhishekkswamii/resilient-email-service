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

// Rate limiting
const rateLimiter = new RateLimiter(100, 60 * 1000); // 100 requests per minute
app.use('/api', rateLimiter.middleware());

// Initialize services with renamed providers
const providerA = new MockProviderA();
const providerB = new MockProviderB();

// Email provider names for dashboard
(providerA as any).name = 'Mock Email Provider A';
(providerB as any).name = 'Mock Email Provider B';

const providers = [providerA, providerB];
const emailService = new EmailService(providers);
const emailController = new EmailController(emailService);

// Routes
app.post('/api/emails', emailController.sendEmail);
app.get('/api/emails/:id', emailController.getEmailStatus);
app.get('/api/emails', emailController.getAllEmails);
app.get('/api/providers/status', emailController.getProviderStatus);
app.get('/api/metrics', emailController.getMetrics);
app.get('/api/logs', emailController.getSystemLogs);
app.get('/api/service/status', emailController.getServiceStatus);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
