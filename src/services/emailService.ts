import { v4 as uuidv4 } from 'uuid';
import { EmailRequest, EmailResponse, EmailStatus, EmailProvider } from '../models/email';
import { CircuitBreaker } from '../utils/circuitBreaker';
import logger from '../utils/logger';

export class EmailService {
  private providers: EmailProvider[];
  private circuitBreakers: Map<string, CircuitBreaker>;
  private emailStore: Map<string, EmailResponse> = new Map();
  private idempotencyStore: Set<string> = new Set();
  private queue: EmailRequest[] = [];
  private isProcessing = false;

  constructor(providers: EmailProvider[]) {
    this.providers = providers;
    this.circuitBreakers = new Map();
    
    providers.forEach(provider => {
      this.circuitBreakers.set(provider.name, new CircuitBreaker());
    });

    // Start queue processing
    this.processQueue();
  }

  async sendEmail(emailData: Omit<EmailRequest, 'id' | 'timestamp'>): Promise<EmailResponse> {
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
        logger.info(`Duplicate email detected, returning existing response: ${existingEmail.id}`);
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

    logger.info(`Email ${emailId} queued for sending`);
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
        logger.info(`Email ${email.id} sent successfully via ${provider.name}`);
        return;

      } catch (error) {
        logger.error(`Provider ${provider.name} failed for email ${email.id}: ${error}`);
        response.error = error instanceof Error ? error.message : 'Unknown error';
        
        if (response.attempts >= 3) {
          continue; // Try next provider
        }
      }
    }

    // All providers failed
    response.status = EmailStatus.FAILED;
    logger.error(`All providers failed for email ${email.id}`);
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
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        logger.info(`Retrying email ${email.id} in ${delay}ms (attempt ${attempt}/${maxRetries})`);
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
    return Array.from(this.emailStore.values());
  }

  getProviderStatus() {
    return this.providers.map(provider => ({
      name: provider.name,
      healthy: provider.isHealthy(),
      circuitState: this.circuitBreakers.get(provider.name)?.getState()
    }));
  }
}
