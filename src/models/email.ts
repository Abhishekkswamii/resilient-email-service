export interface EmailRequest {
  id: string;
  to: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface EmailResponse {
  id: string;
  status: 'sent' | 'failed' | 'pending' | 'retrying';
  provider: string;
  attempts: number;
  lastAttempt: Date;
  error?: string;
}

export enum EmailStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRYING = 'retrying'
}

export interface EmailProvider {
  name: string;
  sendEmail(email: EmailRequest): Promise<boolean>;
  isHealthy(): boolean;
}
