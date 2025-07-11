Resilient Email Service
A production-ready, fault-tolerant email sending service built with TypeScript, featuring robust resilience patterns and basic monitoring capabilities.
🚀 Features

🔄 Automatic Failover: Seamlessly switches between two mock email providers
⚡ Smart Retry Logic: Implements exponential backoff for failed attempts
🛡️ Idempotency: Prevents duplicate email sends using unique keys
📏 Rate Limiting: Controls email sending rate to prevent abuse
📊 Status Tracking: Monitors email sending attempts and outcomes
🔌 Circuit Breaker: Protects against cascading failures
📝 Basic Logging: Tracks system operations and errors
📋 Queue System: Manages email sending with a simple in-memory queue

📋 Table of Contents

Quick Start
Architecture
API Reference
Configuration
Testing
Deployment
Monitoring
Contributing
License

🏃 Quick Start
Prerequisites

Node.js 16+ and npm 8+
Git for version control

Installation
# 1. Clone the repository
git clone https://github.com/yourusername/resilient-email-service.git
cd resilient-email-service

# 2. Install dependencies
npm install

# 3. Build and start the service
npm run build
npm run start

Verification

Health Check: Visit http://localhost:3000/api/health to confirm service is running
Expected Output: {"status": "healthy"}

🏗️ Architecture
System Overview
graph TB
    A[Client] --> B[Express API Server]
    B --> C[Rate Limiter]
    B --> D[Email Service]
    D --> E[Queue System]
    D --> F[Circuit Breaker]
    F --> G[Mock Provider A]
    F --> H[Mock Provider B]
    D --> I[Logger]

Core Components



Component
Responsibility
Technology



EmailService
Orchestrates email delivery
TypeScript Class


MockProviders
Simulates email services
Interface Pattern


CircuitBreaker
Prevents cascading failures
State Machine


RateLimiter
Controls request rates
Express Middleware


QueueSystem
Manages email processing
In-memory Queue


Logger
Tracks operations and errors
Console-based


Resilience Patterns

Retry Logic: Exponential backoff (1s → 2s → 4s)
Failover: Switches to secondary provider on failure
Circuit Breaker: Opens after 5 failures, resets after 30s
Rate Limiting: 10 emails per minute
Idempotency: Uses content-based keys to prevent duplicates

📡 API Reference
Base URL

Development: http://localhost:3000/api
Production: https://your-domain.com/api

Core Endpoints
Send Email
POST /api/emails
Content-Type: application/json

{
  "to": "recipient@example.com",
  "from": "sender@example.com",
  "subject": "Test Subject",
  "body": "Email content"
}

Response (202 Accepted)
{
  "message": "Email queued for sending",
  "data": {
    "id": "abc123-def456",
    "status": "pending",
    "attempts": 0,
    "lastAttempt": "2025-07-11T14:33:00Z"
  }
}

Get Email Status
GET /api/emails/{emailId}

Get All Emails
GET /api/emails

Get System Status
GET /api/health

Response
{
  "status": "healthy"
}

Status Codes



Code
Meaning
Description



200
OK
Successful request


202
Accepted
Email queued successfully


400
Bad Request
Invalid input data


429
Too Many Requests
Rate limit exceeded


500
Internal Error
System error


⚙️ Configuration
Environment Variables
Create a .env file in the project root:
# Server Configuration
PORT=3000
NODE_ENV=development

# Rate Limiting
EMAIL_RATE_LIMIT=10    # Emails per minute

# Queue Processing
QUEUE_PROCESS_INTERVAL=5000  # Processing interval (ms)

# Circuit Breaker
CIRCUIT_FAILURE_THRESHOLD=5  # Failures before opening
CIRCUIT_RESET_TIMEOUT=30000  # Reset timeout (ms)

# Logging
LOG_LEVEL=info

Provider Configuration
Mock providers are configured in src/providers/:
// MockProviderA
private failureRate = 0.2;  // 20% failure rate

// MockProviderB
private failureRate = 0.1;  // 10% failure rate

🧪 Testing
Running Tests
# Run all tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

Test Coverage



Component
Coverage
Status



EmailService
95%+
✅


RateLimiter
90%+
✅


CircuitBreaker
90%+
✅


MockProviders
85%+
✅


Test Examples
test('prevents duplicate emails', async () => {
  const email = {
    to: 'test@example.com',
    from: 'sender@example.com',
    subject: 'Test',
    body: 'Content'
  };
  const result1 = await emailService.sendEmail(email);
  const result2 = await emailService.sendEmail(email);
  expect(result1.id).toEqual(result2.id);
});

test('enforces rate limiting', async () => {
  const responses = await Promise.all(
    Array.from({ length: 11 }, () => sendEmailRequest())
  );
  expect(responses[10].status).toBe(429);
});

🚀 Deployment
Cloud Platforms
Heroku
heroku create your-app-name
heroku config:set NODE_ENV=production
git push heroku main

Vercel
vercel --prod

AWS/DigitalOcean

Deploy using Node.js runtime
Configure load balancer and auto-scaling
Set up monitoring and alerting

Production Checklist

Configure environment variables
Enable HTTPS with SSL certificates
Set up monitoring and alerting
Configure log aggregation
Tune rate limits for production
Establish backup procedures

📊 Monitoring
Key Metrics

Service Uptime: Target 99.9%
Success Rate: Target >95%
Queue Length: Alert if >50
Response Time: Alert if >1000ms

Alerting Setup
Monitor for:

Service downtime > 1 minute
Success rate < 90% for 5 minutes
Circuit breaker in OPEN state
Queue processing delays

Troubleshooting
Connection Issues
# Check service status
curl http://localhost:3000/api/health

# Restart service
npm run start

Rate Limiting Errors

Symptom: 429 "Too Many Requests"
Solution: Wait 1 minute or adjust EMAIL_RATE_LIMIT

Provider Issues

Symptom: Emails failing consistently
Solution: Check logs and provider health via /api/health

🤝 Contributing
Development Setup
# Fork and clone
git clone https://github.com/yourusername/resilient-email-service.git
cd resilient-email-service

# Create feature branch
git checkout -b feature/your-feature

# Install dependencies
npm install

# Run tests
npm test

# Start development
npm run start

Code Standards

Use TypeScript with strict mode
Follow ESLint rules
Maintain 90%+ test coverage
Update documentation for new features

Pull Request Process

Create feature branch from main
Implement changes with tests
Update documentation
Submit PR with detailed description
Ensure CI/CD checks pass


📞 Support

Email: abhishekswami3330@gmail.com
Linkedin: linkedin.com/in/abhishekswamii/

Built with ❤️ using TypeScript and Express.js