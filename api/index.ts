import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { EmailService } from '../src/services/emailService';
import { EmailController } from '../src/controllers/emailController';
import { MockProviderA } from '../src/providers/mockProviderA';
import { MockProviderB } from '../src/providers/mockProviderB';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize services
const providerA = new MockProviderA();
const providerB = new MockProviderB();
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
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
