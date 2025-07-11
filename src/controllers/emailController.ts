import { Request, Response } from 'express';
import { EmailService } from '../services/emailService';
import logger from '../utils/logger';

export class EmailController {
  constructor(private emailService: EmailService) {}

  sendEmail = async (req: Request, res: Response) => {
    try {
      const { to, from, subject, body } = req.body;

      if (!to || !from || !subject || !body) {
        return res.status(400).json({
          error: 'Missing required fields: to, from, subject, body'
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to) || !emailRegex.test(from)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      const result = await this.emailService.sendEmail({ to, from, subject, body });
      
      res.status(202).json({
        message: 'Email queued for sending',
        data: result
      });
    } catch (error) {
      logger.error('Error sending email:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getEmailStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const status = this.emailService.getEmailStatus(id);

      if (!status) {
        return res.status(404).json({
          error: 'Email not found'
        });
      }

      res.json({ data: status });
    } catch (error) {
      logger.error('Error getting email status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getAllEmails = async (req: Request, res: Response) => {
    try {
      const emails = this.emailService.getAllEmails();
      res.json({ data: emails });
    } catch (error) {
      logger.error('Error getting all emails:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getProviderStatus = async (req: Request, res: Response) => {
    try {
      const status = this.emailService.getProviderStatus();
      res.json({ data: status });
    } catch (error) {
      logger.error('Error getting provider status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getMetrics = async (req: Request, res: Response) => {
    try {
      const metrics = this.emailService.getMetrics();
      res.json({ data: metrics });
    } catch (error) {
      logger.error('Error getting metrics:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getSystemLogs = async (req: Request, res: Response) => {
    try {
      const logs = this.emailService.getSystemLogs();
      res.json({ data: logs });
    } catch (error) {
      logger.error('Error getting system logs:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };

  getServiceStatus = async (req: Request, res: Response) => {
    try {
      const status = this.emailService.getServiceStatus();
      res.json({ data: { status } });
    } catch (error) {
      logger.error('Error getting service status:', error);
      res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
}
