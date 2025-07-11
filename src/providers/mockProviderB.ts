import { EmailRequest, EmailProvider } from '../models/email';
import logger from '../utils/logger';

export class MockProviderB implements EmailProvider {
  name = 'Mock Email Provider B';
  private failureRate = 0.2; // 20% failure rate
  private isDown = false;

  async sendEmail(email: EmailRequest): Promise<boolean> {
    logger.info(`${this.name} attempting to send email ${email.id}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800));
    
    // Simulate random failures
    if (Math.random() < this.failureRate || this.isDown) {
      logger.error(`${this.name} failed to send email ${email.id}`);
      throw new Error(`${this.name} service unavailable`);
    }
    
    logger.info(`${this.name} successfully sent email ${email.id}`);
    return true;
  }

  isHealthy(): boolean {
    return !this.isDown;
  }

  // Method to simulate provider going down
  setDown(down: boolean) {
    this.isDown = down;
  }
}
