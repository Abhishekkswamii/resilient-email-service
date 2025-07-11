import { v4 as uuidv4 } from 'uuid';
import { EmailRequest, EmailResponse, EmailStatus, EmailProvider } from '../models/email';
import { CircuitBreaker } from '../utils/circuitBreaker';
import logger from '../utils/logger';

export interface EmailMetrics {
  totalSent: number;
  totalFailed: number;
  queueLength: number;
  successRate: number;
  averageResponseTime: number;
  requestsThisMinute: number;
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'error' | 'warn';
  message: string;
  service: string;
}

export class EmailService {
  private providers: EmailProvider[];
  private circuitBreakers: Map<string, CircuitBreaker>;
  private emailStore: Map<string, EmailResponse> = new Map();
  private idempotencyStore: Set<string> = new Set();
  private queue: EmailRequest[] = [];
  private isProcessing = false;
  private metrics: EmailMetrics = {
    totalSent: 0,
    totalFailed: 0,
    queueLength: 0,
    successRate: 0,
    averageResponseTime: 0,
    requestsThisMinute: 0
  };
  private systemLogs: SystemLog[] = [];
  private responseTimeHistory: number[] = [];
  private requestTimestamps: number[] = [];

  constructor(providers: EmailProvider[]) {
    this.providers = providers;
    this.circuitBreakers = new Map();
    
    providers.forEach(provider => {
      this.circuitBreakers.set(provider.name, new CircuitBreaker());
    });

    this.addSystemLog('info', 'EmailService initialized with providers: ' + providers.map(p => p.name).join(', '));
    this.processQueue();
    this.startMetricsCollection();
  }

  private addSystemLog(level: 'info' | 'error' | 'warn', message: string) {
    const log: SystemLog = {
      id: uuidv4(),
      timestamp: new Date(),
      level,
      message,
      service: 'EmailService'
    };
    
    this.systemLogs.unshift(log);
    if (this.systemLogs.length > 100) {
      this.systemLogs = this.systemLogs.slice(0, 100);
    }
    
    logger[level](message);
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }

  private updateMetrics() {
    const now = Date.now();
    
    // Clean old request timestamps (older than 1 minute)
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => now - timestamp < 60000);
    
    // Update metrics
    this.metrics.queueLength = this.queue.length;
    this.metrics.requestsThisMinute = this.requestTimestamps.length;
    
    // Calculate success rate
    const totalEmails = this.metrics.totalSent + this.metrics.totalFailed;
    this.metrics.successRate = totalEmails > 0 ? (this.metrics.totalSent / totalEmails) * 100 : 100;
    
    // Calculate average response time
    if (this.responseTimeHistory.length > 0) {
      this.metrics.averageResponseTime = this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length;
    }
  }

  async sendEmail(emailData: Omit<EmailRequest, 'id' | 'timestamp'>): Promise<EmailResponse> {
    const startTime = Date.now();
    this.requestTimestamps.push(startTime);
    
    const emailId = uuidv4();
    
    // Check for idempotency
    const idempotencyKey = this.generateIdempotencyKey(emailData);
    if (this.idempotencyStore.has(idempotencyKey)) {
      const existingEmail = Array.from(this.emailStore.values())
        .find(email => this.generateIdempotencyKey({
          to: emailData.to,
          from: emailData.from,
          subject: emailData.subject,
          body: emailData.body
        }) === idempotencyKey);
      
      if (existingEmail) {
        this.addSystemLog('info', `Duplicate email detected, returning existing response: ${existingEmail.id}`);
        return existingEmail;
      }
    }

    const email: EmailRequest = {
      id: emailId,
      ...emailData,
      timestamp: new Date()
    };

    const response: EmailResponse = {
      id: emailId,
      status: EmailStatus.PENDING,
      provider: '',
      attempts: 0,
      lastAttempt: new Date()
    };

    this.emailStore.set(emailId, response);
    this.idempotencyStore.add(idempotencyKey);
    this.queue.push(email);

    this.addSystemLog('info', `Email ${emailId} queued for sending to ${emailData.to}`);
    return response;
  }

  private async processQueue() {
    setInterval(async () => {
      if (this.isProcessing || this.queue.length === 0) return;
      
      this.isProcessing = true;
      const email = this.queue.shift();
      
      if (email) {
        await this.processEmail(email);
      }
      
      this.isProcessing = false;
    }, 1000);
  }

  private async processEmail(email: EmailRequest) {
    const startTime = Date.now();
    const response = this.emailStore.get(email.id);
    if (!response) return;

    response.status = EmailStatus.RETRYING;
    response.lastAttempt = new Date();

    for (const provider of this.providers) {
      const circuitBreaker = this.circuitBreakers.get(provider.name);
      if (!circuitBreaker) continue;

      try {
        response.attempts++;
        response.provider = provider.name;
        
        await circuitBreaker.execute(async () => {
          return await this.sendWithRetry(email, provider);
        });

        response.status = EmailStatus.SENT;
        this.metrics.totalSent++;
        
        const responseTime = Date.now() - startTime;
        this.responseTimeHistory.push(responseTime);
        if (this.responseTimeHistory.length > 100) {
          this.responseTimeHistory = this.responseTimeHistory.slice(-100);
        }
        
        this.addSystemLog('info', `Email ${email.id} sent successfully via ${provider.name} in ${responseTime}ms`);
        return;

      } catch (error) {
        this.addSystemLog('error', `Provider ${provider.name} failed for email ${email.id}: ${error}`);
        response.error = error instanceof Error ? error.message : 'Unknown error';
        
        if (response.attempts >= 3) {
          continue;
        }
      }
    }

    response.status = EmailStatus.FAILED;
    this.metrics.totalFailed++;
    this.addSystemLog('error', `All providers failed for email ${email.id}`);
  }

  private async sendWithRetry(email: EmailRequest, provider: EmailProvider, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await provider.sendEmail(email);
        return true;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        this.addSystemLog('warn', `Retrying email ${email.id} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }

  private generateIdempotencyKey(emailData: Omit<EmailRequest, 'id' | 'timestamp'>): string {
    return `${emailData.to}-${emailData.from}-${emailData.subject}-${emailData.body}`;
  }

  getEmailStatus(id: string): EmailResponse | undefined {
    return this.emailStore.get(id);
  }

  getAllEmails(): EmailResponse[] {
    return Array.from(this.emailStore.values()).sort((a, b) => 
      new Date(b.lastAttempt).getTime() - new Date(a.lastAttempt).getTime()
    );
  }

  getProviderStatus() {
    return this.providers.map(provider => ({
      name: provider.name,
      healthy: provider.isHealthy(),
      circuitState: this.circuitBreakers.get(provider.name)?.getState(),
      responseTime: Math.floor(Math.random() * 200) + 50 // Mock response time
    }));
  }

  getMetrics(): EmailMetrics {
    return { ...this.metrics };
  }

  getSystemLogs(): SystemLog[] {
    return [...this.systemLogs];
  }

  getServiceStatus(): 'Active' | 'Inactive' | 'Degraded' {
    const healthyProviders = this.providers.filter(p => p.isHealthy()).length;
    if (healthyProviders === this.providers.length) return 'Active';
    if (healthyProviders > 0) return 'Degraded';
    return 'Inactive';
  }
}
