# 📧 Resilient Email Service

A **production-grade**, fault-tolerant email service built using **TypeScript**, **Express**, and **React**. It ensures reliable email delivery by incorporating **resilience patterns** such as **automatic failover**, **retry with exponential backoff**, **rate limiting**, **idempotency**, and **real-time monitoring**.

---

## 🚀 Key Features

- 🔄 **Retry with Exponential Backoff**  
  Automatically retries failed email requests with backoff intervals.

- 🔁 **Fallback Provider Switching**  
  If the primary provider fails, the service automatically switches to a secondary one.

- 🔐 **Idempotent Requests**  
  Duplicate prevention using content-based keys.

- 🛡️ **Basic Rate Limiting**  
  Prevents abuse with per-minute email request limits.

- ⚡ **Circuit Breaker**  
  Avoids repeated failures by blocking failing providers temporarily.

- ⏳ **Queue System**  
  Emails are processed in the background from a queue.

- 📊 **Real-time Dashboard**  
  Visual monitoring of provider status, metrics, queue length, and logs.

- 🧪 **Unit Tests with Coverage Reports**  
  Ensures correctness and reliability.

---

## 🏗️ Project Structure

```
resilient-email-service/
├── backend/ (src/)
│   ├── controllers/         # API request handlers
│   ├── services/            # EmailService, queue, retry logic
│   ├── providers/           # MockProviderA / MockProviderB
│   ├── middleware/          # Rate limiting
│   ├── models/              # Type definitions
│   ├── utils/               # Logger, circuit breaker
│   ├── tests/               # Unit tests
│   └── server.ts / app.ts   # Express entry
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Dashboard, StatusTable, Logs, Form
│   │   ├── styles/          # CSS
│   │   └── App.tsx          # React App entry
├── Dockerfile / docker-compose.yml
├── .env / tsconfig.json / package.json
├── README.md / LICENSE / CHANGELOG.md
```

---

## 🔧 System Flow

```
📱 Frontend Dashboard
    ↓ API Calls
🌐 Express Router
    ↓ Middleware
🛡️ Rate Limiter
    ↓ Controller
🎮 Email Controller
    ↓ Service Layer
🔧 Email Service
    ↓ Queue System
⏳ Processing Queue
    ↓ Provider Selection
📧 Mock Providers
    ↓ Circuit Breaker
⚡ Failure Protection
    ↓ Retry Logic
🔄 Exponential Backoff
    ↓ Status Update
📊 Metrics Collection
    ↓ Real-time Updates
📱 Dashboard Display
```

---

## 🏁 Quick Start

### Prerequisites

- Node.js v16+
- npm v8+
- Git
- Modern web browser

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/resilient-email-service.git
cd resilient-email-service

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Run backend and frontend in dev mode
npm run dev             # Starts backend on http://localhost:3001
cd frontend && npm start   # Starts frontend on http://localhost:3000
```

---

## 📬 API Reference

### Base URL

- Dev: `http://localhost:3001/api`

### Endpoints

#### ➕ Send Email

```http
POST /api/emails
```

**Body:**
```json
{
  "to": "recipient@example.com",
  "from": "sender@example.com",
  "subject": "Test Email",
  "body": "Hello World"
}
```

**Response:**
```json
{
  "message": "Email queued for sending",
  "data": {
    "id": "abc123",
    "status": "pending"
  }
}
```

#### 📥 Get Email Status

```http
GET /api/emails/:id
```

#### 📋 List All Emails

```http
GET /api/emails
```

#### 📈 System Metrics

```http
GET /api/metrics
```

#### 🏥 Health Check

```http
GET /api/health
```

---

## 🧪 Testing

### Run tests

```bash
npm test
```

### Coverage report

```bash
npm run test:coverage
```

---

## ⚙️ Configuration

Create a `.env` file in the root:

```env
PORT=3001
EMAIL_RATE_LIMIT=10
STATUS_RATE_LIMIT=60
QUEUE_PROCESS_INTERVAL=6000
CIRCUIT_FAILURE_THRESHOLD=5
CIRCUIT_TIMEOUT=60000
LOG_LEVEL=info
```

---

---

## 📊 Dashboard Metrics

View metrics at: `http://localhost:3000`

- ✅ Email sent/failed
- ✅ Queue length
- ✅ Response times
- ✅ Provider health
- ✅ Logs in real-time

---

## 📄 Assumptions

- Emails are simulated using mock providers.
- In-memory storage is used for queue/status (no database).
- Focus is on demonstrating **resilience patterns** and **SOLID design**.

---

## 🧠 Design Principles

- ✅ SOLID principles
- ✅ Clean separation of concerns
- ✅ Minimal external libraries
- ✅ Full TypeScript typing

---

## 🤝 Contributing

```bash
# Fork the repo
git clone https://github.com/yourusername/resilient-email-service.git
git checkout -b feature/awesome-feature
npm install
npm test
```




## 📞 Support

- Issues: [GitHub Issues](https://github.com/Abhishekkswamii/resilient-email-service/issues)
- Email: abhishekswami3330@gmail.com

---

> Built with ❤️ using TypeScript, Express.js, and React