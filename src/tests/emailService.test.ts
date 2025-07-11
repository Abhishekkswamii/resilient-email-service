import { EmailService } from '../services/emailService';
import { MockProviderA } from '../providers/mockProviderA';
import { MockProviderB } from '../providers/mockProviderB';
import { EmailStatus } from '../models/email';

describe('EmailService', () => {
  let emailService: EmailService;
  let providerA: MockProviderA;
  let providerB: MockProviderB;

  beforeEach(() => {
    providerA = new MockProviderA();
    providerB = new MockProviderB();
    emailService = new EmailService([providerA, providerB]);
  });

  test('should queue email for sending', async () => {
    const emailData = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      body: 'This is a test email'
    };

    const result = await emailService.sendEmail(emailData);

    expect(result.id).toBeDefined();
    expect(result.status).toBe(EmailStatus.PENDING);
    expect(result.attempts).toBe(0);
  });

  test('should prevent duplicate emails (idempotency)', async () => {
    const emailData = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      body: 'This is a test email'
    };

    const result1 = await emailService.sendEmail(emailData);
    const result2 = await emailService.sendEmail(emailData);

    expect(result1.id).toBe(result2.id);
  });

  test('should return email status', async () => {
    const emailData = {
      to: 'test@example.com',
      from: 'sender@example.com',
      subject: 'Test Email',
      body: 'This is a test email'
    };

    const result = await emailService.sendEmail(emailData);
    const status = emailService.getEmailStatus(result.id);

    expect(status).toBeDefined();
    expect(status?.id).toBe(result.id);
  });

  test('should return provider status', () => {
    const status = emailService.getProviderStatus();

    expect(status).toHaveLength(2);
    expect(status[0].name).toBe('MockProviderA');
    expect(status[1].name).toBe('MockProviderB');
  });
});
