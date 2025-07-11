# Resilient Email Service

A robust email sending service with retry logic, fallback mechanisms, circuit breakers, and rate limiting.

## Features

- ✅ **Retry Logic**: Exponential backoff for failed attempts
- ✅ **Fallback Mechanism**: Automatic provider switching on failure
- ✅ **Idempotency**: Prevents duplicate email sends
- ✅ **Rate Limiting**: Protects against spam and abuse
- ✅ **Status Tracking**: Real-time email delivery status
- ✅ **Circuit Breaker**: Prevents cascading failures
- ✅ **Queue System**: Asynchronous email processing
- ✅ **Logging**: Comprehensive logging with Winston
- ✅ **Unit Tests**: Full test coverage with Jest

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Deployment**: Docker, Heroku/Vercel ready

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Git

### Local Development

1. **Clone the repository**
git clone <your-repo-url>
cd resilient-email-service

text

2. **Install backend dependencies**
npm install

text

3. **Install frontend dependencies**
cd frontend
npm install
cd ..

text

4. **Build the project**
npm run build

text

5. **Run tests**
npm test

text

6. **Start development server**
npm run dev

text

7. **Start frontend (in another terminal)**
cd frontend
npm start

text

The API will be available at `http://localhost:3001` and the frontend at `http://localhost:3000`.

## API Endpoints

### Send Email
POST /api/emails
Content-Type: application/json

{
"to": "recipient@example.com",
"from": "sender@example.com",
"subject": "Test Email",
"body": "This is a test email"
}

text

### Get Email Status
GET /api/emails/:id

text

### Get All Emails
GET /api/emails

text

### Get Provider Status
GET /api/providers/status

text

### Health Check
GET /api/health

text

## Architecture

### Core Components

1. **EmailService**: Main service orchestrating email sending
2. **MockProviders**: Simulated email providers with configurable failure rates
3. **CircuitBreaker**: Prevents calls to failing services
4. **RateLimiter**: Controls request frequency
5. **Queue System**: Asynchronous email processing

### Design Patterns

- **Strategy Pattern**: Interchangeable email providers
- **Circuit Breaker Pattern**: Fault tolerance
- **Queue Pattern**: Asynchronous processing
- **Singleton Pattern**: Service instances

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)

### Rate Limiting

- Default: 100 requests per 15 minutes
- Configurable in `src/middleware/rateLimiter.ts`

### Circuit Breaker

- Failure threshold: 5 failures
- Timeout: 60 seconds
- Configurable in `src/utils/circuitBreaker.ts`

## Testing

Run all tests:
npm test

text

Run tests with coverage:
npm run test:coverage

text

Run tests in watch mode:
npm run test:watch

text

## Deployment

### Docker

1. **Build Docker image**
docker build -t resilient-email-service .

text

2. **Run container**
docker run -p 3001:3001 resilient-email-service

text

### Heroku

1. **Install Heroku CLI**
2. **Login and create app**
heroku login
heroku create your-app-name

text

3. **Deploy**
git push heroku main

text

## Assumptions

1. **Mock Providers**: Using simulated email providers instead of real services
2. **In-Memory Storage**: Email status stored in memory (use database in production)
3. **Rate Limiting**: IP-based rate limiting (consider user-based in production)
4. **Security**: Basic security measures (add authentication in production)

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Email templates and personalization
- [ ] Webhook notifications
- [ ] Metrics and monitoring dashboard
- [ ] Email scheduling
- [ ] Attachment support

## License

MIT License